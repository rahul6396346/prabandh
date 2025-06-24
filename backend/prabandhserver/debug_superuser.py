import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'prabandhserver.settings')
django.setup()

from authentication.models import Faculty
from django.contrib.auth.hashers import check_password

# Check admin user details
admin_email = 'admin@itm.edu'
admin_password = 'password123'

print("=== Django Superuser Debug ===")
print(f"Checking user: {admin_email}")

try:
    admin = Faculty.objects.get(primary_email=admin_email)
    
    print(f"✅ User found in database")
    print(f"ID: {admin.id}")
    print(f"Name: {admin.name}")
    print(f"Email: {admin.primary_email}")
    print(f"Registration No: {admin.registration_no}")
    print(f"Is Active: {admin.is_active}")
    print(f"Is Staff: {admin.is_staff}")
    print(f"Is Superuser: {admin.is_superuser}")
    print(f"Password Hash: {admin.password[:50]}...")
    
    # Test password
    password_check = check_password(admin_password, admin.password)
    print(f"Password Check: {password_check}")
    
    # Test Django authentication
    from django.contrib.auth import authenticate
    auth_result = authenticate(username=admin_email, password=admin_password)
    print(f"Django authenticate(): {auth_result is not None}")
    
    if auth_result:
        print("✅ Django authentication works!")
    else:
        print("❌ Django authentication failed!")
        print("This suggests an issue with the authentication backend.")
        
        # Check settings
        from django.conf import settings
        print(f"\nAUTH_USER_MODEL: {getattr(settings, 'AUTH_USER_MODEL', 'Not set')}")
        print(f"AUTHENTICATION_BACKENDS: {getattr(settings, 'AUTHENTICATION_BACKENDS', 'Default')}")
    
except Faculty.DoesNotExist:
    print(f"❌ User {admin_email} not found!")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
