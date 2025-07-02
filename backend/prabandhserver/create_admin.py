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

# Delete faculty by email (admin tool)
def delete_faculty_by_email():
    email = input('Enter the primary email of the faculty to delete: ').strip()
    try:
        faculty = Faculty.objects.get(primary_email=email)
        faculty.delete()
        print(f'Faculty with email {email} deleted successfully!')
    except Faculty.DoesNotExist:
        print(f'No faculty found with email {email}.')

if __name__ == '__main__':
    print('1. Create admin user (default)')
    print('2. Delete faculty by email')
    choice = input('Enter your choice (1/2): ').strip()
    if choice == '2':
        delete_faculty_by_email()
    else:
        print('Done.')
