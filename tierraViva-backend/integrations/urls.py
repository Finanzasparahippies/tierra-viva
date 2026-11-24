from django.urls import path
from .views import NectarWebhookReceiverView

urlpatterns = [
    path('nectar/', NectarWebhookReceiverView.as_view(), name='nectar_webhook_receiver'),
]
