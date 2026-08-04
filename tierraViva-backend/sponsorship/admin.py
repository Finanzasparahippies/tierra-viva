from django.contrib import admin
from .utils import create_stripe_product_and_price
from .models import SponsorshipTier, Sponsorship, RanchUpdate, RanchUpdateImage

class RanchUpdateImageInline(admin.TabularInline):
    model = RanchUpdateImage
    extra = 3

@admin.register(SponsorshipTier)
class SponsorshipTierAdmin(admin.ModelAdmin):
    list_display = ('name', 'level', 'type', 'price', 'is_active')
    list_filter = ('type', 'is_active')
    search_fields = ('name', 'description')

@admin.register(Sponsorship)
class SponsorshipAdmin(admin.ModelAdmin):
    list_display = ('user', 'animal', 'tier', 'amount', 'active', 'start_date')
    list_filter = ('active', 'tier', 'start_date')
    search_fields = ('user__username', 'animal__name')

@admin.register(RanchUpdate)
class RanchUpdateAdmin(admin.ModelAdmin):
    list_display = ('title', 'min_tier_level', 'created_at')
    list_filter = ('min_tier_level', 'created_at')
    search_fields = ('title', 'content')
    inlines = [RanchUpdateImageInline]
