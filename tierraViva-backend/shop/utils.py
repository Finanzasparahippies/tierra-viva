import stripe
from django.conf import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

def get_order_checkout_session(user, order, success_url, cancel_url):
    """
    Creates a Stripe Checkout Session for a shop order.
    """
    line_items = []
    for item in order.items.all():
        product_data = {
            'name': item.product.name,
        }
        if item.product.image:
            product_data['images'] = [item.product.image.url]
            
        line_items.append({
            'price_data': {
                'currency': 'mxn',
                'unit_amount': int(item.price * 100),
                'product_data': product_data,
            },
            'quantity': item.quantity,
        })

    session_data = {
        'payment_method_types': ['card'],
        'line_items': line_items,
        'mode': 'payment',
        'success_url': success_url,
        'cancel_url': cancel_url,
        'customer_email': user.email,
        'metadata': {
            'order_id': order.id,
            'user_id': user.id,
            'type': 'shop_order'
        },
    }
    
    session = stripe.checkout.Session.create(**session_data)
    return session
