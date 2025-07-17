from django.db import models
from authentication.models import Faculty
from django.db.models.signals import post_save
from django.dispatch import receiver

class LeaveApplication(models.Model):
    LEAVE_TYPE_CHOICES = [
        ('casual', 'Casual Leave'),
        ('medical', 'Medical Leave'),
        ('compensatory', 'Compensatory Leave'),
        ('semester', 'Semester Break'),
        ('half_pay', 'Half Pay Leave'),
        ('maternity', 'Maternity Leave'),
        ('paternity', 'Paternity Leave'),
        ('earned', 'Earned Leave'),
        ('extraordinary', 'Extraordinary Leave'),
        ('academic', 'Academic Leave'),
        ('duty', 'Duty Leave'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
        ('forwarded_to_hr', 'Forwarded to HR'),
        ('approved_by_hr', 'Approved by HR'),
        ('rejected_by_hr', 'Rejected by HR'),
        ('forwarded_to_hod', 'Forwarded to HOD'),
        ('approved_by_hod', 'Approved by HOD'),
        ('rejected_by_hod', 'Rejected by HOD'),
        ('forwarded_to_dean', 'Forwarded to Dean'),
        ('approved_by_dean', 'Approved by Dean'),
        ('rejected_by_dean', 'Rejected by Dean'),
        ('forwarded_to_vc', 'Forwarded to VC'),
        ('approved_by_vc', 'Approved by VC'),
        ('rejected_by_vc', 'Rejected by VC'),
    ]
    
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name='leave_applications')
    leave_type = models.CharField(max_length=20, choices=LEAVE_TYPE_CHOICES)
    from_date = models.DateField()
    to_date = models.DateField()
    no_of_days = models.DecimalField(max_digits=4, decimal_places=1)
    reason = models.TextField()
    contact_during_leave = models.CharField(max_length=15)
    address_during_leave = models.TextField(blank=True, null=True)
    forward_to = models.CharField(max_length=100)
    supporting_document = models.FileField(upload_to='leave_documents/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    applied_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)
    remarks = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.faculty.name} - {self.leave_type} - {self.from_date} to {self.to_date}"

class ClassAdjustment(models.Model):
    leave_application = models.ForeignKey(LeaveApplication, on_delete=models.CASCADE, related_name='class_adjustments')
    course = models.CharField(max_length=100)
    branch = models.CharField(max_length=100)
    semester = models.CharField(max_length=50)
    subject = models.CharField(max_length=100)
    class_timing = models.CharField(max_length=50)
    concerned_teacher = models.CharField(max_length=100)
    
    def __str__(self):
        return f"{self.course} - {self.subject} - {self.class_timing}"

class LeaveBalance(models.Model):
    """
    Model to track leave balances for faculty members.
    Each faculty has a balance for different types of leave.
    When a leave is applied and approved, the balance is updated accordingly.
    """
    faculty = models.OneToOneField(Faculty, on_delete=models.CASCADE, related_name='leave_balance')
    
    # Different types of leave balances with specific default allocations
    casual_leave = models.DecimalField(max_digits=5, decimal_places=1, default=15.0, help_text="[LEGACY] Use cl_slot1_total and cl_slot2_total instead.")
    medical_leave = models.DecimalField(max_digits=5, decimal_places=1, default=12.0)
    compensatory_leave = models.DecimalField(max_digits=5, decimal_places=1, default=8.0)
    earned_leave = models.DecimalField(max_digits=5, decimal_places=1, default=15.0)
    semester_leave = models.DecimalField(max_digits=5, decimal_places=1, default=5.0)
    maternity_leave = models.DecimalField(max_digits=5, decimal_places=1, default=15.0)
    paternity_leave = models.DecimalField(max_digits=5, decimal_places=1, default=0.0)
    extraordinary_leave = models.DecimalField(max_digits=5, decimal_places=1, default=15.0)
    academic_leave = models.DecimalField(max_digits=5, decimal_places=1, default=5.0)
    half_pay_leave = models.DecimalField(max_digits=5, decimal_places=1, default=5.0)
    duty_leave = models.DecimalField(max_digits=5, decimal_places=1, default=15.0)  # Official duty leave limit
    
    # Legacy fields (kept for backward compatibility)
    hpl = models.DecimalField(max_digits=5, decimal_places=1, default=5.0)  # Half Pay Leave (legacy)
    vacation_leave = models.DecimalField(max_digits=5, decimal_places=1, default=15.0)  # Legacy field
    
    # Tracking usage statistics
    casual_leave_used = models.DecimalField(max_digits=5, decimal_places=1, default=0.0, help_text="[LEGACY] Use cl_slot1_used and cl_slot2_used instead.")
    medical_leave_used = models.DecimalField(max_digits=5, decimal_places=1, default=0.0)
    compensatory_leave_used = models.DecimalField(max_digits=5, decimal_places=1, default=0.0)
    earned_leave_used = models.DecimalField(max_digits=5, decimal_places=1, default=0.0)
    semester_leave_used = models.DecimalField(max_digits=5, decimal_places=1, default=0.0)
    maternity_leave_used = models.DecimalField(max_digits=5, decimal_places=1, default=0.0)
    paternity_leave_used = models.DecimalField(max_digits=5, decimal_places=1, default=0.0)
    extraordinary_leave_used = models.DecimalField(max_digits=5, decimal_places=1, default=0.0)
    academic_leave_used = models.DecimalField(max_digits=5, decimal_places=1, default=0.0)
    half_pay_leave_used = models.DecimalField(max_digits=5, decimal_places=1, default=0.0)
    duty_leave_used = models.DecimalField(max_digits=5, decimal_places=1, default=0.0)
    
    # Legacy usage fields (kept for backward compatibility)
    hpl_used = models.DecimalField(max_digits=5, decimal_places=1, default=0.0)  # Legacy
    vacation_leave_used = models.DecimalField(max_digits=5, decimal_places=1, default=0.0)  # Legacy
    
    # --- CASUAL LEAVE SLOT TRACKING FIELDS ---
    cl_slot1_total = models.DecimalField(max_digits=4, decimal_places=1, default=7.0, help_text="Max CL in Slot 1 (Jan-Dec)")
    cl_slot1_used = models.DecimalField(max_digits=4, decimal_places=1, default=0.0, help_text="CL used in Slot 1 (Jan-Dec)")
    cl_slot1_lapsed = models.BooleanField(default=False, help_text="Has Slot 1 CL lapsed?")
    cl_slot2_total = models.DecimalField(max_digits=4, decimal_places=1, default=8.0, help_text="Max CL in Slot 2 (Jul-Jun)")
    cl_slot2_used = models.DecimalField(max_digits=4, decimal_places=1, default=0.0, help_text="CL used in Slot 2 (Jul-Jun)")
    cl_slot2_lapsed = models.BooleanField(default=False, help_text="Has Slot 2 CL lapsed?")
    # --- END CASUAL LEAVE SLOT TRACKING ---
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Leave Balance - {self.faculty.name} (CL1: {self.cl_slot1_used}/{self.cl_slot1_total}, CL2: {self.cl_slot2_used}/{self.cl_slot2_total})"
    
    def get_remaining_balance(self, leave_type, date=None):
        """
        Get remaining balance for a specific leave type. For 'casual', uses slot logic if date is provided.
        """
        if leave_type == 'casual' and date is not None:
            slot = self.get_cl_slot(date)
            return self.get_remaining_cl_in_slot(slot)
        elif leave_type == 'casual':
            # fallback: sum both slots
            return (self.cl_slot1_total - self.cl_slot1_used) + (self.cl_slot2_total - self.cl_slot2_used)
        elif leave_type == 'medical':
            return self.medical_leave - self.medical_leave_used
        elif leave_type == 'compensatory':
            return self.compensatory_leave - self.compensatory_leave_used
        elif leave_type == 'earned':
            return self.earned_leave - self.earned_leave_used
        elif leave_type == 'semester':
            return self.semester_leave - self.semester_leave_used
        elif leave_type == 'maternity':
            return self.maternity_leave - self.maternity_leave_used
        elif leave_type == 'paternity':
            return self.paternity_leave - self.paternity_leave_used
        elif leave_type == 'extraordinary':
            return self.extraordinary_leave - self.extraordinary_leave_used
        elif leave_type == 'academic':
            return self.academic_leave - self.academic_leave_used
        elif leave_type == 'half_pay':
            return self.half_pay_leave - self.half_pay_leave_used
        elif leave_type == 'duty':
            return self.duty_leave - self.duty_leave_used
        elif leave_type == 'hpl':  # Legacy support
            return self.hpl - self.hpl_used
        return 0
    
    def deduct_leave(self, leave_type, days, date=None):
        """
        Deduct leave from the balance. For 'casual', uses slot logic if date is provided.
        """
        if leave_type == 'casual' and date is not None:
            slot = self.get_cl_slot(date)
            self.deduct_cl_in_slot(slot, days)
        elif leave_type == 'casual':
            # fallback: deduct from slot1 first, then slot2
            remaining = days
            slot1_avail = self.cl_slot1_total - self.cl_slot1_used
            if slot1_avail >= remaining:
                self.cl_slot1_used += remaining
            else:
                self.cl_slot1_used += slot1_avail
                self.cl_slot2_used += (remaining - slot1_avail)
            self.save()
        elif leave_type == 'medical':
            self.medical_leave_used += days
        elif leave_type == 'compensatory':
            self.compensatory_leave_used += days
        elif leave_type == 'earned':
            self.earned_leave_used += days
        elif leave_type == 'semester':
            self.semester_leave_used += days
        elif leave_type == 'maternity':
            self.maternity_leave_used += days
        elif leave_type == 'paternity':
            self.paternity_leave_used += days
        elif leave_type == 'extraordinary':
            self.extraordinary_leave_used += days
        elif leave_type == 'academic':
            self.academic_leave_used += days
        elif leave_type == 'half_pay':
            self.half_pay_leave_used += days
        elif leave_type == 'duty':
            self.duty_leave_used += days
        elif leave_type == 'hpl':  # Legacy support
            self.hpl_used += days
        self.save()
    
    def add_leave(self, leave_type, days, date=None):
        """
        Add leave to the balance (useful for cancellations or adjustments). For 'casual', uses slot logic if date is provided.
        """
        if leave_type == 'casual' and date is not None:
            slot = self.get_cl_slot(date)
            if slot == 'slot1':
                self.cl_slot1_used = max(0, self.cl_slot1_used - days)
            elif slot == 'slot2':
                self.cl_slot2_used = max(0, self.cl_slot2_used - days)
            self.save()
        elif leave_type == 'casual':
            # fallback: add to slot2 first, then slot1
            slot2_used = self.cl_slot2_used
            if slot2_used >= days:
                self.cl_slot2_used -= days
            else:
                self.cl_slot2_used = 0
                self.cl_slot1_used = max(0, self.cl_slot1_used - (days - slot2_used))
            self.save()
        elif leave_type == 'medical':
            self.medical_leave_used = max(0, self.medical_leave_used - days)
        elif leave_type == 'compensatory':
            self.compensatory_leave_used = max(0, self.compensatory_leave_used - days)
        elif leave_type == 'earned':
            self.earned_leave_used = max(0, self.earned_leave_used - days)
        elif leave_type == 'semester':
            self.semester_leave_used = max(0, self.semester_leave_used - days)
        elif leave_type == 'maternity':
            self.maternity_leave_used = max(0, self.maternity_leave_used - days)
        elif leave_type == 'paternity':
            self.paternity_leave_used = max(0, self.paternity_leave_used - days)
        elif leave_type == 'extraordinary':
            self.extraordinary_leave_used = max(0, self.extraordinary_leave_used - days)
        elif leave_type == 'academic':
            self.academic_leave_used = max(0, self.academic_leave_used - days)
        elif leave_type == 'half_pay':
            self.half_pay_leave_used = max(0, self.half_pay_leave_used - days)
        elif leave_type == 'duty':
            self.duty_leave_used = max(0, self.duty_leave_used - days)
        elif leave_type == 'hpl':  # Legacy support
            self.hpl_used = max(0, self.hpl_used - days)
        self.save()

    def get_cl_slot(self, date):
        """
        Returns which CL slot the date falls into:
        - 'slot1' for Jan 1 - Dec 31 (current year)
        - 'slot2' for Jul 1 (current year) - Jun 30 (next year)
        """
        from datetime import date as dt
        if date.month >= 1 and date.month <= 12:
            # Check if in slot1 (Jan-Dec)
            if date >= dt(date.year, 1, 1) and date <= dt(date.year, 12, 31):
                return 'slot1'
        # Check if in slot2 (Jul-Jun)
        if date >= dt(date.year, 7, 1):
            return 'slot2'
        elif date <= dt(date.year, 6, 30):
            return 'slot2'
        return None

    def get_remaining_cl_in_slot(self, slot):
        if slot == 'slot1':
            return self.cl_slot1_total - self.cl_slot1_used
        elif slot == 'slot2':
            return self.cl_slot2_total - self.cl_slot2_used
        return 0

    def deduct_cl_in_slot(self, slot, days):
        if slot == 'slot1':
            self.cl_slot1_used += days
        elif slot == 'slot2':
            self.cl_slot2_used += days
        self.save()

    def lapse_cl_slot(self, slot):
        if slot == 'slot1':
            self.cl_slot1_lapsed = True
            self.cl_slot1_total = 0
        elif slot == 'slot2':
            self.cl_slot2_lapsed = True
            self.cl_slot2_total = 0
        self.save()

# Signal to create leave balance when a faculty is created
@receiver(post_save, sender=Faculty)
def create_faculty_leave_balance(sender, instance, created, **kwargs):
    """Create a leave balance record when a new faculty is created"""
    if created:
        try:
            LeaveBalance.objects.create(
                faculty=instance,
                casual_leave=15.0,
                medical_leave=12.0,
                compensatory_leave=8.0,
                earned_leave=15.0,
                semester_leave=5.0,
                maternity_leave=15.0,
                paternity_leave=0.0,
                extraordinary_leave=15.0,
                academic_leave=5.0,
                half_pay_leave=5.0,
                duty_leave=15.0,  # Official duty leave limit
                # Legacy fields
                hpl=5.0,
                vacation_leave=15.0
            )
        except Exception as e:
            # Log error but don't prevent faculty creation
            print(f"Error creating leave balance for {instance}: {e}")

# Note: The update_leave_balance_on_approval signal handler has been moved to views.py

class FCMToken(models.Model):
    user = models.ForeignKey(Faculty, on_delete=models.CASCADE)
    token = models.TextField(max_length=512)
    created_at = models.DateTimeField(auto_now_add=True)