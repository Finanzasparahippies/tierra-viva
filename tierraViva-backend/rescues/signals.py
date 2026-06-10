from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from .models import RescueRequest, RescuerContact

@receiver(post_save, sender=RescueRequest)
def send_rescue_notifications(sender, instance, created, **kwargs):
    if created:
        # 1. Fetch all active rescuers
        rescuers = RescuerContact.objects.filter(is_active=True)
        recipient_list = [rescuers.email for rescuers in rescuers]
        
        # Add the main admin email as fallback if needed
        master_email = "tierraviva.raiz@gmail.com"
        if master_email not in recipient_list:
            recipient_list.append(master_email)

        # 2. Prepare Context for Email
        context = {
            'rescue': instance,
            'animal_display': instance.get_animal_type_display(),
            'admin_url': f"{settings.FRONTEND_URL}/admin/rescues/rescuerequest/{instance.id}/change/"
        }

        # 3. Notify Rescuers (HTML Template)
        subject_admin = f"🚨 NUEVO RESCATE: {instance.get_animal_type_display()} en {instance.address}"
        html_content_admin = f"""
        <h2>Nuevo Reporte de Rescate Recibido</h2>
        <p><strong>Especie:</strong> {instance.get_animal_type_display()} {f'({instance.other_species})' if instance.other_species else ''}</p>
        <p><strong>Ubicación:</strong> {instance.address}</p>
        <p><strong>Teléfono:</strong> {instance.phone}</p>
        <p><strong>Correo:</strong> {instance.email or 'No proporcionado'}</p>
        <p><strong>Descripción:</strong> {instance.description}</p>
        <hr>
        <p>Ver en el Panel de Administración: <a href="https://tierraviva.com.mx/admin/rescues/rescuerequest/{instance.id}/change/">Gestionar Rescute</a></p>
        """
        
        email_admin = EmailMultiAlternatives(
            subject_admin,
            strip_tags(html_content_admin),
            settings.DEFAULT_FROM_EMAIL,
            recipient_list
        )
        email_admin.attach_alternative(html_content_admin, "text/html")
        email_admin.send(fail_silently=False)

        # 4. Notify User (Confirmation)
        if instance.email:
            subject_user = f"Confirmación de Solicitud de Ayuda - Tierra Viva"
            html_content_user = f"""
            <h2>¡Hola! Hemos recibido tu reporte.</h2>
            <p>Gracias por contactar a la Red de Rescate de Tierra Viva. Hemos recibido tu solicitud para ayudar a: <strong>{instance.get_animal_type_display()}</strong>.</p>
            <p>Nuestro equipo de rescatistas revisará la ubicación y los detalles que nos compartiste (<strong>{instance.address}</strong>) y nos pondremos en contacto contigo lo antes posible al teléfono <strong>{instance.phone}</strong>.</p>
            <br>
            <p>Saludos,<br>El equipo de Tierra Viva</p>
            """
            
            email_user = EmailMultiAlternatives(
                subject_user,
                strip_tags(html_content_user),
                settings.DEFAULT_FROM_EMAIL,
                [instance.email]
            )
            email_user.attach_alternative(html_content_user, "text/html")
            email_user.send(fail_silently=True)
