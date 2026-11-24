"""
Typed, resilient remote client for external VPS tenant (Tierra Viva)
consuming Nectar Labs Core Platform add-ons, entitlements, and federated endpoints.
"""

import logging
import time
from typing import List, Dict, Any, Optional
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)

CACHE_TTL_ENTITLEMENTS = 300  # 5 minutos


class NectarRemoteClient:
    """
    Cliente tipado y resiliente para consumir APIs y Add-ons de Néctar Labs
    desde un VPS Externo (BYO-VPS).
    """

    def __init__(
        self,
        base_url: Optional[str] = None,
        tenant_slug: Optional[str] = None,
        api_key: Optional[str] = None,
        timeout: float = 5.0,
    ):
        self.base_url = (base_url or getattr(settings, 'NECTAR_API_BASE_URL', 'https://api.nectarlabs.dev')).rstrip('/')
        self.tenant_slug = tenant_slug or getattr(settings, 'NECTAR_TENANT_SLUG', 'tierra-viva')
        self.api_key = api_key or getattr(settings, 'NECTAR_TENANT_API_KEY', '')
        self.timeout = timeout

        # Configurar sesión con reintentos exponenciales
        self.session = requests.Session()
        retries = Retry(
            total=3,
            backoff_factor=0.3,
            status_forcelist=[500, 502, 503, 504],
            raise_on_status=False
        )
        adapter = HTTPAdapter(max_retries=retries)
        self.session.mount('http://', adapter)
        self.session.mount('https://', adapter)

    def _get_headers(self) -> Dict[str, str]:
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Tenant-Slug': self.tenant_slug,
            'User-Agent': f'TierraViva-ExternalTenantClient/1.0 ({self.tenant_slug})',
        }
        if self.api_key:
            headers['Authorization'] = f'Api-Key {self.api_key}'
            headers['X-Api-Key'] = self.api_key
        return headers

    def get_active_addons(self, force_refresh: bool = False) -> List[str]:
        """
        Consulta las capacidades y add-ons formalmente activos en Néctar Labs.
        Implementa fallback en caché y degradación elegante.
        """
        cache_key = f"nectar_remote_addons:{self.tenant_slug}"
        if not force_refresh:
            cached = cache.get(cache_key)
            if cached is not None and isinstance(cached, list):
                return cached

        url = f"{self.base_url}/api/addons/entitlements/"
        try:
            resp = self.session.get(url, headers=self._get_headers(), timeout=self.timeout)
            if resp.status_code == 200:
                data = resp.json()
                active = data.get('active_addons', [])
                cache.set(cache_key, active, timeout=CACHE_TTL_ENTITLEMENTS)
                return active
            else:
                logger.warning(
                    f"[NectarRemoteClient] Respuesta no esperada {resp.status_code} desde {url}: {resp.text[:200]}"
                )
        except Exception as e:
            logger.error(f"[NectarRemoteClient] Error de red consultando add-ons en Néctar Labs: {e}")

        # Fallback a caché previa si existe
        cached = cache.get(cache_key)
        return cached if isinstance(cached, list) else []

    def has_addon(self, addon_slug: str) -> bool:
        """Verifica si un add-on específico está activo para este inquilino."""
        active_addons = self.get_active_addons()
        return addon_slug in active_addons

    def consume_addon_endpoint(
        self,
        endpoint_path: str,
        method: str = "GET",
        payload: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Consume de forma autenticada un endpoint remoto provisto por un add-on de Néctar Labs.
        """
        clean_path = endpoint_path.lstrip('/')
        url = f"{self.base_url}/{clean_path}"
        headers = self._get_headers()

        try:
            resp = self.session.request(
                method=method.upper(),
                url=url,
                json=payload if payload and method.upper() in ['POST', 'PUT', 'PATCH'] else None,
                params=params,
                headers=headers,
                timeout=self.timeout,
            )
            return {
                "success": resp.status_code in [200, 201, 204],
                "status_code": resp.status_code,
                "data": resp.json() if resp.content and 'application/json' in resp.headers.get('Content-Type', '') else resp.text,
            }
        except Exception as e:
            logger.error(f"[NectarRemoteClient] Error consumiendo endpoint {url}: {e}")
            return {
                "success": False,
                "status_code": 502,
                "error": str(e),
                "data": None,
            }
