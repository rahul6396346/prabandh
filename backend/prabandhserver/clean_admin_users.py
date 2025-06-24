import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'prabandhserver.settings')
django.setup()

from authentication.models import Faculty

# Keep only the most recently created admin user
admins = Faculty.objects.filter(is_superuser=True).order_by('-date_joined')

if admins.count() > 1:
    # Keep the most recent admin
    keep_admin = admins[0]
    
    # Delete other admin users
    for admin in admins[1:]:
        print(f"Deleting admin user: {admin.primary_email}")
        admin.delete()
    
    print(f"\nKept most recent admin user:")
    print(f"Email: {keep_admin.primary_email}")
    print(f"Registration: {keep_admin.registration_no}")
else:
    print("Only one admin user exists. No cleanup needed.")