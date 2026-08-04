from django.apps import AppConfig

class ActivitiesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'activities'

    def ready(self):
        import activities.signals
        # Signal handler to notify the newsletter community 
        # whenever a new activity (tour or workshop) is posted.
