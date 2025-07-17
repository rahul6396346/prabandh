from django.core.management.base import BaseCommand
from leave_management.models import LeaveBalance
from django.db import transaction


class Command(BaseCommand):
    help = 'Initialize CL slot data for existing leave balances'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Reset all CL slot data to default values',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        reset_all = options.get('reset', False)
        
        if reset_all:
            self.stdout.write(self.style.WARNING('Resetting all CL slot data...'))
            LeaveBalance.objects.all().update(
                cl_slot1_total=7.0,
                cl_slot1_used=0.0,
                cl_slot1_lapsed=False,
                cl_slot2_total=8.0,
                cl_slot2_used=0.0,
                cl_slot2_lapsed=False
            )
            self.stdout.write(self.style.SUCCESS('All CL slot data reset.'))
        else:
            # Initialize CL slot data for existing leave balances
            leave_balances = LeaveBalance.objects.all()
            updated_count = 0
            
            for balance in leave_balances:
                # Check if CL slot data needs initialization
                if balance.cl_slot1_total == 0.0 and balance.cl_slot2_total == 0.0:
                    # Initialize with default values
                    balance.cl_slot1_total = 7.0
                    balance.cl_slot1_used = 0.0
                    balance.cl_slot1_lapsed = False
                    balance.cl_slot2_total = 8.0
                    balance.cl_slot2_used = 0.0
                    balance.cl_slot2_lapsed = False
                    balance.save()
                    updated_count += 1
                    self.stdout.write(self.style.SUCCESS(f'Initialized CL slots for {balance.faculty.name}'))
            
            self.stdout.write(self.style.SUCCESS(
                f'CL slot initialization complete. Updated {updated_count} records.'
            )) 