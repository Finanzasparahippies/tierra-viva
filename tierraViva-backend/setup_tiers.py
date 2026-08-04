import os
import django
from decimal import Decimal

# Setup Django environment manually
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from sponsorship.models import SponsorshipTier

tiers_data = [
    {"name": "Membresía Tierra", "level": 1, "price": Decimal('99.00'), "description": "Apoya con $99 al mes. Acceso a actualizaciones básicas del rancho."},
    {"name": "Membresía Semilla", "level": 2, "price": Decimal('199.00'), "description": "Apoya con $199 al mes. Actualizaciones y fotos exclusivas del animal."},
    {"name": "Membresía Cosecha", "level": 3, "price": Decimal('399.00'), "description": "Apoya con $399 al mes. Videos mensuales y envío de reconocimientos."},
    {"name": "Membresía Guardián", "level": 4, "price": Decimal('999.00'), "description": "Apoya con $999 al mes. Conviértete en Guardián de la Vida. Incluye visita programada al rancho."},
]

for t in tiers_data:
    tier, created = SponsorshipTier.objects.get_or_create(level=t['level'], defaults=t)
    if not created:
        tier.name = t['name']
        tier.price = t['price']
        tier.description = t['description']
        tier.save()
        print(f"Updated tier: {tier.name} (${tier.price})")
    else:
        print(f"Created tier: {tier.name} (${tier.price})")

print("Sponsorship tiers setup successfully!")
