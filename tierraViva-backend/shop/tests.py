from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from .models import Product, Order, OrderItem, Cart, CartItem

User = get_user_model()

class ShopAppTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="shopper@example.com",
            username="shopper",
            password="shopperpassword"
        )
        self.product = Product.objects.create(
            name="Miel Orgánica",
            slug="miel-organica",
            description="Miel pura de abeja",
            price=150.00,
            type="IMMEDIATE",
            stock=10,
            is_active=True
        )
        # Create user cart
        self.cart = Cart.objects.create(user=self.user)

    def test_product_list_anonymous(self):
        response = self.client.get("/api/products/")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(len(response.data) > 0)
        self.assertEqual(response.data[0]["name"], "Miel Orgánica")

    def test_cart_operations(self):
        self.client.force_authenticate(user=self.user)
        
        # 1. Add item to cart
        response = self.client.post("/api/cart/add_item/", {"product_id": self.product.id, "quantity": 2})
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.cart.items.count(), 1)
        self.assertEqual(self.user.cart.items.first().quantity, 2)

        # 2. Get cart details (mine endpoint)
        response = self.client.get("/api/cart/mine/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["items"][0]["product"]["name"], "Miel Orgánica")

        # 3. Remove item from cart
        response = self.client.post("/api/cart/remove_item/", {"product_id": self.product.id})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.user.cart.items.count(), 0)

    def test_order_creation_and_payment_confirmation(self):
        self.client.force_authenticate(user=self.user)
        
        # 1. Add item to cart
        CartItem.objects.create(cart=self.cart, product=self.product, quantity=3)
        
        # 2. Create order
        response = self.client.post("/api/orders/", {
            "items": [
                {
                    "product_id": self.product.id,
                    "price": self.product.price,
                    "quantity": 3
                }
            ]
        }, format="json")
        self.assertEqual(response.status_code, 201)
        order_id = response.data["id"]
        order = Order.objects.get(id=order_id)

        # 3. Confirm order payment
        response = self.client.post(f"/api/orders/{order_id}/confirm/")
        self.assertEqual(response.status_code, 200)
        
        order.refresh_from_db()
        self.assertEqual(order.status, "PAID")
        self.assertTrue(order.paid)
        
        # 4. Check stock reduced
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 7) # 10 - 3 = 7

        # 5. Check cart cleared
        self.cart.refresh_from_db()
        self.assertEqual(self.cart.items.count(), 0)
