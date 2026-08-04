from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from sponsorship.models import Sponsorship, SponsorshipTier
from animals.models import Animal, Species

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

