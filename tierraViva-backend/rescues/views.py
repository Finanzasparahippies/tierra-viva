from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import RescueRequest
from .serializers import RescueRequestSerializer

class RescueRequestViewSet(viewsets.ModelViewSet):
    queryset = RescueRequest.objects.all()
    serializer_class = RescueRequestSerializer

    def get_permissions(self):
        if self.action in ['create', 'contact']:
            # Anyone can report a rescue or submit contact form
            return [permissions.AllowAny()]
        elif self.action in ['list', 'retrieve']:
            # Anyone can view
            return [permissions.AllowAny()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            # Only Admins and Family can manage existing rescues
            return [permissions.IsAdminUser()]
        return super().get_permissions()

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return RescueRequest.objects.none()

        if user.is_staff or user.role == 'ADMIN' or user.role == 'FAMILY':
            return RescueRequest.objects.all()

        return RescueRequest.objects.filter(user=user)

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save()

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def contact(self, request):
        name = request.data.get('name')
        email = request.data.get('email')
        phone = request.data.get('phone')
        comment = request.data.get('comment')
        
        if not all([name, email, comment]):
            return Response(
                {"error": "Nombre, correo y comentario son obligatorios."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Send email to soporte@tierraviva.com.mx
        from django.core.mail import EmailMultiAlternatives
        from django.utils.html import strip_tags
        from django.conf import settings
        import threading
        import logging
        
        logger = logging.getLogger(__name__)
        
        subject = f"✉️ Nuevo mensaje de contacto (Rescues): {name}"
        html_content = f"""
        <html>
          <body style="font-family: sans-serif; color: #333; line-height: 1.6;">
            <h2>Nuevo Mensaje de Contacto - Sección de Rescates</h2>
            <p><strong>Nombre:</strong> {name}</p>
            <p><strong>Correo:</strong> {email}</p>
            <p><strong>Teléfono:</strong> {phone or 'No proporcionado'}</p>
            <p><strong>Comentario:</strong></p>
            <div style="background: #f9f9f9; border-left: 4px solid #2D5A27; padding: 15px; margin: 15px 0;">
                {comment}
            </div>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 11px; color: #999;">Este correo fue generado automáticamente por el sitio web de Tierra Viva.</p>
          </body>
        </html>
        """
        text_content = strip_tags(html_content)
        
        def _send_email():
            try:
                msg = EmailMultiAlternatives(
                    subject,
                    text_content,
                    settings.DEFAULT_FROM_EMAIL,
                    ["soporte@tierraviva.com.mx"]
                )
                msg.attach_alternative(html_content, "text/html")
                msg.send(fail_silently=False)
                logger.info(f"Contact email successfully sent to soporte@tierraviva.com.mx from {email}")
            except Exception as e:
                logger.error(f"Error sending contact email from {email}: {e}")
                
        threading.Thread(target=_send_email, daemon=True).start()
        
        return Response({"message": "Comentario enviado con éxito."}, status=status.HTTP_200_OK)
