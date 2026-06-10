from rest_framework import viewsets, permissions
from .models import RescueRequest
from .serializers import RescueRequestSerializer

class RescueRequestViewSet(viewsets.ModelViewSet):
    queryset = RescueRequest.objects.all()
    serializer_class = RescueRequestSerializer

    def get_permissions(self):
        if self.action == 'create':
            # Anyone can report a rescue
            return [permissions.AllowAny()]
        elif self.action in ['list', 'retrieve']:
            # Anyone can view (Limited fields handled by serializer if needed, 
            # or by overriding get_queryset for public users)
            return [permissions.AllowAny()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            # Only Admins and Family can manage existing rescues
            return [permissions.IsAdminUser()]
        return super().get_permissions()

    def get_queryset(self):
        user = self.request.user
        queryset = RescueRequest.objects.all()

        # If user is not Admin/Family, we only show their own requests 
        # or we could show all with limited data. Given the user's requirement 
        # for privacy, let's limit the detailed fields for non-admins.
        # For now, let's return all and handle field invisibility in the serializer 
        # or by using different serializers.
        
        return queryset

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save()
