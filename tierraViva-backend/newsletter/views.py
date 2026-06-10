from rest_framework import viewsets, permissions
from .models import Subscriber
from .serializers import SubscriberSerializer

class SubscriberViewSet(viewsets.ModelViewSet):
    queryset = Subscriber.objects.all()
    serializer_class = SubscriberSerializer
    permission_classes = [permissions.AllowAny]
