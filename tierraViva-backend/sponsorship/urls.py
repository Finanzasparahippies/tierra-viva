from django.urls import path
from .views import CreateCheckoutSessionView, stripe_webhook, RanchUpdateTagListView, UserSponsorshipsListView

urlpatterns = [
    path('checkout/', CreateCheckoutSessionView.as_view(), name='create-checkout-session'),
    path('webhook/', stripe_webhook, name='stripe-webhook'),
    path('tags/', RanchUpdateTagListView.as_view(), name='ranch-tags'),
    path('mine/', UserSponsorshipsListView.as_view(), name='user-sponsorships'),
]
