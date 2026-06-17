from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.exceptions import ValidationError
from .models import Subscriber
from .serializers import SubscriberSerializer
from .utils import send_welcome_email

class SubscriberViewSet(viewsets.ModelViewSet):
    queryset = Subscriber.objects.all()
    serializer_class = SubscriberSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        subscriber = serializer.save()
        send_welcome_email(subscriber.id)

class UnsubscribeView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, token):
        try:
            subscriber = Subscriber.objects.get(unsubscribe_token=token)
            if not subscriber.is_active:
                return Response(
                    {"detail": "Ya te habías desuscrito del newsletter.", "email": subscriber.email},
                    status=status.HTTP_200_OK
                )
            subscriber.is_active = False
            subscriber.save()
            return Response(
                {"detail": "Te has desuscrito con éxito del newsletter.", "email": subscriber.email},
                status=status.HTTP_200_OK
            )
        except (ValueError, ValidationError, Subscriber.DoesNotExist):
            return Response(
                {"detail": "Token inválido o expirado."},
                status=status.HTTP_404_NOT_FOUND
            )
