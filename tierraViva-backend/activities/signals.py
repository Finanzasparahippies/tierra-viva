from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Activity
from newsletter.utils import send_newsletter_alert

@receiver(post_save, sender=Activity)
def notify_new_activity(sender, instance, created, **kwargs):
    if created and instance.is_active:
        subject = f"🎟️ ¡Nueva actividad programada: {instance.title}!"
        title = f"Nuevo: {instance.title}"
        description = f"Ya puedes reservar tu lugar para {instance.title} el {instance.date}. {instance.description[:150]}..."
        link = f"/activities/{instance.slug}"
        image_url = instance.image.url if instance.image else None
        
        send_newsletter_alert(subject, title, description, link, image_url)
