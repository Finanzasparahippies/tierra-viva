from django.apps import AppConfig

class SponsorshipConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'sponsorship'

    def ready(self):
        import sponsorship.signals
        # Also ensure our older rescue signals don't conflict 
        # (Though they are in separate apps usually, but just in case)
