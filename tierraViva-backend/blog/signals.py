from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Post
from newsletter.utils import send_newsletter_alert

@receiver(post_save, sender=Post)
def notify_new_post(sender, instance, created, **kwargs):
    if created and instance.is_public:
        subject = f"📖 Nueva historia en el Blog: {instance.title}"
        title = f"Nueva lectura: {instance.title}"
        description = f"Descubre un nuevo capítulo del Rancho Tierra Viva. {instance.content[:150]}..."
        link = f"/blog/{instance.slug}"
        image_url = instance.image.url if instance.image else None
        
        send_newsletter_alert(subject, title, description, link, image_url)
