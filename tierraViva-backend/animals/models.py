from django.db import models
from cloudinary.models import CloudinaryField
from django_ckeditor_5.fields import CKEditor5Field

class Species(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = "Species"

    def __str__(self):
        return self.name

class Breed(models.Model):
    species = models.ForeignKey(Species, related_name='breeds', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)

    class Meta:
        unique_together = ('species', 'name')

    def __str__(self):
        return f"{self.name} ({self.species.name})"

class Animal(models.Model):
    SEX_CHOICES = (
        ('MALE', 'Macho'),
        ('FEMALE', 'Hembra'),
        ('UNKNOWN', 'Desconocido'),
    )
    HEALTH_CHOICES = (
        ('GOOD', 'Buen estado'),
        ('TREATMENT', 'En tratamiento'),
        ('CRITICAL', 'Estado crítico'),
        ('RECOVERED', 'Recuperado'),
    )
    name = models.CharField(max_length=100)
    species = models.ForeignKey(Species, on_delete=models.PROTECT, related_name='animals', null=True)
    breed = models.ForeignKey(Breed, on_delete=models.SET_NULL, related_name='animals', null=True, blank=True)
    description = CKEditor5Field('Description', config_name='extends')
    image = CloudinaryField('image', blank=True, null=True)
    rescue_video = CloudinaryField('video', resource_type='video', blank=True, null=True, help_text="Sube un archivo de video directamente a Cloudinary")
    rescue_video_url = models.URLField(blank=True, null=True, help_text="O pega un link externo (YouTube/Vimeo)")
    
    # Bitácora y Control
    birth_date = models.DateField(null=True, blank=True)
    rescue_date = models.DateField(null=True, blank=True)
    sex = models.CharField(max_length=10, choices=SEX_CHOICES, default='UNKNOWN')
    health_status = models.CharField(max_length=20, choices=HEALTH_CHOICES, default='GOOD')
    weight = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Peso en kg")
    provenance = models.TextField(blank=True, null=True, help_text="Lugar de procedencia/rescate")
    
    is_available_for_sponsorship = models.BooleanField(default=True)
    status = models.CharField(max_length=20, default="ACTIVE")

    def __str__(self):
        return self.name

class AnimalContentFolder(models.Model):
    animal = models.ForeignKey(Animal, on_delete=models.CASCADE, related_name='folders', null=True, blank=True, help_text="Dejar vacío para contenido general del Rancho o vinculado a especie")
    species = models.ForeignKey(Species, on_delete=models.CASCADE, related_name='folders', null=True, blank=True, help_text="Vincula esta carpeta a toda una especie")
    name = models.CharField(max_length=100)
    min_tier_level = models.IntegerField(default=0, help_text="Nivel mínimo de membresía para acceder (0 = público)")
    cover_image = CloudinaryField('image', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        target = self.animal.name if self.animal else "Rancho"
        return f"{target} - {self.name}"

class AnimalContentMedia(models.Model):
    MEDIA_TYPES = (
        ('IMAGE', 'Imagen'),
        ('VIDEO', 'Video'),
    )
    folder = models.ForeignKey(AnimalContentFolder, on_delete=models.CASCADE, related_name='media')
    file = CloudinaryField('file', resource_type='auto')
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPES, default='IMAGE')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.folder.name} - {self.media_type} ({self.id})"
