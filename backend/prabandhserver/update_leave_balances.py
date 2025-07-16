#!/usr/bin/env python3
"""
Script to update existing LeaveBalance records with the new paternity leave allocation.
This should be run in the Django environment.
"""

import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'prabandhserver.settings')
django.setup()

from leave_management.models import LeaveBalance

def update_leave_balances():
    """Update existing LeaveBalance records with new paternity leave allocation."""
    
    print("🔄 Updating existing LeaveBalance records...")
    
    # Get all existing LeaveBalance records
    leave_balances = LeaveBalance.objects.all()
    
    print(f"📊 Found {leave_balances.count()} existing leave balance records")
    
    updated_count = 0
    
    for balance in leave_balances:
        # Update paternity leave from 0 to 10 (only if it's currently 0)
        if balance.paternity_leave == 0.0:
            balance.paternity_leave = 10.0
            print(f"✅ Updated paternity leave for {balance.faculty.name} (ID: {balance.faculty.id}) from 0.0 to 10.0")
            updated_count += 1
        
        # Ensure duty leave is 15 (in case there are inconsistencies)
        if balance.duty_leave != 15.0:
            old_value = balance.duty_leave
            balance.duty_leave = 15.0
            print(f"✅ Updated duty leave for {balance.faculty.name} (ID: {balance.faculty.id}) from {old_value} to 15.0")
            updated_count += 1
        
        # Save the record
        balance.save()
    
    print(f"🎉 Successfully updated {updated_count} leave balance records")
    
    # Display summary of current allocations
    print("\n📋 Current Leave Allocations Summary:")
    print("=" * 40)
    sample_balance = leave_balances.first()
    if sample_balance:
        print(f"Casual Leave: {sample_balance.casual_leave}")
        print(f"Medical Leave: {sample_balance.medical_leave}")
        print(f"Compensatory Leave: {sample_balance.compensatory_leave}")
        print(f"Earned Leave: {sample_balance.earned_leave}")
        print(f"Semester Leave: {sample_balance.semester_leave}")
        print(f"Maternity Leave: {sample_balance.maternity_leave}")
        print(f"Paternity Leave: {sample_balance.paternity_leave}")
        print(f"Extraordinary Leave: {sample_balance.extraordinary_leave}")
        print(f"Academic Leave: {sample_balance.academic_leave}")
        print(f"Half Pay Leave: {sample_balance.half_pay_leave}")
        print(f"Duty Leave: {sample_balance.duty_leave}")

if __name__ == "__main__":
    try:
        update_leave_balances()
        print("\n✅ Leave balance update completed successfully!")
    except Exception as e:
        print(f"❌ Error updating leave balances: {e}")
        sys.exit(1)
