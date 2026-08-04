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

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

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
