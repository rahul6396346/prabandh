import os
import django

# Initialize Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'prabandhserver.settings')
django.setup()

from authentication.models import Faculty

# Find the admin user
admin_user = Faculty.objects.filter(primary_email='admin@itm.edu').first()

if admin_user:
    print(f"Admin user found:")
    print(f"Email: {admin_user.primary_email}")
    print(f"Registration: {admin_user.registration_no}")
    print(f"Name: {admin_user.name}")
    print(f"Emptype: '{admin_user.emptype}'")
    print(f"Is Active: {admin_user.is_active}")
    print(f"Is Superuser: {admin_user.is_superuser}")
    print(f"Check password: {admin_user.check_password('password123')}")
else:
    print("Admin user not found")
