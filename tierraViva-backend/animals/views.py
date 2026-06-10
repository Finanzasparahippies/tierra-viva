from rest_framework import viewsets
from .models import Animal, AnimalContentFolder, Species
from .serializers import AnimalSerializer, AnimalContentFolderSerializer, SpeciesSerializer

class AnimalViewSet(viewsets.ModelViewSet):
    queryset = Animal.objects.all().prefetch_related('folders', 'folders__media')
    serializer_class = AnimalSerializer

class AnimalContentFolderViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para carpetas de contenido. 
    Permite filtrar por animal o especie para la galería global.
    """
    queryset = AnimalContentFolder.objects.all().prefetch_related('media')
    serializer_class = AnimalContentFolderSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        animal_id = self.request.query_params.get('animal')
        species_id = self.request.query_params.get('species')
        
        if animal_id:
            queryset = queryset.filter(animal_id=animal_id)
        if species_id:
            queryset = queryset.filter(species_id=species_id)
            
        return queryset

class SpeciesViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para listar las especies disponibles.
    """
    queryset = Species.objects.all()
    serializer_class = SpeciesSerializer
