#!/bin/sh

# Wait for postgres to be ready
if [ "$DB_HOST" = "db" ]
then
    echo "Waiting for postgres..."
    while ! nc -z $DB_HOST $DB_PORT; do
      sleep 0.1
    done
    echo "PostgreSQL started"
fi

# Run migrations
python manage.py makemigrations --noinput
python manage.py migrate --noinput

# Collect static files
python manage.py collectstatic --noinput

# Start Gunicorn
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000
