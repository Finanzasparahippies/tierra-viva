from django.contrib import admin
from .models import Animal, Species, Breed, AnimalContentFolder, AnimalContentMedia

@admin.register(Species)
class SpeciesAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Breed)
class BreedAdmin(admin.ModelAdmin):
    list_display = ('name', 'species')
    list_filter = ('species',)
    search_fields = ('name',)

@admin.register(Animal)
class AnimalAdmin(admin.ModelAdmin):
    list_display = ('name', 'species', 'breed', 'sex', 'health_status', 'rescue_date', 'birth_date', 'status', 'is_available_for_sponsorship')
    list_filter = ('species', 'breed', 'sex', 'health_status', 'status', 'is_available_for_sponsorship')
    search_fields = ('name', 'description', 'provenance')

class AnimalContentMediaInline(admin.TabularInline):
    model = AnimalContentMedia
    extra = 1

@admin.register(AnimalContentFolder)
class AnimalContentFolderAdmin(admin.ModelAdmin):
    list_display = ('name', 'animal', 'species', 'min_tier_level', 'created_at')
    list_filter = ('animal', 'species', 'min_tier_level')
    search_fields = ('name', 'animal__name', 'species__name')
    inlines = [AnimalContentMediaInline]

@admin.register(AnimalContentMedia)
class AnimalContentMediaAdmin(admin.ModelAdmin):
    list_display = ('folder', 'media_type', 'created_at')
    list_filter = ('media_type', 'folder__name')
