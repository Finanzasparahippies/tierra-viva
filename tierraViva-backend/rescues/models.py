from django.db import models
from django.conf import settings
from cloudinary.models import CloudinaryField

class RescueRequest(models.Model):
    ANIMAL_CHOICES = [
        ('BEES', 'Abejas'),
        ('DOGS', 'Perros'),
        ('CATS', 'Gatos'),
        ('RABBITS', 'Conejos'),
        ('HORSES', 'Caballos'),
        ('BOVINES', 'Bovinos'),
        ('PORCINES', 'Porcinos'),
        ('OTHER', 'Otro (Sujeto a aprobación)'),
    ]

    STATUS_CHOICES = [
        ('PENDING_APPROVAL', 'Pendiente de Aprobación'),
        ('PENDING_RESCUE', 'Pendiente de Rescate'),
        ('SCHEDULED', 'Programado'),
        ('RESCUED', 'Rescatado'),
        ('CANCELLED', 'Cancelado'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='rescue_requests'
    )
    email = models.EmailField(blank=True, null=True, help_text="Correo de contacto para el rescate")
    animal_type = models.CharField(max_length=20, choices=ANIMAL_CHOICES, default='BEES')
    other_species = models.CharField(max_length=100, blank=True, null=True, help_text="Especificar si eligió 'Otro'")
    description = models.TextField(help_text="Breve descripción de la situación")
    
    # Location fields
    latitude = models.FloatField()
    longitude = models.FloatField()
    address = models.CharField(max_length=255, help_text="Dirección sugerida o detectada")
    
    phone = models.CharField(max_length=20, help_text="Teléfono de contacto para el rescate")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING_APPROVAL')
    
    photo = CloudinaryField('image', blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Solicitud de Rescate"
        verbose_name_plural = "Solicitudes de Rescate"

    def __str__(self):
        return f"{self.get_animal_type_display()} - {self.address} ({self.status})"

class RescuerContact(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True, help_text="¿Debe recibir notificaciones?")

    class Meta:
        verbose_name = "Contacto de Rescatista"
        verbose_name_plural = "Lista de Rescatistas (Notificaciones)"

    def __str__(self):
        return f"{self.name} ({self.email})"
