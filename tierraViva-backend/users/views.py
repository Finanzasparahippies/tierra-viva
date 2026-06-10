from django.db import models
from rest_framework import viewsets, status
from .models import User
from .serializers import (
    UserSerializer, 
    PasswordResetRequestSerializer, 
    PasswordResetConfirmSerializer
)
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        if self.action in ['me', 'team', 'password_reset_request', 'password_reset_confirm']:
            if self.action in ['team', 'password_reset_request', 'password_reset_confirm']:
                return [AllowAny()]
            return [IsAuthenticated()]
        if self.action == 'create':
            return [AllowAny()]
        return [IsAdminUser()]

    @action(detail=False, methods=['get'])
    def team(self, request):
        team_members = User.objects.filter(
            models.Q(is_staff=True) | models.Q(role="ADMIN")
        ).select_related('family_profile').order_by('id')
        serializer = self.get_serializer(team_members, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get', 'put', 'patch'])
    def me(self, request):
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def password_reset_request(self, request):
        import logging
        logger = logging.getLogger(__name__)
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        
        reset_url = None
        try:
            user = User.objects.get(email=email)
            token = default_token_generator.make_token(user)
            uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
            
            # Use FRONTEND_URL from settings, or fall back to the request's origin if it's production
            frontend_url = settings.FRONTEND_URL.rstrip('/')
            reset_url = f"{frontend_url}/reset-password?uidb64={uidb64}&token={token}"
            
            logger.info("=========================================")
            logger.info(f"SOLICITUD DE RECUPERACIÓN DE CONTRASEÑA")
            logger.info(f"Usuario: {user.email}")
            logger.info(f"Enlace de reinicio: {reset_url}")
            logger.info("=========================================")
            print("\n=========================================")
            print(f"SOLICITUD DE RECUPERACIÓN DE CONTRASEÑA")
            print(f"Usuario: {user.email}")
            print(f"Enlace de reinicio: {reset_url}")
            print("=========================================\n")

            subject = "Recuperación de contraseña - Tierra Viva"
            message = f"Hola {user.first_name or user.username},\n\nHaz clic en el siguiente enlace para restablecer tu contraseña:\n\n{reset_url}\n\nSi no solicitaste este cambio, puedes ignorar este correo."
            
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
        except User.DoesNotExist:
            # We return 200 even if the user doesn't exist for security (avoid enumeration)
            pass
            
        response_data = {"detail": "Si el correo existe en nuestro sistema, recibirás instrucciones en breve."}
        if settings.DEBUG and reset_url:
            response_data["_dev_reset_url"] = reset_url
            response_data["_dev_info"] = "DEBUG Mode: Enlace retornado directamente en la respuesta JSON para pruebas locales."
            
        return Response(response_data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def password_reset_confirm(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        uidb64 = serializer.validated_data['uidb64']
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']
        
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
            
            if default_token_generator.check_token(user, token):
                user.set_password(new_password)
                user.save()
                return Response({"detail": "Tu contraseña ha sido restablecida con éxito."}, status=status.HTTP_200_OK)
            else:
                return Response({"detail": "El enlace ha expirado o es inválido."}, status=status.HTTP_400_BAD_REQUEST)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"detail": "Solicitud inválida."}, status=status.HTTP_400_BAD_REQUEST)
