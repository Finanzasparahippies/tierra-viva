from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from sponsorship.models import Sponsorship, SponsorshipTier
from animals.models import Animal, Species
from unittest.mock import patch
import json

User = get_user_model()

class SponsorshipTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(username="user1", email="user1@example.com", password="password123")
        self.user2 = User.objects.create_user(username="user2", email="user2@example.com", password="password123")
        
        self.species = Species.objects.create(name="Caballos")
        self.animal = Animal.objects.create(
            name="Furia", 
            species=self.species, 
            description="Caballo negro", 
            sex="MALE", 
            health_status="GOOD"
        )
        
        self.tier = SponsorshipTier.objects.create(
            name="Oro",
            level=3,
            price=500.00
        )
        
        # User 1 active sponsorship
        self.sponsorship = Sponsorship.objects.create(
            user=self.user1,
            animal=self.animal,
            tier=self.tier,
            amount=500.00,
            active=True
        )

    def test_get_own_sponsorships_authenticated(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.get("/api/sponsorship/mine/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["animal_name"], "Furia")

    def test_get_sponsorships_empty_for_other_user(self):
        self.client.force_authenticate(user=self.user2)
        response = self.client.get("/api/sponsorship/mine/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)

    def test_get_sponsorships_unauthenticated_denied(self):
        response = self.client.get("/api/sponsorship/mine/")
        self.assertEqual(response.status_code, 401)

    @patch('stripe.Webhook.construct_event')
    def test_stripe_webhook_creates_sponsorship(self, mock_construct_event):
        # Setup mock event
        mock_event = {
            'id': 'evt_test_123',
            'type': 'checkout.session.completed',
            'data': {
                'object': {
                    'subscription': 'sub_test_123',
                    'payment_intent': None,
                    'metadata': {
                        'user_id': str(self.user2.id),
                        'tier_id': str(self.tier.id),
                        'animal_id': str(self.animal.id),
                        'billing_cycle': 'MONTHLY',
                    }
                }
            }
        }
        mock_construct_event.return_value = mock_event
        
        # Dispatch webhook post request
        response = self.client.post('/api/sponsorship/webhook/', data=json.dumps(mock_event), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        
        # Verify sponsorship is created
        sponsorship_exists = Sponsorship.objects.filter(
            user=self.user2,
            animal=self.animal,
            tier=self.tier,
            stripe_subscription_id='sub_test_123',
            active=True
        ).exists()
        self.assertTrue(sponsorship_exists)

    @patch('stripe.Webhook.construct_event')
    def test_stripe_webhook_idempotency(self, mock_construct_event):
        # Setup mock event
        mock_event = {
            'id': 'evt_idempotency_123',
            'type': 'checkout.session.completed',
            'data': {
                'object': {
                    'subscription': 'sub_test_idempotency',
                    'payment_intent': None,
                    'metadata': {
                        'user_id': str(self.user2.id),
                        'tier_id': str(self.tier.id),
                        'animal_id': str(self.animal.id),
                        'billing_cycle': 'MONTHLY',
                    }
                }
            }
        }
        mock_construct_event.return_value = mock_event
        
        # First request
        response = self.client.post('/api/sponsorship/webhook/', data=json.dumps(mock_event), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        
        # Verify sponsorship created once
        self.assertEqual(Sponsorship.objects.filter(stripe_subscription_id='sub_test_idempotency').count(), 1)
        
        # Second request (duplicate)
        response = self.client.post('/api/sponsorship/webhook/', data=json.dumps(mock_event), content_type='application/json')
        self.assertEqual(response.status_code, 200) # Should return 200 OK and handle it gracefully
        self.assertEqual(response.content.decode(), "Event already processed")
        
        # Verify still only 1 sponsorship exists
        self.assertEqual(Sponsorship.objects.filter(stripe_subscription_id='sub_test_idempotency').count(), 1)


