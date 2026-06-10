from django.contrib import admin
from .models import Activity, ActivityImage, Booking

class ActivityImageInline(admin.TabularInline):
    model = ActivityImage
    extra = 3

@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ('title', 'activity_type', 'date', 'time', 'price', 'remaining_capacity', 'is_active')
    list_filter = ('activity_type', 'date', 'is_active')
    search_fields = ('title', 'description')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [ActivityImageInline]

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'activity', 'tickets', 'total_price', 'status', 'created_at')
    list_filter = ('status', 'created_at', 'activity')
    search_fields = ('user__username', 'activity__title', 'stripe_payment_intent')
    readonly_fields = ('created_at', 'updated_at')
