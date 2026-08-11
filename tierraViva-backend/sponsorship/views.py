import stripe
import json
from django.db.models import F, Q
from django.conf import settings
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import permissions
from rest_framework.response import Response
from .models import SponsorshipTier, Sponsorship, RanchUpdate, RanchUpdateTag
from .utils import get_checkout_session
from .serializers import RanchUpdateSerializer, SponsorshipTierSerializer, RanchUpdateTagSerializer, SponsorshipSerializer

stripe.api_key = settings.STRIPE_SECRET_KEY

from rest_framework import viewsets
from config.permissions import IsStaffOrReadOnly

class SponsorshipTierViewSet(viewsets.ModelViewSet):
    queryset = SponsorshipTier.objects.all().order_by('level')
    serializer_class = SponsorshipTierSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsStaffOrReadOnly()]

    def get_queryset(self):
        user = self.request.user
        if user and user.is_authenticated and (user.is_staff or user.role in ['ADMIN', 'FAMILY']):
            return SponsorshipTier.objects.all().order_by('level')
        return SponsorshipTier.objects.filter(is_active=True).order_by('level')

class RanchUpdateTagListView(APIView):
    def get(self, request):
        tags = RanchUpdateTag.objects.all().order_by('name')
        serializer = RanchUpdateTagSerializer(tags, many=True)
        return Response(serializer.data)

class CreateCheckoutSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        tier_id = request.data.get('tier_id')
        animal_id = request.data.get('animal_id')
        is_annual = request.data.get('is_annual', False)
        success_url = request.data.get('success_url', f"{settings.FRONTEND_URL}/success")
        cancel_url = request.data.get('cancel_url', f"{settings.FRONTEND_URL}/cancel")

        try:
            tier = SponsorshipTier.objects.get(id=tier_id)
            session = get_checkout_session(request.user, tier, success_url, cancel_url, animal_id, is_annual)
            return Response({'checkout_url': session.url})
        except SponsorshipTier.DoesNotExist:
            return Response({'error': 'Tier not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=400)

@csrf_exempt
def stripe_webhook(request):
    import logging
    logger = logging.getLogger("apps")
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    endpoint_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', None)

    if not sig_header or not endpoint_secret:
        logger.error("[Webhook] Stripe signature header missing or STRIPE_WEBHOOK_SECRET unconfigured.")
        return HttpResponse("Signature or webhook secret missing", status=400)

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        logger.error(f"[Webhook] Invalid payload: {e}")
        return HttpResponse("Invalid payload", status=400)
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"[Webhook] Signature verification failed: {e}")
        return HttpResponse("Signature verification failed", status=400)
    except Exception as e:
        logger.error(f"[Webhook] Unexpected error constructing event: {e}", exc_info=True)
        return HttpResponse("Event error", status=400)

    # Idempotency check: prevent duplicate Stripe event processing
    from .models import StripeEvent
    event_id = event.get('id')
    if event_id:
        if StripeEvent.objects.filter(event_id=event_id).exists():
            return HttpResponse("Event already processed", status=200)
        try:
            StripeEvent.objects.create(event_id=event_id)
        except Exception as exc:
            import logging
            logging.getLogger("apps").warning(f"[Webhook] Event {event_id} duplicate or conflict: {exc}")
            return HttpResponse("Event processing in progress", status=200)

    # Handle the event types
    if event['type'] in ['checkout.session.completed', 'payment_intent.succeeded']:
        session = event['data']['object']
        handle_successful_payment(session)
    elif event['type'] in ['payment_intent.payment_failed', 'checkout.session.expired']:
        session = event['data']['object']
        handle_failed_payment(session)
    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        handle_subscription_deleted(subscription)
    elif event['type'] == 'customer.subscription.updated':
        subscription = event['data']['object']
        handle_subscription_updated(subscription)

    return HttpResponse(status=200)

def handle_failed_payment(session):
    session_id = session.get('id')
    payment_intent_id = session.get('payment_intent')
    import logging
    logger = logging.getLogger("apps")
    logger.info(f"[Webhook] Payment failed or expired for session={session_id}, payment_intent={payment_intent_id}")

    from shop.models import Order
    from activities.models import Booking
    from sponsorship.models import Sponsorship
    
    if session_id:
        Order.objects.filter(stripe_payment_intent=session_id, status='PENDING').update(status='CANCELLED')
        Booking.objects.filter(stripe_payment_intent=session_id, status='PENDING').update(status='CANCELLED')
        Sponsorship.objects.filter(stripe_payment_intent=session_id, active=True).update(active=False)
    if payment_intent_id:
        Order.objects.filter(stripe_payment_intent=payment_intent_id, status='PENDING').update(status='CANCELLED')
        Booking.objects.filter(stripe_payment_intent=payment_intent_id, status='PENDING').update(status='CANCELLED')
        Sponsorship.objects.filter(stripe_payment_intent=payment_intent_id, active=True).update(active=False)

def handle_subscription_deleted(subscription):
    sub_id = subscription.get('id')
    import logging
    logger = logging.getLogger("apps")
    if sub_id:
        from sponsorship.models import Sponsorship
        try:
            sponsorships = Sponsorship.objects.filter(stripe_subscription_id=sub_id, active=True)
            if sponsorships.exists():
                sponsorships.update(active=False)
                logger.info(f"[Webhook] Subscription {sub_id} deleted. Sponsorships deactivated.")
            else:
                logger.info(f"[Webhook] Subscription {sub_id} deleted but no active sponsorship found in DB.")
        except Exception as e:
            logger.error(f"[Webhook] Error processing customer.subscription.deleted for {sub_id}: {e}")

def handle_subscription_updated(subscription):
    sub_id = subscription.get('id')
    status = subscription.get('status')
    import logging
    logger = logging.getLogger("apps")
    if sub_id:
        from sponsorship.models import Sponsorship
        try:
            is_active = status in ['active', 'trialing']
            sponsorships = Sponsorship.objects.filter(stripe_subscription_id=sub_id)
            if sponsorships.exists():
                sponsorships.update(active=is_active)
                logger.info(f"[Webhook] Subscription {sub_id} updated to status={status}. Sponsorships active state set to {is_active}.")
        except Exception as e:
            logger.error(f"[Webhook] Error processing customer.subscription.updated for {sub_id}: {e}")

def handle_successful_payment(session):
    import logging
    logger = logging.getLogger("apps")

    metadata = session.get('metadata', {})
    session_id = session.get('id')

    # Security check/Metadata recovery pattern
    if not metadata and (session.get('object') == 'payment_intent' or (session_id and session_id.startswith('pi_'))):
        try:
            sessions = stripe.checkout.Session.list(payment_intent=session_id, limit=1)
            if sessions and sessions.data:
                checkout_session = sessions.data[0]
                metadata = checkout_session.get('metadata', {})
                session_id = checkout_session.id
        except Exception as e:
            logger.error(f"[Webhook] Error retrieving Stripe checkout session for payment intent {session_id}: {e}")

    user_id = metadata.get('user_id')
    
    # Handle Shop Order
    order_id = metadata.get('order_id')
    if order_id:
        from shop.models import Order
        from django.db import transaction
        try:
            with transaction.atomic():
                order = Order.objects.select_for_update().get(id=order_id)
                order.complete_payment(session.get('payment_intent') or session.get('id'))
            return
        except Order.DoesNotExist:
            logger.error(f"Order {order_id} not found")

    # Handle Activity Booking
    booking_id = metadata.get('booking_id')
    if booking_id:
        from activities.models import Booking
        from django.db import transaction
        from django.db.models import F
        try:
            with transaction.atomic():
                booking = Booking.objects.select_for_update().get(id=booking_id)
                if booking.status != 'PAID':
                    booking.status = 'PAID'
                    booking.stripe_payment_intent = session.get('payment_intent') or session.get('id')
                    booking.save()
                    
                    # Reduce capacity
                    activity = booking.activity
                    activity.remaining_capacity = F('remaining_capacity') - booking.tickets
                    activity.save()
                    
                    # Trigger ticket delivery on commit
                    from activities.utils import send_booking_ticket_email
                    transaction.on_commit(lambda: send_booking_ticket_email(booking))
            return
        except Booking.DoesNotExist:
            logger.error(f"Booking {booking_id} not found")
        except Exception as e:
            logger.error(f"Error updating booking {booking_id}: {e}")

    # Handle Sponsorship
    tier_id = metadata.get('tier_id')
    animal_id = metadata.get('animal_id')
    billing_cycle = metadata.get('billing_cycle', 'MONTHLY')
    
    from users.models import User
    from animals.models import Animal
    
    try:
        user = User.objects.get(id=user_id)
        if tier_id:
            tier = SponsorshipTier.objects.get(id=tier_id)
            animal = None
            if animal_id:
                animal = Animal.objects.get(id=animal_id)
            
            sub_id = session.get('subscription')
            pi_id = session.get('payment_intent') or session.get('id')
            
            from django.db import transaction
            with transaction.atomic():
                # Prevent duplicate sponsorships within transaction lock
                if sub_id and Sponsorship.objects.filter(stripe_subscription_id=sub_id).exists():
                    logger.info(f"Sponsorship with subscription {sub_id} already exists")
                    return
                if pi_id and Sponsorship.objects.filter(stripe_payment_intent=pi_id).exists():
                    logger.info(f"Sponsorship with payment intent {pi_id} already exists")
                    return
                
                Sponsorship.objects.create(
                    user=user,
                    animal=animal,
                    tier=tier,
                    billing_cycle=billing_cycle,
                    amount=tier.price_annual if billing_cycle == 'ANNUAL' else tier.price,
                    stripe_subscription_id=sub_id,
                    stripe_payment_intent=pi_id,
                    active=True
                )
                logger.info(f"[Webhook] Created Sponsorship for user={user.id}, tier={tier.id}")
    except Exception as e:
        logger.error(f"Error handling webhook payment for user_id={user_id}: {e}", exc_info=True)


class RanchUpdateViewSet(viewsets.ModelViewSet):
    queryset = RanchUpdate.objects.all()
    serializer_class = RanchUpdateSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsStaffOrReadOnly()]

    def get_queryset(self):
        user = self.request.user
        if user and user.is_authenticated and (user.is_staff or user.role in ['ADMIN', 'FAMILY']):
            queryset = RanchUpdate.objects.all()
        else:
            max_level = 0
            if user and user.is_authenticated:
                active_sponsorships = Sponsorship.objects.filter(user=user, active=True)
                for s in active_sponsorships:
                    if s.tier and s.tier.level > max_level:
                        max_level = s.tier.level
            queryset = RanchUpdate.objects.filter(min_tier_level__lte=max_level)

        # Apply Search
        search_query = self.request.query_params.get('search')
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) | 
                Q(content__icontains=search_query)
            )
            
        # Apply Tag Filter
        tag_slug = self.request.query_params.get('tag')
        if tag_slug:
            queryset = queryset.filter(tags__slug=tag_slug)
            
        return queryset.distinct().order_by('-created_at')


class UserSponsorshipsListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sponsorships = Sponsorship.objects.filter(user=request.user, active=True)
        serializer = SponsorshipSerializer(sponsorships, many=True)
        return Response(serializer.data)
