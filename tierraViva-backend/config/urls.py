"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from users.views import UserViewSet
from animals.views import AnimalViewSet, AnimalContentFolderViewSet, SpeciesViewSet
from shop.views import ProductViewSet, OrderViewSet, CartViewSet
from blog.views import PostViewSet
from newsletter.views import SubscriberViewSet
from rescues.views import RescueRequestViewSet

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'animals', AnimalViewSet)
router.register(r'species', SpeciesViewSet, basename='species')
router.register(r'ranch-folders', AnimalContentFolderViewSet, basename='ranch-folders')
router.register(r'products', ProductViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'posts', PostViewSet)
router.register(r'subscribers', SubscriberViewSet)
router.register(r'rescues', RescueRequestViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/blog/", include("blog.urls")),
    path("api/newsletter/", include("newsletter.urls")),
    path("api/activities/", include("activities.urls")),
    path('api/', include(router.urls)),
    path('api/sponsorship/', include('sponsorship.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/assistant/', include('assistant.urls')),
    path("ckeditor5/", include("django_ckeditor_5.urls")),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
