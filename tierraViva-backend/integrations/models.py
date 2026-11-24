from django.db import models
from django.utils import timezone
import uuid

class NectarWebhookEventLog(models.Model):
    """
    Log inmutable e idempotente de eventos recibidos vía Webhook desde Néctar Labs.
    Previene el procesamiento duplicado (replay protection) y audita transiciones.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event_id = models.CharField(max_length=128, db_index=True, unique=True, help_text="ID único del evento de Néctar")
    event_name = models.CharField(max_length=100, db_index=True, help_text="Ej: addon.activated, subscription.updated")
    tenant_slug = models.CharField(max_length=100, blank=True, default="")
    payload = models.JSONField(default=dict)
    signature = models.CharField(max_length=256, blank=True, default="")
    received_at = models.DateTimeField(default=timezone.now, db_index=True)
    processed_successfully = models.BooleanField(default=True)
    error_message = models.TextField(blank=True, default="")

    class Meta:
        db_table = "nectar_webhook_event_logs"
        verbose_name = "Log de Webhook de Néctar Labs"
        verbose_name_plural = "Logs de Webhooks de Néctar Labs"
        ordering = ["-received_at"]

    def __str__(self):
        status = "OK" if self.processed_successfully else "FAILED"
        return f"[{status}] {self.event_name} ({self.event_id}) - {self.received_at.strftime('%Y-%m-%d %H:%M:%S')}"
