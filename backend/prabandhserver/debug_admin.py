#!/usr/bin/env python
import os
import sys
import django

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'prabandhserver.settings')
django.setup()

from authentication.models import Faculty

try:
    # Check if admin user exists
    admin_users = Faculty.objects.filter(primary_email='admin@itm.edu')
    
    if admin_users.exists():
        for admin in admin_users:
            print(f"Found admin user:")
            print(f"  Email: {admin.primary_email}")
            print(f"  Name: {admin.name}")
            print(f"  EmpType: '{admin.emptype}'")
            print(f"  Is Active: {admin.is_active}")
            print(f"  Registration No: {admin.registration_no}")
            print(f"  Department: {admin.department}")
            print(f"  Designation: {admin.designation}")
            print(f"  Password set: {bool(admin.password)}")
            print("---")
    else:
        print("No admin user found with email admin@itm.edu")
        
    # Show all available emptypes in the system
    all_emptypes = Faculty.objects.values_list('emptype', flat=True).distinct()
    print(f"\nAll emptype values in system: {list(all_emptypes)}")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
