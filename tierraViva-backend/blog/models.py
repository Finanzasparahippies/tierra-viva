from django.db import models
from cloudinary.models import CloudinaryField
from users.models import User
from django_ckeditor_5.fields import CKEditor5Field

class Post(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    content = CKEditor5Field('Content', config_name='extends')
    is_public = models.BooleanField(default=True)
    is_sponsor_only = models.BooleanField(default=False)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    image = CloudinaryField('image', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
