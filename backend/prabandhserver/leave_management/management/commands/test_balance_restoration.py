from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from leave_management.models import LeaveBalance, LeaveApplication
from decimal import Decimal

User = get_user_model()

class Command(BaseCommand):
    help = 'Test leave balance restoration by simulating rejection'

    def add_arguments(self, parser):
        parser.add_argument(
            '--application-id',
            type=int,
            required=True,
            help='Leave application ID to test restoration for',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would happen without making changes',
        )

    def handle(self, *args, **options):
        app_id = options['application_id']
        dry_run = options['dry_run']
        
        try:
            leave_app = LeaveApplication.objects.get(id=app_id)
            
            self.stdout.write(f"\n=== Testing Leave Balance Restoration ===")
            self.stdout.write(f"Application ID: {leave_app.id}")
            self.stdout.write(f"Faculty: {leave_app.faculty.name} (ID: {leave_app.faculty.id})")
            self.stdout.write(f"Leave Type: {leave_app.leave_type}")
            self.stdout.write(f"Days: {leave_app.no_of_days}")
            self.stdout.write(f"Current Status: {leave_app.status}")
            
            # Get current balance
            try:
                balance = LeaveBalance.objects.get(faculty=leave_app.faculty)
                current_remaining = balance.get_remaining_balance(leave_app.leave_type)
                current_used = getattr(balance, f'{leave_app.leave_type}_leave_used', 0)
                
                self.stdout.write(f"\n--- Current Balance ---")
                self.stdout.write(f"Used: {current_used}")
                self.stdout.write(f"Remaining: {current_remaining}")
                
            except LeaveBalance.DoesNotExist:
                self.stdout.write(self.style.WARNING("No leave balance found for this faculty"))
                return
                
            if dry_run:
                # Simulate what would happen
                new_used = max(0, current_used - leave_app.no_of_days)
                new_remaining = current_remaining + leave_app.no_of_days
                
                self.stdout.write(f"\n--- Simulated After Restoration ---")
                self.stdout.write(f"Used would be: {new_used}")
                self.stdout.write(f"Remaining would be: {new_remaining}")
                self.stdout.write(f"Difference: +{leave_app.no_of_days} days")
                
            else:
                # Actually test the restoration
                if leave_app.status in ['rejected', 'rejected_by_hr', 'rejected_by_hod', 
                                       'rejected_by_dean', 'rejected_by_vc', 'cancelled']:
                    self.stdout.write(
                        self.style.WARNING("Application is already rejected. Balance may have been restored.")
                    )
                    
                # Test the add_leave method directly
                self.stdout.write(f"\n--- Testing Balance Restoration ---")
                balance.add_leave(leave_app.leave_type, leave_app.no_of_days)
                
                # Get updated balance
                balance.refresh_from_db()
                new_remaining = balance.get_remaining_balance(leave_app.leave_type)
                new_used = getattr(balance, f'{leave_app.leave_type}_leave_used', 0)
                
                self.stdout.write(f"After restoration:")
                self.stdout.write(f"Used: {new_used}")
                self.stdout.write(f"Remaining: {new_remaining}")
                self.stdout.write(f"Restored: {leave_app.no_of_days} days")
                
                self.stdout.write(self.style.SUCCESS("✓ Balance restoration test completed"))
                
        except LeaveApplication.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'Leave application with ID {app_id} not found')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error during test: {str(e)}')
            )
