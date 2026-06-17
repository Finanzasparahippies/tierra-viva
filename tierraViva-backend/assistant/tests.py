from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from unittest.mock import patch, MagicMock

class AssistantAppTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.chat_url = "/api/assistant/chat/"

    @override_settings(GROQ_API_KEY="")
    def test_assistant_chat_without_api_key(self):
        response = self.client.post(self.chat_url, {"prompt": "Hola"})
        self.assertEqual(response.status_code, 200)
        self.assertIn("no tiene configurada su conexión de IA", response.data["reply"])

    @override_settings(GROQ_API_KEY="gsk_dummykey")
    @patch("groq.Groq")
    def test_assistant_chat_with_api_key_success(self, mock_groq_class):
        # Mocking Groq client response
        mock_client = MagicMock()
        mock_groq_class.return_value = mock_client
        
        mock_completion = MagicMock()
        mock_completion.choices = [
            MagicMock(message=MagicMock(content="¡Hola! Soy el asistente de Tierra Viva."))
        ]
        mock_client.chat.completions.create.return_value = mock_completion

        response = self.client.post(self.chat_url, {
            "messages": [{"role": "user", "content": "Hola"}]
        }, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["reply"], "¡Hola! Soy el asistente de Tierra Viva.")
        mock_client.chat.completions.create.assert_called_once()

    def test_assistant_chat_invalid_request(self):
        response = self.client.post(self.chat_url, {})
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.data)
