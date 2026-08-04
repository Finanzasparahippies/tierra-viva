from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from django.core import mail
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes

User = get_user_model()

class PasswordResetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="oldpassword123",
            first_name="Test"
        )
        self.reset_request_url = "/api/users/password_reset_request/"
        self.reset_confirm_url = "/api/users/password_reset_confirm/"

    def test_password_reset_request_success(self):
        response = self.client.post(self.reset_request_url, {"email": "test@example.com"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("Recuperación de contraseña", mail.outbox[0].subject)
        self.assertIn("test@example.com", mail.outbox[0].to)

    def test_password_reset_request_user_not_found(self):
        # Should still return 200 for security
        response = self.client.post(self.reset_request_url, {"email": "nonexistent@example.com"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 0)

    def test_password_reset_confirm_success(self):
        token = default_token_generator.make_token(self.user)
        uidb64 = urlsafe_base64_encode(force_bytes(self.user.pk))
        
        response = self.client.post(self.reset_confirm_url, {
            "uidb64": uidb64,
            "token": token,
            "new_password": "newpassword123"
        })
        
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("newpassword123"))

    def test_password_reset_confirm_invalid_token(self):
        uidb64 = urlsafe_base64_encode(force_bytes(self.user.pk))
        
        response = self.client.post(self.reset_confirm_url, {
            "uidb64": uidb64,
            "token": "invalid-token",
            "new_password": "newpassword123"
        })
        
        self.assertEqual(response.status_code, 400)
        self.user.refresh_from_db()
        self.assertFalse(self.user.check_password("newpassword123"))
