# Tierra Viva - Developer Documentation

Engineering-focused guide covering architecture, API endpoints, Stripe workflows, security, and verification systems.

---

## 🏛️ Architecture Overview

The system is built on a split architecture:
- **Backend**: Django 6.0 REST Framework (DRF) serving JSON APIs, integrated with Cloudinary for assets and Stripe for billing.
- **Frontend**: Next.js 14 Web Application styled with Vanilla CSS and custom premium components.

---

## 🔒 Security & Authorization

We enforce custom permission scopes:
- **`IsStaffOrReadOnly`** ([permissions.py](file:///c:/Users/Agent/OneDrive/Documents/proyects/tierraviva/tierraViva-backend/config/permissions.py)): Reusable DRF permission that allows safe methods (`GET`, `HEAD`, `OPTIONS`) to anyone, but restricts mutation verbs (`POST`, `PUT`, `PATCH`, `DELETE`) strictly to authenticated users with role `ADMIN` or `FAMILY`.
- **Global Defaults**: Applied in `config/settings.py` so that all ModelViewSets inherit staff restrictions by default.

---

## 💳 Stripe Billing Flow & Idempotency

### 1. Unified Customer Database
- User accounts contain a `stripe_customer_id` field.
- During any checkout (Shop, Activity, Sponsorship), `get_or_create_stripe_customer()` is evaluated. If not present in DB, a customer profile is created in Stripe and saved locally, avoiding duplicate profiles.

### 2. Auto-Sync Products & Tiers
- When saving a `Product` or `SponsorshipTier` in Django Admin or from the AdminConfig frontend panel, `save()` automatically searches Stripe for existing records (via slug/metadata) and creates/modifies the corresponding product and price on Stripe.
- Prevents desynchronization without requiring manual Stripe console mapping.

### 3. Webhook Payment Resolution
- Located in `sponsorship/views.py` ([views.py](file:///c:/Users/Agent/OneDrive/Documents/proyects/tierraviva/tierraViva-backend/sponsorship/views.py)).
- Processes `checkout.session.completed` and `payment_intent.succeeded` for payments.
- Employs **Stripe Webhook Idempotency**: Each payload is logged to the `StripeEvent` table by its unique Stripe event ID. Duplicate requests are short-circuited with a `200 Event already processed` response, protecting inventory reduction and ticket delivery.
- Handles `customer.subscription.deleted` to dynamically deactivate sponsorships in the database when a subscription cancels.

---

## 🧪 Testing

Run backend tests using:
```bash
./nectar.sh test-staging
```

Run frontend tests using:
```bash
./nectar.sh test-frontend-staging
```
