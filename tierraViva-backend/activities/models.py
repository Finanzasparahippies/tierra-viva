from django.db import models
from django.conf import settings
from cloudinary.models import CloudinaryField
from django_ckeditor_5.fields import CKEditor5Field

class Activity(models.Model):
    TYPE_CHOICES = (
        ('TOUR', 'Recorrido / Visita'),
        ('WORKSHOP', 'Taller'),
        ('EVENT', 'Evento Especial'),
    )

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    description = CKEditor5Field('Description', config_name='extends')
    activity_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='TOUR')
    
    date = models.DateField()
    time = models.TimeField()
    duration = models.CharField(max_length=100, help_text="Ej: 2 horas, Medio día")
    
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Precio por persona")
    capacity = models.PositiveIntegerField(help_text="Cupo máximo")
    remaining_capacity = models.PositiveIntegerField()
    
    location = models.CharField(max_length=255, default="Rancho Tierra Viva")
    image = CloudinaryField('image', help_text="Imagen principal")
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Actividad"
        verbose_name_plural = "Actividades"
        ordering = ['date', 'time']

    def __str__(self):
        return f"{self.title} ({self.date})"

    def save(self, *args, **kwargs):
        if not self.id:
            self.remaining_capacity = self.capacity
        super().save(*args, **kwargs)

class ActivityImage(models.Model):
    activity = models.ForeignKey(Activity, related_name='gallery', on_delete=models.CASCADE)
    image = CloudinaryField('image')
    caption = models.CharField(max_length=255, blank=True, null=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

class Booking(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pendiente de Pago'),
        ('PAID', 'Pagado / Confirmado'),
        ('CANCELLED', 'Cancelado'),
        ('REFUNDED', 'Reembolsado'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='activity_bookings')
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, related_name='bookings')
    
    tickets = models.PositiveIntegerField(default=1)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    import uuid
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    is_scanned = models.BooleanField(default=False)
    scanned_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    stripe_payment_intent = models.CharField(max_length=255, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def __str__(self):
        return f"Reserva {self.id} - {self.user.username} ({self.activity.title})"
