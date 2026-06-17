from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from rescues.models import RescueRequest

User = get_user_model()

class RescueRequestTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(username="user1", email="user1@example.com", password="password123", role="USER")
        self.user2 = User.objects.create_user(username="user2", email="user2@example.com", password="password123", role="USER")
        self.admin = User.objects.create_user(username="admin", email="admin@example.com", password="password123", role="ADMIN", is_staff=True)
        
        # User 1 request
        self.req1 = RescueRequest.objects.create(
            user=self.user1,
            email="user1@example.com",
            animal_type="BEES",
            description="Panal en tejado",
            latitude=29.0730,
            longitude=-110.9559,
            address="Calle 123",
            phone="1234567890",
            status="PENDING_APPROVAL"
        )
        
        # User 2 request
        self.req2 = RescueRequest.objects.create(
            user=self.user2,
            email="user2@example.com",
            animal_type="DOGS",
            description="Perro herido",
            latitude=29.0740,
            longitude=-110.9560,
            address="Calle 456",
            phone="0987654321",
            status="PENDING_RESCUE"
        )

    def test_user_can_list_own_rescues(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.get("/api/rescues/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["description"], "Panal en tejado")

    def test_user_cannot_see_other_rescues(self):
        self.client.force_authenticate(user=self.user1)
        # Verify that listing doesn't return user 2 request
        response = self.client.get("/api/rescues/")
        self.assertEqual(len(response.data), 1)
        self.assertNotEqual(response.data[0]["description"], "Perro herido")

    def test_admin_can_list_all_rescues(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get("/api/rescues/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)

    def test_unauthenticated_gets_empty_list(self):
        response = self.client.get("/api/rescues/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)

