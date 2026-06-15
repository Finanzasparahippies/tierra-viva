import stripe
from django.conf import settings
from django.utils import timezone
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Activity, Booking
from .serializers import ActivitySerializer, BookingSerializer

stripe.api_key = settings.STRIPE_SECRET_KEY

class ActivityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Activity.objects.filter(is_active=True)
    serializer_class = ActivitySerializer
    lookup_field = 'slug'

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def checkout(self, request, slug=None):
        activity = self.get_object()
        tickets = int(request.data.get('tickets', 1))

        if activity.remaining_capacity < tickets:
            return Response({"error": "No hay suficiente cupo disponible"}, status=status.HTTP_400_BAD_REQUEST)

        total_price = activity.price * tickets

        # 1. Create a Pending Booking
        booking = Booking.objects.create(
            user=request.user,
            activity=activity,
            tickets=tickets,
            total_price=total_price,
            status='PENDING'
        )

        # Determine whether to use Stripe real or mock
        use_mock = False
        if getattr(settings, 'TESTING', False):
            use_mock = True
        else:
            stripe_key = getattr(settings, 'STRIPE_SECRET_KEY', '')
            webhook_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', '')
            
            placeholder_patterns = ['change_me', 'replace_me', 'test_mock', 'placeholder', 'your_']
            no_key = not stripe_key
            bad_key = any(p in stripe_key for p in placeholder_patterns)
            no_webhook = not webhook_secret or any(p in webhook_secret for p in placeholder_patterns)
            if no_key or bad_key or no_webhook:
                use_mock = True

        session_id = None
        session_url = None

        if not use_mock:
            try:
                # 2. Create Stripe Checkout Session
                checkout_session = stripe.checkout.Session.create(
                    payment_method_types=['card'],
                    line_items=[{
                        'price_data': {
                            'currency': 'mxn',
                            'product_data': {
                                'name': f"{activity.title} ({activity.get_activity_type_display()})",
                                'description': f"Reserva para {tickets} personas el {activity.date}",
                            },
                            'unit_amount': int(activity.price * 100),
                        },
                        'quantity': tickets,
                    }],
                    mode='payment',
                    success_url=f"{settings.FRONTEND_URL}/activities/success?booking_id={booking.id}",
                    cancel_url=f"{settings.FRONTEND_URL}/activities/cancel",
                    customer_email=request.user.email,
                    metadata={
                        'booking_id': booking.id,
                        'type': 'activity_booking'
                    }
                )
                
                # Save the Session ID/PI for later verification
                booking.stripe_payment_intent = checkout_session.id
                booking.save()
                
                session_id = checkout_session.id
                session_url = checkout_session.url
            except Exception as e:
                booking.status = 'CANCELLED'
                booking.save()
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            import uuid
            import threading
            from activities.utils import send_booking_ticket_email
            
            mock_session_id = f"mock_{uuid.uuid4().hex}"
            booking.stripe_payment_intent = mock_session_id
            booking.status = 'PAID'
            booking.save()
            
            # Reduce capacity
            activity.remaining_capacity = activity.remaining_capacity - tickets
            activity.save()
            
            session_id = mock_session_id
            session_url = f"{settings.FRONTEND_URL}/activities/success?booking_id={booking.id}&success=true&session_id={mock_session_id}"
            
            # Synchronous delivery in background thread to avoid blocking client
            def deliver_booking():
                try:
                    send_booking_ticket_email(booking)
                except Exception as exc:
                    import logging
                    logging.getLogger("apps").error(f"[Mock] Error delivering ticket email: {exc}", exc_info=True)
            
            threading.Thread(target=deliver_booking, daemon=False, name=f"booking-delivery-{mock_session_id[:8]}").start()

        return Response({'id': session_id, 'url': session_url})

class BookingViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = BookingSerializer

    def get_permissions(self):
        if self.action == 'validate':
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return Booking.objects.all()
        return Booking.objects.filter(user=user)

    @action(detail=False, methods=['post'], url_path='validate')
    def validate(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'error': 'Token QR no proporcionado'}, status=400)
        
        try:
            booking = Booking.objects.get(token=token)
            
            if booking.status != 'PAID':
                return Response({
                    'status': 'error',
                    'message': 'Esta reserva no ha sido pagada todavía.'
                }, status=400)
                
            if booking.is_scanned:
                return Response({
                    'status': 'already_used',
                    'message': f'Boleto ya escaneado el {booking.scanned_at.strftime("%d/%m %H:%M")}',
                    'scanned_at': booking.scanned_at
                }, status=400)
                
            # Validar y marcar
            booking.is_scanned = True
            booking.scanned_at = timezone.now()
            booking.save()
            
            return Response({
                'status': 'success',
                'message': 'Acceso Permitido',
                'activity': booking.activity.title,
                'tickets': booking.tickets,
                'user': booking.user.email
            })
            
        except Booking.DoesNotExist:
            return Response({'error': 'Boleto Inválido o Falsificado'}, status=404)
