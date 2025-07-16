#!/usr/bin/env python3
"""
Test script to debug the leave balance API endpoint.
This script helps identify if the issue is in the backend or frontend.
"""

import requests
import json
import sys

# Configuration
BASE_URL = "http://localhost:8000"
API_ENDPOINT = f"{BASE_URL}/api/faculty/leave/applications/leave_balance/"

def test_leave_balance_api():
    """Test the leave balance API endpoint with different authentication methods."""
    
    print("🔍 Testing Leave Balance API Endpoint")
    print("=" * 50)
    print(f"API URL: {API_ENDPOINT}")
    print()
    
    # Test 1: Without authentication
    print("📋 Test 1: No Authentication")
    try:
        response = requests.get(API_ENDPOINT)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:200]}...")
        print()
    except Exception as e:
        print(f"Error: {e}")
        print()
    
    # Test 2: With dummy Bearer token
    print("📋 Test 2: Dummy Bearer Token")
    headers = {"Authorization": "Bearer dummy_token"}
    try:
        response = requests.get(API_ENDPOINT, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:200]}...")
        print()
    except Exception as e:
        print(f"Error: {e}")
        print()
    
    # Test 3: With dummy Token authentication
    print("📋 Test 3: Dummy Token Authentication")
    headers = {"Authorization": "Token dummy_token"}
    try:
        response = requests.get(API_ENDPOINT, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:200]}...")
        print()
    except Exception as e:
        print(f"Error: {e}")
        print()
    
    # Test 4: Check if server is running
    print("📋 Test 4: Server Health Check")
    try:
        response = requests.get(f"{BASE_URL}/admin/")
        print(f"Admin page status: {response.status_code}")
        print("✅ Django server is running")
        print()
    except Exception as e:
        print(f"❌ Django server not accessible: {e}")
        print("Make sure to run: python manage.py runserver")
        print()
        return False
    
    return True

def check_django_models():
    """Check the Django models and database."""
    print("🗄️ Django Database Check")
    print("=" * 30)
    
    # You would need to import Django models here if running this as a Django script
    print("To check the database, run these Django commands:")
    print("python manage.py shell")
    print(">>> from authentication.models import Faculty")
    print(">>> from leave_management.models import LeaveBalance")
    print(">>> Faculty.objects.count()")
    print(">>> LeaveBalance.objects.count()")
    print()

if __name__ == "__main__":
    print("🚀 Leave Balance API Debugging Tool")
    print("This script helps identify backend/frontend issues")
    print()
    
    if test_leave_balance_api():
        check_django_models()
    
    print("💡 Next Steps:")
    print("1. Check browser console for detailed error messages")
    print("2. Verify authentication tokens in localStorage")
    print("3. Check Django server logs for API calls")
    print("4. Ensure leave balance data exists for the current user")
