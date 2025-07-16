from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from leave_management.models import LeaveBalance, LeaveApplication

User = get_user_model()

class Command(BaseCommand):
    help = 'Check leave balance for a specific faculty member'

    def add_arguments(self, parser):
        parser.add_argument(
            '--faculty-id',
            type=int,
            help='Faculty ID to check leave balance for',
        )
        parser.add_argument(
            '--faculty-email',
            type=str,
            help='Faculty email to check leave balance for',
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Show leave balances for all faculty members',
        )

    def handle(self, *args, **options):
        if options['all']:
            self.show_all_balances()
        elif options['faculty_id']:
            self.show_faculty_balance(faculty_id=options['faculty_id'])
        elif options['faculty_email']:
            self.show_faculty_balance(email=options['faculty_email'])
        else:
            self.stdout.write(
                self.style.ERROR('Please provide --faculty-id, --faculty-email, or --all')
            )

    def show_faculty_balance(self, faculty_id=None, email=None):
        try:
            if faculty_id:
                faculty = User.objects.get(id=faculty_id)
            elif email:
                faculty = User.objects.get(primary_email=email)
            else:
                return

            self.stdout.write(f"\n=== Leave Balance for {faculty.name} (ID: {faculty.id}) ===")
            
            try:
                balance = LeaveBalance.objects.get(faculty=faculty)
                self.show_balance_details(balance)
                
                # Show recent leave applications
                recent_leaves = LeaveApplication.objects.filter(
                    faculty=faculty
                ).order_by('-applied_on')[:5]
                
                self.stdout.write(f"\n--- Recent Leave Applications ---")
                for leave in recent_leaves:
                    self.stdout.write(
                        f"ID: {leave.id}, Type: {leave.leave_type}, "
                        f"Days: {leave.no_of_days}, Status: {leave.status}, "
                        f"Applied: {leave.applied_on.strftime('%Y-%m-%d')}"
                    )
                    
            except LeaveBalance.DoesNotExist:
                self.stdout.write(
                    self.style.WARNING(f'No leave balance found for {faculty.name}')
                )
                
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR('Faculty member not found')
            )

    def show_all_balances(self):
        balances = LeaveBalance.objects.select_related('faculty').all()
        
        if not balances:
            self.stdout.write(self.style.WARNING('No leave balances found'))
            return
            
        self.stdout.write(f"\n=== All Faculty Leave Balances ===")
        
        for balance in balances:
            self.stdout.write(f"\n--- {balance.faculty.name} (ID: {balance.faculty.id}) ---")
            self.show_balance_details(balance)

    def show_balance_details(self, balance):
        leave_types = [
            ('casual', 'Casual'),
            ('medical', 'Medical'),
            ('compensatory', 'Compensatory'),
            ('earned', 'Earned'),
            ('semester', 'Semester'),
            ('maternity', 'Maternity'),
            ('paternity', 'Paternity'),
            ('extraordinary', 'Extraordinary'),
            ('academic', 'Academic'),
            ('half_pay', 'Half Pay'),
            ('duty', 'Duty'),
        ]
        
        for leave_type, display_name in leave_types:
            total = getattr(balance, f'{leave_type}_leave', 0)
            used = getattr(balance, f'{leave_type}_leave_used', 0)
            remaining = balance.get_remaining_balance(leave_type)
            
            if total > 0:  # Only show if there's an allocation for this leave type
                self.stdout.write(
                    f"{display_name:15}: {remaining:4.1f} / {total:4.1f} (Used: {used:4.1f})"
                )
