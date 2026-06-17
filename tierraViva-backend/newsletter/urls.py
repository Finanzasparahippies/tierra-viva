from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SubscriberViewSet, UnsubscribeView

router = DefaultRouter()
router.register(r'subscribers', SubscriberViewSet, basename='subscribers')

urlpatterns = [
    path('unsubscribe/<uuid:token>/', UnsubscribeView.as_view(), name='newsletter-unsubscribe'),
    path('', include(router.urls)),
]
