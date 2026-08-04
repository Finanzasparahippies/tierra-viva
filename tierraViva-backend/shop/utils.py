import stripe
from django.conf import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

def get_order_checkout_session(user, order, success_url, cancel_url):
    """
    Creates a Stripe Checkout Session for a shop order.
    """
    from sponsorship.utils import get_or_create_stripe_customer

    line_items = []
    for item in order.items.all():
        # Ensure the product is synced to Stripe
        if not item.product.stripe_price_id:
            item.product.save()

        if item.product.stripe_price_id:
            line_items.append({
                'price': item.product.stripe_price_id,
                'quantity': item.quantity,
            })
        else:
            # Fallback for testing or missing keys
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

    customer_id = get_or_create_stripe_customer(user)

    session_data = {
        'payment_method_types': ['card'],
        'line_items': line_items,
        'mode': 'payment',
        'success_url': success_url,
        'cancel_url': cancel_url,
        'customer': customer_id,
        'metadata': {
            'order_id': order.id,
            'user_id': user.id,
            'type': 'shop_order'
        },
    }
    
    session = stripe.checkout.Session.create(**session_data)
    return session
