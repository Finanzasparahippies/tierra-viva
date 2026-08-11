from django.db import models
from cloudinary.models import CloudinaryField

from django.utils.text import slugify

class Product(models.Model):

    TYPE_CHOICES = (
        ("IMMEDIATE", "Immediate"),
        ("PREORDER", "Preorder"),
    )
    
    UNIT_CHOICES = (
        ("GRAMS", "Gramos"),
        ("KILOS", "Kilos"),
        ("LITERS", "Litros"),
        ("PIECE", "Pieza"),
    )

    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    category = models.CharField(max_length=100, blank=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES, default="PIECE")
    unit_amount = models.DecimalField(max_digits=10, decimal_places=2, default=1.0)
    stock = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    image = CloudinaryField('image', blank=True, null=True)
    stripe_product_id = models.CharField(max_length=255, blank=True, null=True, help_text="ID del producto en Stripe")
    stripe_price_id = models.CharField(max_length=255, blank=True, null=True, help_text="ID del precio en Stripe")

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

        from django.conf import settings
        import stripe

        updated = False
        stripe_key = getattr(settings, 'STRIPE_SECRET_KEY', '')
        placeholder_patterns = ['change_me', 'replace_me', 'test_mock', 'placeholder', 'your_']
        no_key = not stripe_key
        bad_key = any(p in stripe_key for p in placeholder_patterns)
        
        if stripe_key and not bad_key and not getattr(settings, "TESTING", False) and (not self.stripe_product_id or not self.stripe_price_id):
            stripe.api_key = settings.STRIPE_SECRET_KEY
            try:
                # Search for existing Stripe Product with this slug or id
                product = None
                for p in stripe.Product.list(limit=100).auto_paging_iter():
                    if p.active and (p.metadata.get("product_slug") == self.slug or p.metadata.get("product_id") == str(self.id)):
                        product = p
                        break
                
                expected_name = f"[Tierra Viva] {self.name}"
                if not product:
                    product = stripe.Product.create(
                        name=expected_name,
                        description=self.description or "",
                        metadata={"product_id": str(self.id), "product_slug": self.slug}
                    )
                else:
                    # Update details if changed
                    updates = {}
                    if product.name != expected_name:
                        updates["name"] = expected_name
                    if product.description != self.description:
                        updates["description"] = self.description
                    current_product_id = product.metadata.get("product_id")
                    current_product_slug = product.metadata.get("product_slug")
                    if current_product_id != str(self.id) or current_product_slug != self.slug:
                        updates["metadata"] = {"product_id": str(self.id), "product_slug": self.slug}
                    if updates:
                        stripe.Product.modify(product.id, **updates)

                self.stripe_product_id = product.id

                # Fetch active prices for this product to avoid duplicates
                prices = stripe.Price.list(product=product.id, active=True)
                price_id = None
                amount_cents = int(self.price * 100)
                for p in prices.data:
                    if not p.recurring and p.unit_amount == amount_cents and p.currency == "mxn":
                        price_id = p.id
                        break

                if not price_id:
                    price_obj = stripe.Price.create(
                        unit_amount=amount_cents,
                        currency="mxn",
                        product=product.id,
                    )
                    price_id = price_obj.id

                self.stripe_price_id = price_id
                updated = True
            except Exception as e:
                import logging
                logging.getLogger("apps").error(f"Error creating Stripe Product/Prices for Product {self.name}: {e}", exc_info=True)

        if updated:
            super().save(update_fields=['stripe_product_id', 'stripe_price_id'])

    def __str__(self):
        return self.name

class Order(models.Model):
    user = models.ForeignKey('users.User', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid = models.BooleanField(default=False)
    stripe_payment_intent = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=20, default="PENDING", choices=(
        ("PENDING", "Pending"),
        ("PAID", "Paid"),
        ("SHIPPED", "Shipped"),
        ("DELIVERED", "Delivered"),
        ("CANCELLED", "Cancelled"),
    ))

    def complete_payment(self, stripe_payment_intent=None):
        if self.paid:
            return
        
        from django.db import transaction
        from django.db.models import F
        
        with transaction.atomic():
            self.paid = True
            self.status = "PAID"
            if stripe_payment_intent:
                self.stripe_payment_intent = stripe_payment_intent
            self.save()

            # Reduce stock
            for item in self.items.all():
                Product.objects.filter(id=item.product.id).update(stock=F('stock') - item.quantity)
            
            # Clear user's cart
            try:
                cart = Cart.objects.get(user=self.user)
                cart.items.all().delete()
            except Cart.DoesNotExist:
                pass

    def get_total_cost(self):
        return sum(item.get_cost() for item in self.items.all())

    def __str__(self):
        return f"Order {self.id}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name='order_items', on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)

    def get_cost(self):
        return self.price * self.quantity

    def __str__(self):
        return str(self.id)

class Cart(models.Model):
    user = models.OneToOneField('users.User', related_name='cart', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart for {self.user.username}"

    def get_total_cost(self):
        return sum(item.get_cost() for item in self.items.all())

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"

    def get_cost(self):
        return self.product.price * self.quantity
