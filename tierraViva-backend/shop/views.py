from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Product, Order, OrderItem, Cart, CartItem
from .serializers import ProductSerializer, OrderSerializer, CartSerializer, CartItemSerializer

from .utils import get_order_checkout_session

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.is_staff:
            return Product.objects.all()
        return Product.objects.filter(is_active=True)

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def checkout(self, request, pk=None):
        order = self.get_object()
        from django.conf import settings
        success_url = request.data.get('success_url', f"{settings.FRONTEND_URL}/success")
        # Append order_id to success URL for frontend confirmation
        if '?' in success_url:
            success_url += f"&order_id={order.id}"
        else:
            success_url += f"?order_id={order.id}"
            
        cancel_url = request.data.get('cancel_url', f"{settings.FRONTEND_URL}/cancel")
        
        try:
            session = get_order_checkout_session(request.user, order, success_url, cancel_url)
            return Response({'checkout_url': session.url})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        from django.db import transaction
        try:
            with transaction.atomic():
                order = Order.objects.select_for_update().get(pk=pk, user=request.user)
                order.complete_payment()
            return Response({'status': 'payment confirmed and stock updated'})
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class CartViewSet(viewsets.ModelViewSet):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)

    def get_object(self):
        # Always return the current user's cart
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart

    @action(detail=False, methods=['get'])
    def mine(self, request):
        cart = self.get_object()
        serializer = self.get_serializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        cart = self.get_object()
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
        
        try:
            product = Product.objects.get(id=product_id)
            item, created = CartItem.objects.get_or_create(cart=cart, product=product)
            if not created:
                item.quantity += quantity
            else:
                item.quantity = quantity
            item.save()
            return Response(CartSerializer(cart).data)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        cart = self.get_object()
        product_id = request.data.get('product_id')
        try:
            item = CartItem.objects.get(cart=cart, product_id=product_id)
            item.delete()
            return Response(CartSerializer(cart).data)
        except CartItem.DoesNotExist:
            return Response({'error': 'Item not found in cart'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def clear(self, request):
        cart = self.get_object()
        cart.items.all().delete()
        return Response(CartSerializer(cart).data)
