from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from .models import Subscriber

def send_newsletter_alert(subject, title, description, link, image_url=None):
    """
    Sends a professional HTML alert to all active newsletter subscribers.
    Uses BCC for efficiency and privacy.
    """
    subscribers = Subscriber.objects.filter(is_active=True)
    recipient_list = [s.email for s in subscribers]
    
    if not recipient_list:
        return

    # 1. Prepare HTML Content
    html_content = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #2D5A27;">¡Hola! Hay algo nuevo en Tierra Viva 🌿</h2>
        <h3>{title}</h3>
        {f'<img src="{image_url}" style="width: 100%; border-radius: 10px; margin-bottom: 20px;">' if image_url else ''}
        <p style="color: #666; line-height: 1.6;">{description}</p>
        <br>
        <a href="{settings.FRONTEND_URL}{link}" style="background: #2D5A27; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Ver más detalles</a>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #999;">Has recibido este correo porque estás suscrito al Newsletter de Tierra Viva. <br> Si deseas dejar de recibir estos correos, puedes hacerlo desde tu perfil.</p>
    </div>
    """

    # 2. Send Email
    message = EmailMultiAlternatives(
        subject,
        strip_tags(html_content),
        settings.DEFAULT_FROM_EMAIL,
        bcc=recipient_list # Using BCC to avoid exposing emails
    )
    message.attach_alternative(html_content, "text/html")
    message.send(fail_silently=True)
