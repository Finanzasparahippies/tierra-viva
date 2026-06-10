from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.functional import cached_property
from cloudinary.models import CloudinaryField

class User(AbstractUser):
    # Override email to be unique and required
    email = models.EmailField(unique=True)
    
    ROLE_CHOICES = (
        ("ADMIN", "Admin"),
        ("FAMILY", "Family"),
        ("USER", "User"),
        ("SPONSOR", "Sponsor"),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="USER")
    phone = models.CharField(max_length=20, blank=True, null=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"] # username is still required by AbstractUser but we use email to log in

    def is_family(self):
        return self.role == "FAMILY"

    def is_sponsor(self):
        return self.role == "SPONSOR"
    
    def __str__(self):
        return self.username

    @cached_property
    def max_sponsorship_level(self):
        """Returns the highest level among all active sponsorships."""
        from sponsorship.models import Sponsorship
        active_sponsorships = Sponsorship.objects.filter(user=self, active=True)
        if not active_sponsorships.exists():
            return 0
        
        from django.db.models import Max
        max_level = active_sponsorships.aggregate(Max('tier__level'))['tier__level__max']
        return max_level or 0

    @cached_property
    def total_contributions(self):
        """Calculates the user's total contributions via sponsorships, shop orders, and activity bookings."""
        from sponsorship.models import Sponsorship
        from shop.models import Order
        from activities.models import Booking
        from django.db.models import Sum

        sponsorship_total = Sponsorship.objects.filter(user=self, active=True).aggregate(Sum('amount'))['amount__sum'] or 0
        shop_total = Order.objects.filter(user=self, paid=True).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        booking_total = Booking.objects.filter(user=self, status="PAID").aggregate(Sum('total_price'))['total_price__sum'] or 0
        
        return float(sponsorship_total + shop_total + booking_total)

class FamilyProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='family_profile')
    title = models.CharField(max_length=100, blank=True, help_text="Ej. Fundador, Coordinador")
    bio = models.TextField(blank=True)
    public_email = models.EmailField(blank=True)
    whatsapp = models.CharField(max_length=20, blank=True)
    linkedin_url = models.URLField(blank=True, null=True)
    instagram_url = models.URLField(blank=True, null=True)
    twitter_url = models.URLField(blank=True, null=True)
    photo = CloudinaryField('image', blank=True, null=True)

    def __str__(self):
        return f"Profile of {self.user.username}"
