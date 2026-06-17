import logging
import threading
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from django.conf import settings
from .models import Subscriber

logger = logging.getLogger(__name__)

def _send_emails_thread(subject, title, description, link, image_url):
    """
    Background worker to send newsletter alerts individually.
    This prevents blocking the request and allows personalized unsubscribe links.
    """
    subscribers = Subscriber.objects.filter(is_active=True)
    if not subscribers.exists():
        logger.info("No active subscribers found for newsletter alert.")
        return

    logger.info(f"Starting background email alert dispatch to {subscribers.count()} subscribers.")

    for sub in subscribers:
        unsubscribe_url = f"{settings.FRONTEND_URL}/newsletter/unsubscribe?token={sub.unsubscribe_token}"

        # Beautiful Premium HTML layout for Tierra Viva
        html_content = f"""
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
              body, table, td, a {{
                font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
              }}
            </style>
          </head>
          <body style="background-color: #F3F6F3; color: #1C331E; font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px 20px; margin: 0; -webkit-font-smoothing: antialiased;">
            <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E2E8F0; padding: 40px; border-radius: 24px; box-shadow: 0 10px 30px rgba(45, 90, 39, 0.05);">
              
              <!-- Header/Logo -->
              <div style="text-align: center; margin-bottom: 30px;">
                <span style="font-size: 32px;">🌿</span>
                <h1 style="color: #2D5A27; font-size: 26px; font-weight: 700; margin-top: 10px; margin-bottom: 5px; letter-spacing: -0.02em;">Tierra Viva</h1>
                <p style="color: #6B7280; font-size: 14px; margin: 0;">Respeto y Amor por la Vida Silvestre</p>
              </div>
              
              <hr style="border: 0; border-top: 1px solid #E5E7EB; margin-bottom: 30px;">

              <!-- Content Cover Image if exists -->
              {f'<div style="border-radius: 16px; overflow: hidden; margin-bottom: 25px;"><img src="{image_url}" style="width: 100%; height: auto; display: block;" /></div>' if image_url else ''}
              
              <!-- Body Content -->
              <h2 style="color: #2D5A27; font-size: 22px; font-weight: 600; line-height: 1.3; margin-top: 0; margin-bottom: 15px;">{title}</h2>
              <p style="color: #4B5563; font-size: 16px; line-height: 1.7; margin-bottom: 25px;">{description}</p>
              
              <!-- Action Button -->
              <div style="text-align: center; margin-bottom: 35px;">
                <a href="{settings.FRONTEND_URL}{link}" style="background-color: #2D5A27; color: #FFFFFF; padding: 14px 28px; border-radius: 12px; font-size: 15px; font-weight: 600; text-decoration: none; display: inline-block; transition: background-color 0.2s;">
                  Ver más detalles
                </a>
              </div>
              
              <!-- Footer -->
              <div style="text-align: center; border-top: 1px solid #E5E7EB; padding-top: 25px; margin-top: 35px; color: #9CA3AF; font-size: 12px; line-height: 1.6;">
                <p style="margin: 0 0 8px 0;">Has recibido este correo porque estás suscrito al boletín de Tierra Viva.</p>
                <p style="margin: 0;">
                  <a href="{unsubscribe_url}" style="color: #2D5A27; text-decoration: underline; font-weight: 500;">Cancelar suscripción</a>
                </p>
              </div>
              
            </div>
          </body>
        </html>
        """
        
        text_content = strip_tags(html_content)
        try:
            message = EmailMultiAlternatives(
                subject,
                text_content,
                settings.DEFAULT_FROM_EMAIL,
                [sub.email]
            )
            message.attach_alternative(html_content, "text/html")
            message.send(fail_silently=False)
            logger.info(f"Successfully sent newsletter email to {sub.email}")
        except Exception as e:
            logger.error(f"Error sending newsletter email to {sub.email}: {e}")


def send_newsletter_alert(subject, title, description, link, image_url=None):
    """
    Public entrypoint to dispatch newsletter alert.
    Launches a daemon thread to send emails asynchronously.
    """
    threading.Thread(
        target=_send_emails_thread,
        args=(subject, title, description, link, image_url),
        daemon=True
    ).start()


def _send_welcome_email_thread(subscriber_id):
    """
    Background worker to send a welcome email to a new subscriber.
    """
    try:
        sub = Subscriber.objects.get(id=subscriber_id)
    except Subscriber.DoesNotExist:
        logger.error(f"Subscriber ID {subscriber_id} not found in background thread.")
        return

    subject = "🌿 ¡Bienvenido al Newsletter de Tierra Viva!"
    unsubscribe_url = f"{settings.FRONTEND_URL}/newsletter/unsubscribe?token={sub.unsubscribe_token}"
    
    html_content = f"""
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
          body, table, td, a {{
            font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
          }}
        </style>
      </head>
      <body style="background-color: #F3F6F3; color: #1C331E; font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px 20px; margin: 0; -webkit-font-smoothing: antialiased;">
        <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E2E8F0; padding: 40px; border-radius: 24px; box-shadow: 0 10px 30px rgba(45, 90, 39, 0.05);">
          
          <!-- Header/Logo -->
          <div style="text-align: center; margin-bottom: 30px;">
            <span style="font-size: 32px;">🌿</span>
            <h1 style="color: #2D5A27; font-size: 26px; font-weight: 700; margin-top: 10px; margin-bottom: 5px; letter-spacing: -0.02em;">Tierra Viva</h1>
            <p style="color: #6B7280; font-size: 14px; margin: 0;">Respeto y Amor por la Vida Silvestre</p>
          </div>
          
          <hr style="border: 0; border-top: 1px solid #E5E7EB; margin-bottom: 30px;">

          <!-- Body Content -->
          <h2 style="color: #2D5A27; font-size: 22px; font-weight: 600; line-height: 1.3; margin-top: 0; margin-bottom: 15px; text-align: center;">¡Gracias por suscribirte!</h2>
          <p style="color: #4B5563; font-size: 16px; line-height: 1.7; margin-bottom: 25px; text-align: center;">
            A partir de ahora, recibirás las últimas noticias sobre rescates de fauna silvestre, eventos, nuevos productos en nuestra tienda y formas en las que puedes apoyar al rancho.
          </p>
          
          <!-- Action Button -->
          <div style="text-align: center; margin-bottom: 35px;">
            <a href="{settings.FRONTEND_URL}" style="background-color: #2D5A27; color: #FFFFFF; padding: 14px 28px; border-radius: 12px; font-size: 15px; font-weight: 600; text-decoration: none; display: inline-block; transition: background-color 0.2s;">
              Visitar Sitio Web
            </a>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; border-top: 1px solid #E5E7EB; padding-top: 25px; margin-top: 35px; color: #9CA3AF; font-size: 12px; line-height: 1.6;">
            <p style="margin: 0 0 8px 0;">Has recibido este correo porque te suscribiste a nuestro boletín.</p>
            <p style="margin: 0;">
              <a href="{unsubscribe_url}" style="color: #2D5A27; text-decoration: underline; font-weight: 500;">Cancelar suscripción</a>
            </p>
          </div>
          
        </div>
      </body>
    </html>
    """
    
    text_content = strip_tags(html_content)
    try:
        message = EmailMultiAlternatives(
            subject,
            text_content,
            settings.DEFAULT_FROM_EMAIL,
            [sub.email]
        )
        message.attach_alternative(html_content, "text/html")
        message.send(fail_silently=False)
        logger.info(f"Successfully sent welcome email to {sub.email}")
    except Exception as e:
        logger.error(f"Error sending welcome email to {sub.email}: {e}")


def send_welcome_email(subscriber_id):
    """
    Public entrypoint to dispatch welcome email.
    Launches a daemon thread to send email asynchronously.
    """
    threading.Thread(
        target=_send_welcome_email_thread,
        args=(subscriber_id,),
        daemon=True
    ).start()
