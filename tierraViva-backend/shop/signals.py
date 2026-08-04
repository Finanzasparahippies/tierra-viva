from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Product
from newsletter.utils import send_newsletter_alert

@receiver(post_save, sender=Product)
def notify_new_product(sender, instance, created, **kwargs):
    if created and instance.is_active:
        subject = f"🛍️ ¡Nuevo producto en la Tienda: {instance.name}!"
        title = f"Nuevo en stock: {instance.name}"
        description = f"Ya puedes adquirir {instance.name} en nuestra tienda oficial. {instance.description[:150]}..."
        link = f"/shop/products/{instance.slug}"
        image_url = instance.image.url if instance.image else None
        
        send_newsletter_alert(subject, title, description, link, image_url)
