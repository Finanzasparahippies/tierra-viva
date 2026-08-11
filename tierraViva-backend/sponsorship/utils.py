import stripe
from django.conf import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

def get_or_create_stripe_customer(user):
    """
    Retrieves the stripe_customer_id from the user or creates one in Stripe.
    """
    if getattr(settings, 'TESTING', False):
        return "mock_cus_123"

    if user.stripe_customer_id:
        return user.stripe_customer_id

    stripe_key = getattr(settings, 'STRIPE_SECRET_KEY', '')
    placeholder_patterns = ['change_me', 'replace_me', 'test_mock', 'placeholder', 'your_']
    no_key = not stripe_key
    bad_key = any(p in stripe_key for p in placeholder_patterns)
    if no_key or bad_key:
        return "mock_cus_placeholder"

    try:
        stripe.api_key = settings.STRIPE_SECRET_KEY
        customer = stripe.Customer.create(
            email=user.email,
            name=f"{user.first_name} {user.last_name}".strip() or user.username,
            metadata={"user_id": str(user.id)}
        )
        user.stripe_customer_id = customer.id
        user.save(update_fields=['stripe_customer_id'])
        return customer.id
    except Exception as e:
        import logging
        logging.getLogger("apps").error(f"Error creating Stripe Customer for {user.email}: {e}", exc_info=True)
        return "mock_cus_fallback"

def create_stripe_product_and_price(tier):
    """
    Creates a Product and two Prices (Monthly and Annual) in Stripe for a given SponsorshipTier.
    Checks Stripe first to avoid duplicates.
    Returns a dict with stripe price IDs.
    """
    if getattr(settings, 'TESTING', False):
        return {'monthly': 'mock_monthly_price_id', 'annual': 'mock_annual_price_id'}

    stripe_key = getattr(settings, 'STRIPE_SECRET_KEY', '')
    placeholder_patterns = ['change_me', 'replace_me', 'test_mock', 'placeholder', 'your_']
    no_key = not stripe_key
    bad_key = any(p in stripe_key for p in placeholder_patterns)
    if no_key or bad_key:
        return {'monthly': 'mock_monthly_price_id', 'annual': 'mock_annual_price_id'}

    stripe.api_key = settings.STRIPE_SECRET_KEY

    # Search for existing Product
    product = None
    try:
        for p in stripe.Product.list(limit=100).auto_paging_iter():
            if p.active and p.metadata.get("tier_id") == str(tier.id):
                product = p
                break
    except Exception as e:
        import logging
        logging.getLogger("apps").error(f"Error listing Stripe products: {e}", exc_info=True)

    images = []
    if hasattr(tier, 'image') and tier.image:
        images.append(tier.image.url)

    expected_name = f"[Tierra Viva] {tier.name}"
    if not product:
        product = stripe.Product.create(
            name=expected_name,
            description=tier.description or "",
            images=images if images else None,
            metadata={"tier_id": str(tier.id)}
        )
    else:
        updates = {}
        if product.name != expected_name:
            updates["name"] = expected_name
        if product.description != (tier.description or ""):
            updates["description"] = tier.description or ""
        if updates:
            stripe.Product.modify(product.id, **updates)

    # Get monthly price
    monthly_price_id = None
    try:
        prices = stripe.Price.list(product=product.id, active=True)
        amount_cents = int(tier.price * 100)
        for p in prices.data:
            is_monthly = p.recurring and p.recurring.get("interval") == "month" if tier.type == "SUBSCRIPTION" else not p.recurring
            if is_monthly and p.unit_amount == amount_cents and p.currency == "mxn":
                monthly_price_id = p.id
                break
    except Exception as e:
        import logging
        logging.getLogger("apps").error(f"Error checking monthly price: {e}", exc_info=True)

    if not monthly_price_id:
        monthly_price = stripe.Price.create(
            unit_amount=int(tier.price * 100),
            currency="mxn",
            product=product.id,
            recurring={"interval": "month"} if tier.type == "SUBSCRIPTION" else None,
        )
        monthly_price_id = monthly_price.id

    price_ids = {'monthly': monthly_price_id}

    if tier.type == "SUBSCRIPTION":
        annual_price_id = None
        try:
            amount_cents_annual = int(tier.price_annual * 100)
            for p in prices.data:
                is_annual = p.recurring and p.recurring.get("interval") == "year"
                if is_annual and p.unit_amount == amount_cents_annual and p.currency == "mxn":
                    annual_price_id = p.id
                    break
        except Exception as e:
            import logging
            logging.getLogger("apps").error(f"Error checking annual price: {e}", exc_info=True)

        if not annual_price_id:
            annual_price = stripe.Price.create(
                unit_amount=int(tier.price_annual * 100),
                currency="mxn",
                product=product.id,
                recurring={"interval": "year"},
            )
            annual_price_id = annual_price.id
        price_ids['annual'] = annual_price_id

    return price_ids

def get_checkout_session(user, tier, success_url, cancel_url, animal_id=None, is_annual=False):
    """
    Creates a Stripe Checkout Session for a sponsorship.
    Auto-regenerates Stripe Product and Prices if the stored price_id is invalid or missing in Stripe.
    """
    import logging
    logger = logging.getLogger("apps")

    # If tier has missing prices, generate them
    if not tier.stripe_price_id or (tier.type == "SUBSCRIPTION" and is_annual and not tier.stripe_price_id_annual):
        prices = create_stripe_product_and_price(tier)
        tier.stripe_price_id = prices.get('monthly')
        if tier.type == "SUBSCRIPTION":
            tier.stripe_price_id_annual = prices.get('annual')
        tier.save(update_fields=['stripe_price_id', 'stripe_price_id_annual'])

    metadata = {
        "user_id": user.id,
        "tier_id": tier.id,
        "billing_cycle": "ANNUAL" if is_annual else "MONTHLY"
    }
    if animal_id:
        metadata["animal_id"] = animal_id
        
    price_id = tier.stripe_price_id_annual if is_annual and tier.stripe_price_id_annual else tier.stripe_price_id
    customer_id = get_or_create_stripe_customer(user)

    def _create_session(pid):
        return stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price": pid,
                "quantity": 1,
            }],
            mode="subscription" if tier.type == "SUBSCRIPTION" else "payment",
            success_url=success_url,
            cancel_url=cancel_url,
            customer=customer_id,
            metadata=metadata,
        )

    try:
        return _create_session(price_id)
    except stripe.error.InvalidRequestError as err:
        err_msg = str(err)
        if "No such price" in err_msg or getattr(err, 'code', '') == "resource_missing" or "invalid" in err_msg.lower():
            logger.warning(f"Stripe price '{price_id}' invalid for Tier '{tier.name}' ({tier.id}). Regenerating prices... Error: {err_msg}")
            prices = create_stripe_product_and_price(tier)
            tier.stripe_price_id = prices.get('monthly')
            if tier.type == "SUBSCRIPTION":
                tier.stripe_price_id_annual = prices.get('annual')
            tier.save(update_fields=['stripe_price_id', 'stripe_price_id_annual'])
            
            new_price_id = tier.stripe_price_id_annual if is_annual and tier.stripe_price_id_annual else tier.stripe_price_id
            logger.info(f"Retrying Stripe Checkout Session with new price '{new_price_id}' for Tier '{tier.name}'.")
            return _create_session(new_price_id)
        raise err
