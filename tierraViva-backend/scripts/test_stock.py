import os
import django
import sys

# Set up Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from shop.models import Order, Product
from sponsorship.views import handle_successful_payment

def test_stock_reduction(order_id):
    try:
        order = Order.objects.get(id=order_id)
        print(f"--- Before Reduction for Order {order_id} ---")
        for item in order.items.all():
            print(f"Product: {item.product.name} | Current Stock: {item.product.stock} | Order Qty: {item.quantity}")
        
        # Simulate Stripe Session
        mock_session = {
            'metadata': {
                'order_id': str(order_id),
                'user_id': str(order.user.id)
            },
            'payment_intent': 'pi_mock_123'
        }
        
        print("\nTriggering handle_successful_payment...")
        handle_successful_payment(mock_session)
        
        # Refresh from DB
        print("\n--- After Reduction ---")
        for item in order.items.all():
            p = Product.objects.get(id=item.product.id)
            print(f"Product: {p.name} | New Stock: {p.stock}")
            
    except Order.DoesNotExist:
        print(f"Order {order_id} not found.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/test_stock.py <order_id>")
    else:
        test_stock_reduction(sys.argv[1])
