from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from users.models import FamilyProfile

User = get_user_model()

class UsersAppTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="family@example.com",
            username="familyuser",
            password="securepassword123",
            first_name="Family",
            last_name="Member",
            role="FAMILY"
        )
        self.family_profile = FamilyProfile.objects.create(
            user=self.user,
            title="Cuidador Principal",
            bio="Encargado de los rescates",
            public_email="family@example.com",
            whatsapp="1234567890"
        )

    def test_get_me_authenticated(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/users/me/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["email"], "family@example.com")
        self.assertEqual(response.data["family_profile"]["title"], "Cuidador Principal")

    def test_update_me_authenticated(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.patch("/api/users/me/", {
            "first_name": "NuevoNombre"
        }, format="json")
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, "NuevoNombre")

    def test_get_team_members(self):
        response = self.client.get("/api/users/team/")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(len(response.data) > 0)
        self.assertEqual(response.data[0]["title"], "Cuidador Principal")
