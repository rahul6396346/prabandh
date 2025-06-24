import os
import django

# Initialize Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'prabandhserver.settings')
django.setup()

# Import your custom User model
from authentication.models import Faculty

# Find admin users
admin_users = Faculty.objects.filter(is_superuser=True)

if admin_users:
    print("\n=== ADMIN USERS FOUND ===")
    for user in admin_users:
        print(f"\nAdmin #{user.id}:")
        print(f"Registration: {user.registration_no}")
        print(f"Email: {user.primary_email}")
        print(f"Is Active: {user.is_active}")
        print(f"Is Superuser: {user.is_superuser}")
        print(f"Is Staff: {user.is_staff}")
        print("\nTo log in to Django admin, use:")
        print(f"Username: {user.primary_email}")
        print("Password: [your password]")
else:
    print("No admin users found. Run set_admin_password.py to create an admin user.")
