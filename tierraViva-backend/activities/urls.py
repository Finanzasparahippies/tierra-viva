from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ActivityViewSet, BookingViewSet

router = DefaultRouter()
router.register(r'', ActivityViewSet, basename='activities')
router.register(r'bookings', BookingViewSet, basename='bookings')

urlpatterns = [
    path('', include(router.urls)),
]
