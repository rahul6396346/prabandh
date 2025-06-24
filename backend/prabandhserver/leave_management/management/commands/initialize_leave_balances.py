from django.core.management.base import BaseCommand
from authentication.models import Faculty
from leave_management.models import LeaveBalance
from django.db import transaction


class Command(BaseCommand):
    help = 'Initialize leave balances for all faculty members who do not have one'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Reset all leave balances to default values',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        reset_all = options.get('reset', False)
        
        if reset_all:
            # Delete all existing leave balances
            self.stdout.write(self.style.WARNING('Deleting all existing leave balances...'))
            LeaveBalance.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('All leave balances deleted.'))
        
        # Get all faculty members
        faculty_members = Faculty.objects.all()
        created_count = 0
        existing_count = 0
        
        for faculty in faculty_members:            # Check if leave balance already exists
            leave_balance, created = LeaveBalance.objects.get_or_create(
                faculty=faculty,
                defaults={
                    'casual_leave': 15.0,
                    'medical_leave': 12.0,
                    'compensatory_leave': 8.0,
                    'earned_leave': 15.0,
                    'semester_leave': 5.0,
                    'maternity_leave': 15.0,
                    'paternity_leave': 0.0,
                    'extraordinary_leave': 15.0,
                    'academic_leave': 5.0,
                    'half_pay_leave': 5.0,
                    'duty_leave': 0.0,
                    'hpl': 5.0,
                    'vacation_leave': 15.0
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'Created leave balance for {faculty.name}'))
            else:
                existing_count += 1
                
        self.stdout.write(self.style.SUCCESS(
            f'Leave balance initialization complete. '
            f'Created {created_count} new records. '
            f'Found {existing_count} existing records.'
        )) 