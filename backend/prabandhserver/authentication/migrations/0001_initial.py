# Generated by Django 4.2.21 on 2025-06-23 17:51

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
        ('deputy_registrar', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Faculty',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('department', models.CharField(blank=True, max_length=70)),
                ('emptype', models.CharField(max_length=70)),
                ('registration_no', models.CharField(max_length=50, unique=True)),
                ('name', models.CharField(max_length=70)),
                ('father_name', models.CharField(blank=True, max_length=70)),
                ('gender', models.CharField(blank=True, choices=[('Male', 'Male'), ('Female', 'Female')], max_length=10)),
                ('category', models.CharField(blank=True, choices=[('General', 'General'), ('SC', 'SC'), ('ST', 'ST'), ('OBC', 'OBC')], max_length=10)),
                ('dob', models.CharField(blank=True, max_length=70)),
                ('designation', models.CharField(blank=True, max_length=70)),
                ('contact_no', models.CharField(blank=True, max_length=15)),
                ('primary_email', models.EmailField(max_length=100, unique=True)),
                ('official_email', models.EmailField(blank=True, max_length=100)),
                ('address', models.TextField(blank=True)),
                ('joining_date', models.CharField(blank=True, max_length=70)),
                ('qualification', models.CharField(blank=True, max_length=70)),
                ('experience', models.CharField(blank=True, max_length=70)),
                ('marital_status', models.CharField(blank=True, choices=[('Yes', 'Yes'), ('No', 'No')], max_length=10)),
                ('is_staff', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now)),
                ('failed_login_attempts', models.PositiveIntegerField(default=0)),
                ('last_failed_login', models.DateTimeField(blank=True, null=True)),
                ('account_locked_until', models.DateTimeField(blank=True, null=True)),
                ('last_login_ip', models.CharField(blank=True, max_length=45, null=True)),
                ('password_changed_at', models.DateTimeField(blank=True, null=True)),
                ('two_factor_enabled', models.BooleanField(default=False)),
                ('two_factor_method', models.CharField(blank=True, choices=[('email', 'Email'), ('sms', 'SMS'), ('app', 'Authenticator App')], max_length=20, null=True)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('school', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='deputy_registrar.school')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
