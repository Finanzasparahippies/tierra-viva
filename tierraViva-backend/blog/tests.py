from django.test import TestCase
from rest_framework.test import APIClient
from blog.models import Post

class BlogAppTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.post = Post.objects.create(
            title="Primer Anuncio en el Rancho",
            slug="primer-anuncio-rancho",
            content="Contenido detallado sobre la vida en el rancho...",
            is_public=True,
            author="Tierra Viva"
        )

    def test_post_list_api(self):
        response = self.client.get("/api/posts/")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(len(response.data) > 0)
        self.assertEqual(response.data[0]["title"], "Primer Anuncio en el Rancho")

    def test_post_detail_by_slug_api(self):
        response = self.client.get(f"/api/posts/{self.post.slug}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["title"], "Primer Anuncio en el Rancho")
        self.assertEqual(response.data["content"], "Contenido detallado sobre la vida en el rancho...")
