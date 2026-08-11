from django.db import models
from django.utils.text import slugify
from cloudinary.models import CloudinaryField
from users.models import User
from django_ckeditor_5.fields import CKEditor5Field

class Post(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    content = CKEditor5Field('Content', config_name='extends')
    is_public = models.BooleanField(default=True)
    is_sponsor_only = models.BooleanField(default=False)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    image = CloudinaryField('image', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title) if self.title else "post"
            if not base_slug:
                base_slug = "post"
            unique_slug = base_slug
            num = 1
            while Post.objects.filter(slug=unique_slug).exclude(pk=self.pk).exists():
                unique_slug = f"{base_slug}-{num}"
                num += 1
            self.slug = unique_slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
