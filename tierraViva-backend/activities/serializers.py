from rest_framework import serializers
from .models import Activity, ActivityImage, Booking

class ActivityImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    class Meta:
        model = ActivityImage
        fields = ['id', 'url', 'caption', 'order']

    def get_url(self, obj):
        if obj.image:
            url = obj.image.url
            if url.startswith('http://'):
                url = url.replace('http://', 'https://')
            return url
        return None

class ActivitySerializer(serializers.ModelSerializer):
    gallery = ActivityImageSerializer(many=True, read_only=True)
    type_display = serializers.CharField(source='get_activity_type_display', read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Activity
        fields = [
            'id', 'title', 'slug', 'description', 'activity_type', 'type_display',
            'date', 'time', 'duration', 'price', 'capacity', 'remaining_capacity',
            'location', 'image_url', 'gallery', 'is_active', 'created_at'
        ]

    def get_image_url(self, obj):
        if obj.image:
            url = obj.image.url
            if url.startswith('http://'):
                url = url.replace('http://', 'https://')
            return url
        return None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Ensure description images use absolute URLs if they are relative
        if data.get('description'):
            from django.conf import settings
            # Simple replacement for relative paths if found
            if '/media/uploads/' in data['description']:
                backend_url = settings.PUBLIC_URL if hasattr(settings, 'PUBLIC_URL') else 'http://localhost:8000'
                data['description'] = data['description'].replace('/media/uploads/', f'{backend_url}/media/uploads/')
        return data

class BookingSerializer(serializers.ModelSerializer):
    activity_title = serializers.ReadOnlyField(source='activity.title')
    user_name = serializers.ReadOnlyField(source='user.username')
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'user', 'user_name', 'activity', 'activity_title', 
            'tickets', 'total_price', 'status', 'status_display',
            'stripe_payment_intent', 'created_at'
        ]
        read_only_fields = ['user', 'status', 'total_price', 'stripe_payment_intent', 'created_at']
