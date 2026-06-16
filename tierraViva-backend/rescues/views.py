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
        if not user.is_authenticated:
            return RescueRequest.objects.none()

        if user.is_staff or user.role == 'ADMIN' or user.role == 'FAMILY':
            return RescueRequest.objects.all()

        return RescueRequest.objects.filter(user=user)

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save()
