from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from django.utils import timezone
from .models import Activity, Booking

User = get_user_model()

class ActivitiesAppTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="naturelover@example.com",
            username="naturelover",
            password="natureloverpassword"
        )
        self.activity = Activity.objects.create(
            title="Taller de Permacultura",
            slug="taller-permacultura",
            description="Aprende a diseñar tu huerto orgánico",
            activity_type="WORKSHOP",
            date=timezone.now().date() + timezone.timedelta(days=5),
            time=timezone.now().time(),
            duration="3 horas",
            price=250.00,
            capacity=15,
            is_active=True
        )

    def test_activity_list(self):
        response = self.client.get("/api/activities/")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(len(response.data) > 0)
        self.assertEqual(response.data[0]["title"], "Taller de Permacultura")

    @override_settings(TESTING=True)
    def test_activity_checkout_mock(self):
        self.client.force_authenticate(user=self.user)
        
        # Request checkout for 3 tickets (should hit the mock checkout due to TESTING=True)
        response = self.client.post(f"/api/activities/{self.activity.slug}/checkout/", {"tickets": 3})
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["id"].startswith("mock_"))
        
        # Verify booking created with status PAID
        booking = Booking.objects.first()
        self.assertIsNotNone(booking)
        self.assertEqual(booking.tickets, 3)
        self.assertEqual(booking.status, "PAID")
        self.assertEqual(booking.total_price, 750.00)
        
        # Verify capacity reduced
        self.activity.refresh_from_db()
        self.assertEqual(self.activity.remaining_capacity, 12) # 15 - 3 = 12

    def test_validate_ticket_admin_only(self):
        # 1. Create a paid booking
        booking = Booking.objects.create(
            user=self.user,
            activity=self.activity,
            tickets=2,
            total_price=500.00,
            status='PAID'
        )
        token = booking.token
        
        # 2. Try validating without credentials
        response = self.client.post("/api/activities/bookings/validate/", {"token": token})
        self.assertEqual(response.status_code, 401) # Unauthorized for anonymous users
        
        # 3. Authenticate as normal user and try validating
        self.client.force_authenticate(user=self.user)
        response = self.client.post("/api/activities/bookings/validate/", {"token": token})
        self.assertEqual(response.status_code, 403) # Forbidden
        
        # 4. Authenticate as staff/admin and validate successfully
        admin_user = User.objects.create_superuser(
            email="admin@example.com",
            username="adminuser",
            password="adminpassword"
        )
        self.client.force_authenticate(user=admin_user)
        response = self.client.post("/api/activities/bookings/validate/", {"token": str(token)})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "success")
        
        # Verify scanned flag
        booking.refresh_from_db()
        self.assertTrue(booking.is_scanned)
        self.assertIsNotNone(booking.scanned_at)
