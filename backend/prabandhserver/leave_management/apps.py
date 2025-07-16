from django.apps import AppConfig


class LeaveManagementConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'leave_management'
    
    def ready(self):
        # Import signals to ensure they are connected
        import leave_management.views  # This imports the signal handlers