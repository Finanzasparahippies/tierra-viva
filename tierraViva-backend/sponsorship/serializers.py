from rest_framework import serializers
from .models import Sponsorship, SponsorshipTier, RanchUpdate, RanchUpdateImage, RanchUpdateTag

class RanchUpdateTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = RanchUpdateTag
        fields = ['id', 'name', 'slug']

class SponsorshipTierSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    class Meta:
        model = SponsorshipTier
        fields = "__all__"

    def get_image_url(self, obj):
        if obj.image:
            url = obj.image.url
            if url.startswith('http://'):
                url = url.replace('http://', 'https://')
            return url
        return None

class SponsorshipSerializer(serializers.ModelSerializer):
    tier_name = serializers.ReadOnlyField(source='tier.name')
    animal_name = serializers.ReadOnlyField(source='animal.name')

    class Meta:
        model = Sponsorship
        fields = "__all__"

class RanchUpdateImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    class Meta:
        model = RanchUpdateImage
        fields = ['id', 'url', 'caption', 'order']

    def get_url(self, obj):
        if obj.image:
            url = obj.image.url
            if url.startswith('http://'):
                url = url.replace('http://', 'https://')
            return url
        return None

class RanchUpdateSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    is_locked = serializers.SerializerMethodField()
    excerpt = serializers.SerializerMethodField()
    gallery = RanchUpdateImageSerializer(many=True, read_only=True)
    tags = RanchUpdateTagSerializer(many=True, read_only=True)
    author_name = serializers.ReadOnlyField(source='author.username')
    author_role = serializers.SerializerMethodField()

    class Meta:
        model = RanchUpdate
        fields = ['id', 'title', 'content', 'excerpt', 'image_url', 'gallery', 'tags', 'min_tier_level', 'is_locked', 'author_name', 'author_role', 'created_at']

    def get_author_role(self, obj):
        if not obj.author:
            return "Staff"
        try:
            return obj.author.family_profile.title or obj.author.get_role_display()
        except:
            return obj.author.get_role_display()

    def get_image_url(self, obj):
        if obj.image:
            url = obj.image.url
            if url.startswith('http://'):
                url = url.replace('http://', 'https://')
            return url
        return None

    def _get_user_level(self):
        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            return 0
        return request.user.max_sponsorship_level

    def get_is_locked(self, obj):
        return self._get_user_level() < obj.min_tier_level

    def get_excerpt(self, obj):
        from django.utils.html import strip_tags
        clean_text = strip_tags(obj.content)
        return clean_text[:200] + "..." if len(clean_text) > 200 else clean_text
