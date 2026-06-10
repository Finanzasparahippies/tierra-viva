from rest_framework import serializers
from .models import Product, Order, OrderItem, Cart, CartItem

class ProductSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'category', 'description', 
            'price', 'type', 'unit', 'unit_amount', 'stock', 
            'is_active', 'image', 'image_url'
        ]

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), source='product', write_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_id', 'price', 'quantity', 'get_cost']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    total_cost = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['id', 'user', 'items', 'created_at', 'updated_at', 'paid', 'status', 'total_cost']
        read_only_fields = ['user', 'created_at', 'updated_at', 'paid', 'status']

    def get_total_cost(self, obj):
        return obj.get_total_cost()

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        user = validated_data.get('user')
        order = Order.objects.create(**validated_data)
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        return order

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), source='product', write_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'get_cost']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_cost = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total_cost', 'updated_at']

    def get_total_cost(self, obj):
        return obj.get_total_cost()
