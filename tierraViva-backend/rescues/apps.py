from django.apps import AppConfig

class RescuesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'rescues'

    def ready(self):
        import rescues.signals
