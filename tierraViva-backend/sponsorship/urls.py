from django.urls import path
from .views import CreateCheckoutSessionView, stripe_webhook, RanchUpdateListView, SponsorshipTierListView, RanchUpdateTagListView

urlpatterns = [
    path('tiers/', SponsorshipTierListView.as_view(), name='sponsorship-tiers'),
    path('checkout/', CreateCheckoutSessionView.as_view(), name='create-checkout-session'),
    path('webhook/', stripe_webhook, name='stripe-webhook'),
    path('updates/', RanchUpdateListView.as_view(), name='ranch-updates'),
    path('tags/', RanchUpdateTagListView.as_view(), name='ranch-tags'),
]
