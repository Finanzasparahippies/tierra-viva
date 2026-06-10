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
from .serializers import RanchUpdateSerializer, SponsorshipTierSerializer, RanchUpdateTagSerializer

stripe.api_key = settings.STRIPE_SECRET_KEY

class SponsorshipTierListView(APIView):
    def get(self, request):
        tiers = SponsorshipTier.objects.all().order_by('level')
        serializer = SponsorshipTierSerializer(tiers, many=True)
        return Response(serializer.data)

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
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError:
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError:
        return HttpResponse(status=400)

    # Idempotency check: prevent duplicate Stripe event processing
    from .models import StripeEvent
    event_id = event.get('id')
    if event_id:
        if StripeEvent.objects.filter(event_id=event_id).exists():
            return HttpResponse("Event already processed", status=200)
        try:
            StripeEvent.objects.create(event_id=event_id)
        except Exception:
            return HttpResponse("Event processing in progress", status=200)

    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        handle_successful_payment(session)

    return HttpResponse(status=200)

def handle_successful_payment(session):
    metadata = session.get('metadata', {})
    user_id = metadata.get('user_id')
    
    # Handle Shop Order
    order_id = metadata.get('order_id')
    if order_id:
        from shop.models import Order
        from django.db import transaction
        try:
            with transaction.atomic():
                order = Order.objects.select_for_update().get(id=order_id)
                order.complete_payment(session.get('payment_intent'))
            return
        except Order.DoesNotExist:
            print(f"Order {order_id} not found")

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
                    booking.stripe_payment_intent = session.get('payment_intent')
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
            print(f"Booking {booking_id} not found")
        except Exception as e:
            print(f"Error updating booking {booking_id}: {e}")

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
            pi_id = session.get('payment_intent')
            
            # Prevent duplicate sponsorships
            if sub_id and Sponsorship.objects.filter(stripe_subscription_id=sub_id).exists():
                print(f"Sponsorship with subscription {sub_id} already exists")
                return
            if pi_id and Sponsorship.objects.filter(stripe_payment_intent=pi_id).exists():
                print(f"Sponsorship with payment intent {pi_id} already exists")
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
    except Exception as e:
        print(f"Error handling webhook payment: {e}")


class RanchUpdateListView(APIView):
    # Allow anonymous users to see Tier 0 updates
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # Default level is 0 for anonymous or non-sponsors
        max_level = 0
        
        if request.user.is_authenticated:
            # Get user's max tier level
            active_sponsorships = Sponsorship.objects.filter(user=request.user, active=True)
            for s in active_sponsorships:
                if s.tier and s.tier.level > max_level:
                    max_level = s.tier.level
            
        # Base queryset filtered by level
        queryset = RanchUpdate.objects.filter(min_tier_level__lte=max_level)
        
        # Apply Search
        search_query = request.query_params.get('search')
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) | 
                Q(content__icontains=search_query)
            )
            
        # Apply Tag Filter
        tag_slug = request.query_params.get('tag')
        if tag_slug:
            queryset = queryset.filter(tags__slug=tag_slug)
            
        updates = queryset.distinct().order_by('-created_at')
        serializer = RanchUpdateSerializer(updates, many=True)
        return Response(serializer.data)
