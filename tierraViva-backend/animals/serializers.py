from rest_framework import serializers
from .models import Animal, Species, Breed, AnimalContentFolder, AnimalContentMedia
from django.db.models import Max
from django.utils import timezone
from dateutil.relativedelta import relativedelta

class SpeciesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Species
        fields = ['id', 'name', 'description']

class BreedSerializer(serializers.ModelSerializer):
    species_name = serializers.ReadOnlyField(source='species.name')
    class Meta:
        model = Breed
        fields = "__all__"

class AnimalContentMediaSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    class Meta:
        model = AnimalContentMedia
        fields = ['id', 'file_url', 'media_type', 'created_at']
    
    def get_file_url(self, obj):
        if obj.file:
            return obj.file.url
        return None

class AnimalContentFolderSerializer(serializers.ModelSerializer):
    media = serializers.SerializerMethodField()
    is_locked = serializers.SerializerMethodField()
    cover_image_url = serializers.SerializerMethodField()

    class Meta:
        model = AnimalContentFolder
        fields = ['id', 'name', 'min_tier_level', 'cover_image_url', 'is_locked', 'media', 'created_at']

    def get_cover_image_url(self, obj):
        if obj.cover_image:
            return obj.cover_image.url
        return None

    def _get_user_level(self):
        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            return 0
        return request.user.max_sponsorship_level

    def get_is_locked(self, obj):
        if obj.min_tier_level <= 0:
            return False
        
        user_level = self._get_user_level()
        return user_level < obj.min_tier_level

    def get_media(self, obj):
        if self.get_is_locked(obj):
            return []
        
        media_items = obj.media.all()
        return AnimalContentMediaSerializer(media_items, many=True).data

class AnimalSerializer(serializers.ModelSerializer):
    species_name = serializers.ReadOnlyField(source='species.name')
    breed_name = serializers.ReadOnlyField(source='breed.name')
    image_url = serializers.SerializerMethodField()
    folders = serializers.SerializerMethodField()
    age_display = serializers.SerializerMethodField()
    time_at_ranch_display = serializers.SerializerMethodField()
    rescue_video_url = serializers.SerializerMethodField()
    health_status_display = serializers.CharField(source='get_health_status_display', read_only=True)
    
    class Meta:
        model = Animal
        fields = "__all__"

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None

    def get_folders(self, obj):
        """Combina las carpetas propias del animal + las de su especie."""
        animal_folders = obj.folders.all()
        species_folders = []
        if obj.species:
            species_folders = obj.species.folders.all()
        
        # Combinar y eliminar duplicados (aunque no debería haber)
        combined = list(animal_folders) + [f for f in species_folders if f not in animal_folders]
        return AnimalContentFolderSerializer(combined, many=True, context=self.context).data

    def _format_relativedelta(self, rd):
        parts = []
        if rd.years > 0:
            parts.append(f"{rd.years} {'año' if rd.years == 1 else 'años'}")
        if rd.months > 0:
            parts.append(f"{rd.months} {'mes' if rd.months == 1 else 'meses'}")
        
        if not parts:
            if rd.days > 0:
                 return f"{rd.days} {'día' if rd.days == 1 else 'días'}"
            return "Recién llegado"
            
        return " y ".join(parts)

    def get_age_display(self, obj):
        if not obj.birth_date:
            return "Desconocida"
        rd = relativedelta(timezone.now().date(), obj.birth_date)
        return self._format_relativedelta(rd)

    def get_time_at_ranch_display(self, obj):
        if not obj.rescue_date:
            return "No registrado"
        rd = relativedelta(timezone.now().date(), obj.rescue_date)
        return self._format_relativedelta(rd)

    def get_rescue_video_url(self, obj):
        """Prioriza el video subido a Cloudinary."""
        if obj.rescue_video:
            return obj.rescue_video.url
        return obj.rescue_video_url
