from rest_framework import serializers
from .models import RescueRequest

class RescueRequestSerializer(serializers.ModelSerializer):
    animal_type_display = serializers.CharField(source='get_animal_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = RescueRequest
        fields = [
            'id', 'user', 'email', 'animal_type', 'animal_type_display', 'other_species',
            'description', 'latitude', 'longitude', 'address', 'phone',
            'status', 'status_display', 'photo', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'status', 'created_at', 'updated_at']

    def create(self, validated_data):
        # Automatically assign the user if authenticated
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user
        return super().create(validated_data)
