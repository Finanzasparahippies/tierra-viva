from django.db import models
from users.models import User
from animals.models import Animal
from cloudinary.models import CloudinaryField
from django_ckeditor_5.fields import CKEditor5Field

class SponsorshipTier(models.Model):
    TYPE_CHOICES = (
        ("DONATION", "One-time Donation"),
        ("SUBSCRIPTION", "Monthly Subscription"),
    )
    name = models.CharField(max_length=100)
    level = models.IntegerField(default=0, help_text="Higher level means more access")
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="SUBSCRIPTION")
    is_active = models.BooleanField(default=True, help_text="Uncheck to hide this tier from the frontend.")
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Price in pesos per month")
    price_annual = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Price in pesos per year (e.g. Price * 10)")
    stripe_price_id = models.CharField(max_length=255, blank=True, null=True)
    stripe_price_id_annual = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True)
    image = CloudinaryField('image', blank=True, null=True)

    def save(self, *args, **kwargs):
        # Calculate annual price if not set (10 months instead of 12)
        if self.type == "SUBSCRIPTION" and not self.price_annual and self.price:
            self.price_annual = self.price * 10
            
        super().save(*args, **kwargs)
        
        # We need another save if we create IDs in Stripe
        updated = False
        if not self.stripe_price_id or (self.type == "SUBSCRIPTION" and not self.stripe_price_id_annual):
            from .utils import create_stripe_product_and_price
            try:
                # This function now returns a dict or tuple with both IDs
                price_ids = create_stripe_product_and_price(self)
                self.stripe_price_id = price_ids.get('monthly')
                self.stripe_price_id_annual = price_ids.get('annual')
                updated = True
            except Exception as e:
                print(f"Error creating Stripe Product for Tier {self.id}: {e}")
        
        if updated:
            super().save(update_fields=['stripe_price_id', 'stripe_price_id_annual'])

    def __str__(self):
        return f"{self.name} (Level {self.level})"

class RanchUpdateTag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class Sponsorship(models.Model):
    BILLING_CYCLE_CHOICES = (
        ("MONTHLY", "Mensual"),
        ("ANNUAL", "Anual"),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sponsorships')
    animal = models.ForeignKey(Animal, on_delete=models.CASCADE, null=True, blank=True, help_text="Leave blank for general ranch support")
    tier = models.ForeignKey(SponsorshipTier, on_delete=models.PROTECT, null=True)
    billing_cycle = models.CharField(max_length=10, choices=BILLING_CYCLE_CHOICES, default="MONTHLY")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    stripe_subscription_id = models.CharField(max_length=255, blank=True, null=True)
    stripe_payment_intent = models.CharField(max_length=255, blank=True, null=True)
    active = models.BooleanField(default=True)
    start_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        target = self.animal.name if self.animal else "Ranch"
        return f"{self.user} - {target} ({self.tier.name if self.tier else 'Custom'})"

class RanchUpdate(models.Model):
    title = models.CharField(max_length=255)
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, help_text="Who wrote this update")
    content = CKEditor5Field('Content', config_name='extends')
    image = CloudinaryField('image', blank=True, null=True, help_text="Main featured image")
    min_tier_level = models.IntegerField(default=0, help_text="Minimum level to view this update. 0 for public.")
    tags = models.ManyToManyField(RanchUpdateTag, blank=True, related_name='updates')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

class RanchUpdateImage(models.Model):
    update = models.ForeignKey(RanchUpdate, related_name='gallery', on_delete=models.CASCADE)
    image = CloudinaryField('image')
    caption = models.CharField(max_length=255, blank=True, null=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Image for {self.update.title}"

class StripeEvent(models.Model):
    event_id = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.event_id

