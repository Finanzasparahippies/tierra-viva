from rest_framework import viewsets, permissions
from django.shortcuts import get_object_or_404
from .models import Post
from .serializers import PostSerializer

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_object(self):
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field or 'pk'
        lookup_val = self.kwargs.get(lookup_url_kwarg) or self.kwargs.get('pk') or self.kwargs.get('slug')

        if lookup_val is not None:
            if str(lookup_val).isdigit():
                return get_object_or_404(Post, pk=int(lookup_val))
            return get_object_or_404(Post, slug=lookup_val)

        return super().get_object()

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
