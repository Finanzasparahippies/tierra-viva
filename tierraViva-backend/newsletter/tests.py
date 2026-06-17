import uuid
from unittest.mock import patch
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Subscriber
from .utils import send_newsletter_alert

class SubscriberModelTest(TestCase):
    def test_subscriber_creation(self):
        sub = Subscriber.objects.create(email="test@example.com")
        self.assertIsNotNone(sub.unsubscribe_token)
        self.assertTrue(sub.is_active)
        self.assertEqual(str(sub), "test@example.com")

class UnsubscribeAPITest(APITestCase):
    def setUp(self):
        self.sub = Subscriber.objects.create(email="user@example.com")
        self.url = reverse('newsletter-unsubscribe', kwargs={'token': self.sub.unsubscribe_token})

    def test_successful_unsubscribe(self):
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], "user@example.com")
        self.assertIn("desuscrito con éxito", response.data['detail'])
        
        self.sub.refresh_from_db()
        self.assertFalse(self.sub.is_active)

    def test_already_unsubscribed(self):
        self.sub.is_active = False
        self.sub.save()
        
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("Ya te habías desuscrito", response.data['detail'])

    def test_invalid_token_unsubscribe(self):
        invalid_uuid = uuid.uuid4()
        url = reverse('newsletter-unsubscribe', kwargs={'token': invalid_uuid})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

class WelcomeEmailAndAlertTest(APITestCase):
    @patch('newsletter.views.send_welcome_email')
    def test_subscriber_creation_triggers_welcome_email(self, mock_welcome):
        url = reverse('subscribers-list')
        data = {'email': 'new_subscriber@example.com'}
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify that background welcome email helper was called
        mock_welcome.assert_called_once()
        
    @patch('newsletter.utils.threading.Thread')
    def test_send_newsletter_alert_triggers_thread(self, mock_thread):
        send_newsletter_alert(
            subject="Test Subject",
            title="Test Title",
            description="Test Desc",
            link="/test-link"
        )
        mock_thread.assert_called_once()
