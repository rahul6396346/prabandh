#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'prabandhserver.settings')
django.setup()

from authentication.models import Faculty
from django.contrib.auth.hashers import check_password

try:
    admin = Faculty.objects.filter(email='admin@itm.edu').first()
    if admin:
        print(f"Admin found: {admin.email}")
        print(f"EmpType: {admin.emptype}")
        print(f"Is Active: {admin.is_active}")
        print(f"Password set: {bool(admin.password)}")
        print(f"Password check for 'password123': {check_password('password123', admin.password)}")
        print(f"Raw password hash: {admin.password[:50]}...")
    else:
        print("Admin user not found!")
        
    # Check all users with admin@itm.edu
    all_admins = Faculty.objects.filter(email='admin@itm.edu')
    print(f"\nTotal users with admin@itm.edu: {all_admins.count()}")
    for i, user in enumerate(all_admins):
        print(f"User {i+1}: ID={user.id}, EmpType={user.emptype}, Active={user.is_active}")
        
except Exception as e:
    print(f"Error: {e}")
