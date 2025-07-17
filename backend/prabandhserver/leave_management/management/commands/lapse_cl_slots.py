from django.core.management.base import BaseCommand
from leave_management.models import LeaveBalance
from django.db import transaction
from datetime import date


class Command(BaseCommand):
    help = 'Lapse CL slots according to HR policy (Slot 1 after Dec 31, Slot 2 after Jun 30)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force lapse all slots regardless of date',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be lapsed without actually doing it',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        force = options.get('force', False)
        dry_run = options.get('dry_run', False)
        
        current_date = date.today()
        current_year = current_date.year
        
        # Define lapse dates
        slot1_lapse_date = date(current_year, 12, 31)  # Dec 31
        slot2_lapse_date = date(current_year + 1, 6, 30)  # Jun 30 of next year
        
        self.stdout.write(f"Current date: {current_date}")
        self.stdout.write(f"Slot 1 lapse date: {slot1_lapse_date}")
        self.stdout.write(f"Slot 2 lapse date: {slot2_lapse_date}")
        
        # Get leave balances that need slot lapsing
        leave_balances = LeaveBalance.objects.all()
        slot1_lapsed_count = 0
        slot2_lapsed_count = 0
        
        for balance in leave_balances:
            should_lapse_slot1 = False
            should_lapse_slot2 = False
            
            if force:
                # Force lapse all slots
                should_lapse_slot1 = not balance.cl_slot1_lapsed
                should_lapse_slot2 = not balance.cl_slot2_lapsed
            else:
                # Check if slots should be lapsed based on date
                if current_date > slot1_lapse_date and not balance.cl_slot1_lapsed:
                    should_lapse_slot1 = True
                
                if current_date > slot2_lapse_date and not balance.cl_slot2_lapsed:
                    should_lapse_slot2 = True
            
            if should_lapse_slot1 or should_lapse_slot2:
                if dry_run:
                    self.stdout.write(f"Would lapse for {balance.faculty.name}:")
                    if should_lapse_slot1:
                        self.stdout.write(f"  - Slot 1: {balance.cl_slot1_remaining} days remaining")
                        slot1_lapsed_count += 1
                    if should_lapse_slot2:
                        self.stdout.write(f"  - Slot 2: {balance.cl_slot2_remaining} days remaining")
                        slot2_lapsed_count += 1
                else:
                    if should_lapse_slot1:
                        balance.lapse_cl_slot('slot1')
                        self.stdout.write(f"Lapsed Slot 1 for {balance.faculty.name} ({balance.cl_slot1_remaining} days lost)")
                        slot1_lapsed_count += 1
                    
                    if should_lapse_slot2:
                        balance.lapse_cl_slot('slot2')
                        self.stdout.write(f"Lapsed Slot 2 for {balance.faculty.name} ({balance.cl_slot2_remaining} days lost)")
                        slot2_lapsed_count += 1
        
        if dry_run:
            self.stdout.write(self.style.WARNING(
                f"DRY RUN: Would lapse {slot1_lapsed_count} Slot 1 records and {slot2_lapsed_count} Slot 2 records"
            ))
        else:
            self.stdout.write(self.style.SUCCESS(
                f"Lapsed {slot1_lapsed_count} Slot 1 records and {slot2_lapsed_count} Slot 2 records"
            )) 