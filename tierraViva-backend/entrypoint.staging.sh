#!/bin/sh
set -e

echo "=== Starting Tierra Viva Staging Backend Entrypoint ==="

# 1. Database Healthcheck & Connectivity Loop
python wait_for_db.py

# 2. Apply Migrations
echo "Applying database migrations..."
python manage.py migrate --noinput

# 3. Collect Static Files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# 4. Boot Staging-Hardened Server (Gunicorn)
echo "Booting Staging Gunicorn Server on 0.0.0.0:8000..."
exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 2 \
    --threads 2 \
    --timeout 60 \
    --access-logfile - \
    --error-logfile -
