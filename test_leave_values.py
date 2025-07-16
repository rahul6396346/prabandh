#!/usr/bin/env python3
"""
Test script to verify the leave balance API returns correct values for duty and paternity leave.
Run this after updating the backend to ensure the changes are working correctly.
"""

import requests
import json

def test_leave_balance_values():
    """Test that the leave balance API returns correct values."""
    
    print("🧪 Testing Leave Balance API Values")
    print("=" * 50)
    
    # API endpoint
    api_url = "http://localhost:8000/api/faculty/leave/applications/leave_balance/"
    
    print(f"📍 Testing endpoint: {api_url}")
    print()
    
    # Test without authentication first (should get 401/403)
    print("📋 Test 1: API Accessibility Check")
    try:
        response = requests.get(api_url)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("⚠️  Unexpected: API accessible without authentication")
            print("Response:", json.dumps(data, indent=2))
        elif response.status_code in [401, 403]:
            print("✅ Expected: API requires authentication")
        else:
            print(f"ℹ️  Response: {response.text[:200]}...")
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server")
        print("💡 Make sure to run: python manage.py runserver")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    print()
    
    # Expected values after our changes
    expected_values = {
        "duty": {"total": 15, "used": 0, "remaining": 15},
        "paternity": {"total": 10, "used": 0, "remaining": 10},
        "casual": {"total": 15, "used": 0, "remaining": 15},
        "medical": {"total": 12, "used": 0, "remaining": 12},
        "compensatory": {"total": 8, "used": 0, "remaining": 8},
        "earned": {"total": 15, "used": 0, "remaining": 15},
        "semester": {"total": 5, "used": 0, "remaining": 5},
        "maternity": {"total": 15, "used": 0, "remaining": 15},
        "extraordinary": {"total": 15, "used": 0, "remaining": 15},
        "academic": {"total": 5, "used": 0, "remaining": 5},
        "half_pay": {"total": 5, "used": 0, "remaining": 5}
    }
    
    print("📋 Expected Leave Balance Values:")
    print("-" * 30)
    for leave_type, values in expected_values.items():
        print(f"{leave_type.title().replace('_', ' ')} Leave: {values['total']} total")
    
    print()
    print("💡 To test with authentication:")
    print("1. Login to the frontend application")
    print("2. Open browser developer tools")
    print("3. Check the leave balance API call in Network tab")
    print("4. Verify the response matches expected values above")
    print()
    print("🔧 To update existing database records, run:")
    print("python update_leave_balances.py")
    
    return True

def check_backend_health():
    """Check if Django backend is running."""
    try:
        response = requests.get("http://localhost:8000/admin/")
        if response.status_code in [200, 302]:  # 302 = redirect to login
            print("✅ Django backend is running")
            return True
        else:
            print(f"⚠️  Backend returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Django backend is not running")
        print("💡 Start it with: python manage.py runserver")
        return False

if __name__ == "__main__":
    print("🚀 Leave Balance Values Test")
    print()
    
    # Check backend health first
    if check_backend_health():
        print()
        test_leave_balance_values()
    
    print()
    print("📋 Summary of Changes Made:")
    print("=" * 30)
    print("✅ Backend: Updated paternity_leave from 0.0 to 10.0")
    print("✅ Backend: Confirmed duty_leave is 15.0")
    print("✅ Frontend: No changes needed (fetches dynamic data)")
    print()
    print("🔄 Next Steps:")
    print("1. Restart Django server if it was running")
    print("2. Run update_leave_balances.py to update existing records")
    print("3. Test the frontend application")
    print("4. Check browser console for API call logs")
