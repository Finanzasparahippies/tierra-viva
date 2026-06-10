import stripe
from django.conf import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

def create_stripe_product_and_price(tier):
    """
    Creates a Product and two Prices (Monthly and Annual) in Stripe for a given SponsorshipTier.
    Returns a dict with stripe price IDs.
    """
    images = []
    if hasattr(tier, 'image') and tier.image:
        images.append(tier.image.url)

    # Create Product
    product = stripe.Product.create(
        name=tier.name,
        description=tier.description,
        images=images if images else None,
    )
    
    # Create Monthly Price
    monthly_price = stripe.Price.create(
        unit_amount=int(tier.price * 100),
        currency="mxn",
        product=product.id,
        recurring={"interval": "month"} if tier.type == "SUBSCRIPTION" else None,
    )
    
    price_ids = {'monthly': monthly_price.id}

    # Create Annual Price (only if SUBSCRIPTION)
    if tier.type == "SUBSCRIPTION":
        # price_annual is already calculated in the model's save method
        annual_price = stripe.Price.create(
            unit_amount=int(tier.price_annual * 100),
            currency="mxn",
            product=product.id,
            recurring={"interval": "year"},
        )
        price_ids['annual'] = annual_price.id
        
    return price_ids

def get_checkout_session(user, tier, success_url, cancel_url, animal_id=None, is_annual=False):
    """
    Creates a Stripe Checkout Session for a sponsorship.
    """
    metadata = {
        "user_id": user.id,
        "tier_id": tier.id,
        "billing_cycle": "ANNUAL" if is_annual else "MONTHLY"
    }
    if animal_id:
        metadata["animal_id"] = animal_id
        
    price_id = tier.stripe_price_id_annual if is_annual and tier.stripe_price_id_annual else tier.stripe_price_id

    session_data = {
        "payment_method_types": ["card"],
        "line_items": [{
            "price": price_id,
            "quantity": 1,
        }],
        "mode": "subscription" if tier.type == "SUBSCRIPTION" else "payment",
        "success_url": success_url,
        "cancel_url": cancel_url,
        "customer_email": user.email,
        "metadata": metadata,
    }
    
    session = stripe.checkout.Session.create(**session_data)
    return session
