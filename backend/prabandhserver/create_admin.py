import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'prabandhserver.settings')
django.setup()

from authentication.models import Faculty

# Create admin user if it doesn't exist
if not Faculty.objects.filter(primary_email='admin@itm.edu').exists():
    Faculty.objects.create_superuser(
        email='admin@itm.edu',
        name='Admin User',
        registration_no='ADMIN',
        password='password123',
        emptype='admin'  # Adding emptype since it's required
    )
    print('Admin user created successfully!')
else:
    print('Admin user already exists.')
