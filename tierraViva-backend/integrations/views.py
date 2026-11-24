import hmac
import hashlib
import json
import logging
import time
from django.conf import settings
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .models import NectarWebhookEventLog

logger = logging.getLogger(__name__)

MAX_DRIFT_SECONDS = 300  # 5 minutos de tolerancia para anti-replay


class NectarWebhookReceiverView(APIView):
    """
    Receptor seguro y verificado de Webhooks firmados con HMAC-SHA256 desde Néctar Labs.
    Valida firma, marca de tiempo y registra eventos de forma idempotente.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        secret = getattr(settings, 'NECTAR_WEBHOOK_SECRET', '')
        if not secret:
            logger.error("[NectarWebhook] NECTAR_WEBHOOK_SECRET no está configurado.")
            return Response(
                {"error": "Webhook secret not configured on tenant receiver."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        signature = request.META.get('HTTP_X_NECTAR_SIGNATURE') or request.headers.get('X-Nectar-Signature')
        timestamp_str = request.META.get('HTTP_X_NECTAR_TIMESTAMP') or request.headers.get('X-Nectar-Timestamp')
        event_name = request.META.get('HTTP_X_NECTAR_EVENT') or request.headers.get('X-Nectar-Event') or ''

        if not signature:
            return Response(
                {"error": "Cabecera X-Nectar-Signature requerida."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        raw_body = request.body or b''

        # 1. Verificación de firma criptográfica HMAC-SHA256
        # Soportamos tanto la firma directa del body como (body + timestamp)
        expected_sig_body = hmac.new(secret.encode('utf-8'), raw_body, hashlib.sha256).hexdigest()
        is_valid = hmac.compare_digest(signature.lower().strip(), expected_sig_body.lower().strip())

        if not is_valid and timestamp_str:
            expected_sig_with_ts = hmac.new(
                secret.encode('utf-8'),
                raw_body + str(timestamp_str).strip().encode('utf-8'),
                hashlib.sha256
            ).hexdigest()
            is_valid = hmac.compare_digest(signature.lower().strip(), expected_sig_with_ts.lower().strip())

        if not is_valid:
            logger.warning(f"[NectarWebhook] Firma HMAC inválida recibida: {signature[:12]}...")
            return Response(
                {"error": "Firma criptográfica HMAC-SHA256 inválida."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # 2. Validación de Timestamp Drift si viene presente
        if timestamp_str:
            try:
                ts = float(timestamp_str)
                drift = abs(time.time() - ts)
                if drift > MAX_DRIFT_SECONDS:
                    logger.warning(f"[NectarWebhook] Timestamp drift excesivo ({drift:.1f}s)")
                    return Response(
                        {"error": f"Desfase de tiempo excesivo ({drift:.1f}s)."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except (ValueError, TypeError):
                pass

        # 3. Parsear Payload JSON
        try:
            payload = json.loads(raw_body.decode('utf-8')) if raw_body else {}
        except Exception as e:
            return Response({"error": f"Payload JSON inválido: {e}"}, status=status.HTTP_400_BAD_REQUEST)

        event_name = event_name or payload.get('event', 'unknown_event')
        event_id = payload.get('event_id') or payload.get('id') or f"{event_name}_{hashlib.sha256(raw_body).hexdigest()[:24]}"
        tenant_slug = payload.get('tenant_slug', '')

        # 4. Control de Idempotencia estricta
        existing = NectarWebhookEventLog.objects.filter(event_id=event_id).first()
        if existing:
            logger.info(f"[NectarWebhook] Evento duplicado ignorado id={event_id} ({event_name})")
            return Response({
                "received": True,
                "event": event_name,
                "status": "duplicate_ignored",
                "message": "Evento ya procesado previamente (idempotencia garantizada)."
            }, status=status.HTTP_200_OK)

        # 5. Despachar acción según el evento
        processed_successfully = True
        error_msg = ""
        try:
            self._handle_event_action(event_name, payload)
        except Exception as handler_err:
            processed_successfully = False
            error_msg = str(handler_err)
            logger.error(f"[NectarWebhook] Error ejecutando acción para {event_name}: {handler_err}", exc_info=True)

        # 6. Registrar en el log forense inmutable
        NectarWebhookEventLog.objects.create(
            event_id=event_id,
            event_name=event_name,
            tenant_slug=tenant_slug,
            payload=payload,
            signature=signature,
            processed_successfully=processed_successfully,
            error_message=error_msg,
        )

        return Response({
            "received": True,
            "event": event_name,
            "status": "processed" if processed_successfully else "error",
            "event_id": event_id
        }, status=status.HTTP_200_OK if processed_successfully else status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _handle_event_action(self, event_name: str, payload: dict):
        """Manejador de acciones específicas según el evento de Néctar Labs."""
        data = payload.get('data', {})
        logger.info(f"[NectarWebhook] Procesando evento {event_name} con datos: {data}")

        if event_name in ['addon.activated', 'addon.deactivated']:
            # Invalidar caché local de addons
            from django.core.cache import cache
            tenant_slug = payload.get('tenant_slug') or getattr(settings, 'NECTAR_TENANT_SLUG', 'tierra-viva')
            cache.delete(f"nectar_remote_addons:{tenant_slug}")

        elif event_name in ['subscription.updated', 'tier.updated']:
            logger.info(f"[NectarWebhook] Nivel de suscripción actualizado: {data}")

        elif event_name in ['billing.payment_succeeded', 'invoice.stamped']:
            logger.info(f"[NectarWebhook] Evento de facturación confirmado: {data}")
