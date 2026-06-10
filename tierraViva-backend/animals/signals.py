from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Animal
from newsletter.utils import send_newsletter_alert

@receiver(post_save, sender=Animal)
def notify_new_animal(sender, instance, created, **kwargs):
    if created:
        subject = f"🐾 ¡Nuevo integrante en el Rancho: {instance.name}!"
        title = f"Te presentamos a {instance.name}"
        description = f"Un nuevo amigo ha llegado a Tierra Viva. {instance.description[:150]}..."
        link = f"/animals/{instance.id}" # Assuming frontend route
        image_url = instance.image.url if instance.image else None
        
        send_newsletter_alert(subject, title, description, link, image_url)
