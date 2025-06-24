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
    casual_leave = models.DecimalField(max_digits=5, decimal_places=1, default=15.0)
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
    casual_leave_used = models.DecimalField(max_digits=5, decimal_places=1, default=0.0)
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
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Leave Balance - {self.faculty.name}"
    
    def get_remaining_balance(self, leave_type):
        """Get remaining balance for a specific leave type"""
        if leave_type == 'casual':
            return self.casual_leave - self.casual_leave_used
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
    
    def deduct_leave(self, leave_type, days):
        """Deduct leave from the balance"""
        if leave_type == 'casual':
            self.casual_leave_used += days
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
    
    def add_leave(self, leave_type, days):
        """Add leave to the balance (useful for cancellations or adjustments)"""
        if leave_type == 'casual':
            self.casual_leave_used = max(0, self.casual_leave_used - days)
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