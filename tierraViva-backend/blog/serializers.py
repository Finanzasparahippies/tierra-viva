from rest_framework import serializers
from .models import Post

class PostSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.username')
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'title', 'slug', 'content', 'image', 'image_url', 
            'is_public', 'is_sponsor_only', 'author', 'author_name', 'created_at'
        ]
        read_only_fields = ['slug', 'author']

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None
