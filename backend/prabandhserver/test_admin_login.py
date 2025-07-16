import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'prabandhserver.settings')
django.setup()

from django.contrib.auth import authenticate
from authentication.models import Faculty

# Test Django admin login
email = 'admin@itm.edu'
password = 'password123'

print("Testing Django admin authentication...")
print(f"Email: {email}")
print(f"Password: {password}")

# Test authenticate function
user = authenticate(username=email, password=password)
if user:
    print(f"✅ Authentication SUCCESS!")
    print(f"User: {user.name}")
    print(f"Email: {user.primary_email}")
    print(f"Is staff: {user.is_staff}")
    print(f"Is superuser: {user.is_superuser}")
    print(f"Is active: {user.is_active}")
else:
    print("❌ Authentication FAILED!")
    
    # Debug: Check if user exists
    try:
        db_user = Faculty.objects.get(primary_email=email)
        print(f"✅ User exists in database")
        print(f"Name: {db_user.name}")
        print(f"Email: {db_user.primary_email}")
        print(f"Is staff: {db_user.is_staff}")
        print(f"Is superuser: {db_user.is_superuser}")
        print(f"Is active: {db_user.is_active}")
        
        # Check password
        from django.contrib.auth.hashers import check_password
        password_valid = check_password(password, db_user.password)
        print(f"Password valid: {password_valid}")
        
        if not password_valid:
            print("❌ Password is incorrect!")
        elif not db_user.is_active:
            print("❌ User account is not active!")
        elif not db_user.is_staff:
            print("❌ User is not staff (required for admin access)!")
        else:
            print("❌ Unknown authentication issue!")
            
    except Faculty.DoesNotExist:
        print("❌ User does not exist in database!")
