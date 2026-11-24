import hmac
import hashlib
import json
import time
from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock

from .models import NectarWebhookEventLog
from .nectar_client import NectarRemoteClient


class IntegrationsWebhookAndClientTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.webhook_url = "/api/webhooks/nectar/"
        self.test_secret = "test_nectar_secret_key_12345"

    @override_settings(NECTAR_WEBHOOK_SECRET="test_nectar_secret_key_12345")
    def test_webhook_successful_reception_and_idempotency(self):
        payload_dict = {
            "event": "addon.activated",
            "event_id": "evt_test_001",
            "tenant_slug": "tierra-viva",
            "timestamp": int(time.time()),
            "data": {"addon_slug": "ai-chat", "status": "ACTIVE"}
        }
        body_bytes = json.dumps(payload_dict, separators=(',', ':')).encode('utf-8')
        signature = hmac.new(self.test_secret.encode('utf-8'), body_bytes, hashlib.sha256).hexdigest()

        # 1. Primer envío -> Debe procesarse con 200 OK
        response = self.client.post(
            self.webhook_url,
            data=body_bytes,
            content_type="application/json",
            HTTP_X_NECTAR_SIGNATURE=signature,
            HTTP_X_NECTAR_EVENT="addon.activated",
            HTTP_X_NECTAR_TIMESTAMP=str(int(time.time()))
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "processed")
        self.assertEqual(NectarWebhookEventLog.objects.filter(event_id="evt_test_001").count(), 1)

        # 2. Segundo envío con mismo event_id -> Idempotencia: debe responder 200 duplicate_ignored
        response_dup = self.client.post(
            self.webhook_url,
            data=body_bytes,
            content_type="application/json",
            HTTP_X_NECTAR_SIGNATURE=signature,
            HTTP_X_NECTAR_EVENT="addon.activated"
        )
        self.assertEqual(response_dup.status_code, status.HTTP_200_OK)
        self.assertEqual(response_dup.data["status"], "duplicate_ignored")
        self.assertEqual(NectarWebhookEventLog.objects.filter(event_id="evt_test_001").count(), 1)

    @override_settings(NECTAR_WEBHOOK_SECRET="test_nectar_secret_key_12345")
    def test_webhook_invalid_signature_rejected(self):
        payload_dict = {"event": "addon.activated", "event_id": "evt_test_bad"}
        body_bytes = json.dumps(payload_dict).encode('utf-8')

        response = self.client.post(
            self.webhook_url,
            data=body_bytes,
            content_type="application/json",
            HTTP_X_NECTAR_SIGNATURE="invalid_signature_hex"
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("error", response.data)

    @override_settings(
        NECTAR_API_BASE_URL="https://api.nectarlabs.dev",
        NECTAR_TENANT_SLUG="tierra-viva",
        NECTAR_TENANT_API_KEY="nk_live_mockkey123"
    )
    @patch("requests.Session.get")
    def test_remote_client_get_active_addons(self, mock_get):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "tenant_id": "test-uuid",
            "active_addons": ["ai-chat", "sponsorship", "tienda-delivery"],
            "count": 3
        }
        mock_get.return_value = mock_resp

        client = NectarRemoteClient()
        addons = client.get_active_addons(force_refresh=True)
        self.assertIn("ai-chat", addons)
        self.assertTrue(client.has_addon("sponsorship"))
        self.assertFalse(client.has_addon("unsubscribed-addon"))
