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
        self.assertEqual(response.status_code, 503)
        self.assertIn("no tiene configurada su conexión de IA", response.data["reply"])
        self.assertIn("error", response.data)

    @override_settings(GROQ_API_KEY="gsk_dummykey")
    @patch("groq.Groq")
    @patch("httpx.Client")
    def test_assistant_chat_with_api_key_success(self, mock_httpx_client, mock_groq_class):
        # Mocking Groq client response
        mock_client = MagicMock()
        mock_groq_class.return_value = mock_client
        
        mock_completion = MagicMock()
        mock_completion.choices = [
            MagicMock(message=MagicMock(content="¡Hola! Soy el asistente de Tierra Viva."))
        ]
        mock_client.chat.completions.create.return_value = mock_completion

        # Test with message field
        response = self.client.post(self.chat_url, {
            "message": "Hola, ¿qué actividades y adopciones tienen disponibles?"
        }, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["reply"], "¡Hola! Soy el asistente de Tierra Viva.")
        mock_client.chat.completions.create.assert_called_once()

    @override_settings(GROQ_API_KEY="gsk_dummykey")
    @patch("groq.Groq")
    @patch("httpx.Client")
    def test_assistant_chat_upstream_error_returns_502(self, mock_httpx_client, mock_groq_class):
        mock_client = MagicMock()
        mock_groq_class.return_value = mock_client
        mock_client.chat.completions.create.side_effect = Exception("Client.__init__() got an unexpected keyword argument 'proxies'")

        response = self.client.post(self.chat_url, {
            "message": "Hola"
        }, format="json")
        self.assertEqual(response.status_code, 502)
        self.assertIn("error", response.data)
        self.assertIn("Lo lamento", response.data["reply"])

    def test_assistant_chat_invalid_request(self):
        response = self.client.post(self.chat_url, {})
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.data)
