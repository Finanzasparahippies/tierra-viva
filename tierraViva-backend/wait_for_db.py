import os
import sys
import time

def check_db():
    print("Checking database connectivity...", flush=True)
    import django
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
    django.setup()
    from django.db import connection

    max_retries = int(os.environ.get("DB_HEALTHCHECK_RETRIES", "15"))
    retry_interval = int(os.environ.get("DB_HEALTHCHECK_INTERVAL", "3"))

    for attempt in range(1, max_retries + 1):
        try:
            connection.ensure_connection()
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1;")
            print("Database connection successfully verified!", flush=True)
            return 0
        except Exception as e:
            print(f"[Attempt {attempt}/{max_retries}] Database connection failed: {e}", flush=True)
            if attempt < max_retries:
                time.sleep(retry_interval)
            else:
                print("FATAL: Maximum database connection attempts reached.", flush=True)
                return 1

if __name__ == "__main__":
    sys.exit(check_db())
