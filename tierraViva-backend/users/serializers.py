from rest_framework import serializers
from .models import User, FamilyProfile

class FamilyProfileSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = FamilyProfile
        fields = ["id", "title", "bio", "public_email", "whatsapp", "linkedin_url", "instagram_url", "twitter_url", "photo", "photo_url"]

    def get_photo_url(self, obj):
        if obj.photo:
            return obj.photo.url
        return None

class UserSerializer(serializers.ModelSerializer):
    family_profile = FamilyProfileSerializer(read_only=True)
    password = serializers.CharField(write_only=True, required=True)
    username = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "role", "password", "family_profile", "is_staff", "max_sponsorship_level", "total_contributions", "date_joined")
        read_only_fields = ("is_staff", "max_sponsorship_level", "total_contributions", "date_joined")

    def create(self, validated_data):
        password = validated_data.pop("password")
        if 'username' not in validated_data or not validated_data['username']:
            validated_data['username'] = validated_data.get('email')
        
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetConfirmSerializer(serializers.Serializer):
    uidb64 = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)
