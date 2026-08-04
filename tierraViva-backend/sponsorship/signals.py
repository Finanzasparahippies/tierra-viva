from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import RanchUpdate
from newsletter.utils import send_newsletter_alert

@receiver(post_save, sender=RanchUpdate)
def notify_ranch_update(sender, instance, created, **kwargs):
    if created:
        subject = f"🚜 Nueva actualización del Rancho: {instance.title}"
        title = f"Reporte de progreso: {instance.title}"
        description = f"Descubre los últimos avances en Tierra Viva. {instance.content[:150]}..."
        link = f"/updates/{instance.id}"
        image_url = instance.image.url if instance.image else None
        
        send_newsletter_alert(subject, title, description, link, image_url)
