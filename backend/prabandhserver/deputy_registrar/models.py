from django.db import models
from django.core.exceptions import ValidationError

# Create your models here.
COURSE_TYPE = (
    ('SemesterWise', 'Semester Wise'),
    ('YearWise', 'Year Wise'),
)

SYSTEM_TYPE = (
    ('GradingWise', 'Grading Wise'),
    ('PercentageWise', 'Percentage Wise'),
)

EDUCATION_LEVEL = (
    ('UG', 'UG'),
    ('PG', 'PG'),
    ('Diploma', 'Diploma'),
    ('PG_Diploma', 'PG Diploma'),
    ('PhD', 'PhD'),
)

REGULATORY_BODIES = (
    ('AICTE', 'AICTE'),
    ('INC', 'INC'),
    ('PCI', 'PCI'),
    ('ICAR', 'ICAR'),
    ('NCT', 'NCT'),
)

NEP_OPTIONS = (
    ('NEP', 'NEP'),
    ('Non-NEP', 'Non-NEP'),
)

NAAC_OPTIONS = (
    ('NAAC', 'NAAC'),
    ('Non-NAAC', 'Non-NAAC'),
)


class School(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Department(models.Model):
    name = models.CharField(max_length=100)
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='departments')

    def __str__(self):
        return f"{self.name} ({self.school.name})"

class Programme(models.Model):
    academic_year = models.CharField(max_length=20, null=True, blank=True)
    course = models.CharField(max_length=70, null=True, blank=True)
    branch = models.CharField(max_length=70, null=True, blank=True)
    semester = models.CharField(max_length=20, null=True, blank=True)
    school = models.ForeignKey(School, on_delete=models.CASCADE, null=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, null=True)
    type = models.CharField(max_length=20, choices=COURSE_TYPE, default='SemesterWise')
    system_type = models.CharField(max_length=20, choices=SYSTEM_TYPE, default='GradingWise')
    education_level = models.CharField(max_length=20, choices=EDUCATION_LEVEL, default='UG')
    regulatory_bodies = models.CharField(max_length=20, choices=REGULATORY_BODIES, default='AICTE')
    nep_non_nep = models.CharField(max_length=20, choices=NEP_OPTIONS, default='Non-NEP')
    naac_non_naac = models.CharField(max_length=20, choices=NAAC_OPTIONS, default='NAAC')
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('academic_year', 'course', 'branch', 'semester', 'school')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.course} - {self.branch} ({self.academic_year})"

    def clean(self):
        if self.semester and not self.semester.strip():
            raise ValidationError('Semester cannot be empty')
        if self.academic_year and not self.academic_year.strip():
            raise ValidationError('Academic Year cannot be empty')
        if self.course and not self.course.strip():
            raise ValidationError('Course cannot be empty')
        if self.branch and not self.branch.strip():
            raise ValidationError('Branch cannot be empty')



class Subject(models.Model):
    subject_name = models.CharField(max_length=100)
    subject_code = models.CharField(max_length=20)
    subject_type = models.CharField(max_length=20, choices=[('Theory', 'Theory'), ('Practical', 'Practical')])
    programme = models.ForeignKey(Programme, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.subject_name} ({self.subject_code})"


class Scheme(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='schemes')
    midterm1 = models.IntegerField()
    midterm2 = models.IntegerField()
    class_participation = models.IntegerField()
    total_credits = models.IntegerField()
    endterm_theory = models.IntegerField()
    endterm_practical = models.IntegerField()
    internal_viva = models.IntegerField()
    progressive = models.IntegerField(default=0, null=True, blank=True)
    total_practical_credits = models.IntegerField()
    total_tutorial_credits = models.IntegerField()
    updated_by = models.CharField(max_length=100, null=True, blank=True)
    is_new = models.BooleanField(default=False)
    introduction_year = models.CharField(max_length=4, null=True, blank=True)