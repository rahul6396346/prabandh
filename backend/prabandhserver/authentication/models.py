from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone
from deputy_registrar.models import School

class FacultyManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email must be set")
        email = self.normalize_email(email)
        user = self.model(primary_email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, registration_no, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(
            email=email,
            password=password,
            name=name,
            registration_no=registration_no,
            **extra_fields
        )


class Faculty(AbstractBaseUser, PermissionsMixin):
    school = models.ForeignKey(School, on_delete=models.SET_NULL, null=True, blank=True)
    department = models.CharField(max_length=70, blank=True)
    emptype = models.CharField(max_length=70, blank=False)  # Making emptype required
    registration_no = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=70)
    father_name = models.CharField(max_length=70, blank=True)
    gender = models.CharField(max_length=10, choices=(('Male', 'Male'), ('Female', 'Female')), blank=True)
    category = models.CharField(max_length=10, choices=(('General', 'General'), ('SC', 'SC'), ('ST', 'ST'), ('OBC', 'OBC')), blank=True)
    dob = models.CharField(max_length=70, blank=True)
    designation = models.CharField(max_length=70, blank=True)
    contact_no = models.CharField(max_length=15, blank=True)
    primary_email = models.EmailField(max_length=100, unique=True)
    official_email = models.EmailField(max_length=100, blank=True)
    address = models.TextField(blank=True)
    joining_date = models.CharField(max_length=70, blank=True)
    qualification = models.CharField(max_length=70, blank=True)
    experience = models.CharField(max_length=70, blank=True)
    marital_status = models.CharField(max_length=10, choices=(('Yes', 'Yes'), ('No', 'No')), blank=True)

    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)

    failed_login_attempts = models.PositiveIntegerField(default=0)
    last_failed_login = models.DateTimeField(blank=True, null=True)
    account_locked_until = models.DateTimeField(blank=True, null=True)
    last_login_ip = models.CharField(max_length=45, blank=True, null=True)
    password_changed_at = models.DateTimeField(blank=True, null=True)
    two_factor_enabled = models.BooleanField(default=False)
    two_factor_method = models.CharField(max_length=20, choices=[('email', 'Email'), ('sms', 'SMS'), ('app', 'Authenticator App')], blank=True, null=True)

    objects = FacultyManager()

    USERNAME_FIELD = 'primary_email'
    EMAIL_FIELD = 'primary_email'
    REQUIRED_FIELDS = ['name', 'registration_no']

    def __str__(self):
        return f"{self.name} ({self.primary_email})"
