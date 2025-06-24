from django.contrib.auth.management.commands import createsuperuser
from django.core.management.base import CommandError
from django.core import exceptions
import getpass


class Command(createsuperuser.Command):
    def handle(self, *args, **options):
        email = input('Primary email: ')
        name = input('Name: ')
        registration_no = input('Registration no: ')
        
        password = getpass.getpass()
        password2 = getpass.getpass('Password (again): ')
        
        if password != password2:
            self.stderr.write("Error: Your passwords didn't match.")
            return

        try:
            user = self.UserModel._default_manager.create_superuser(
                email=email,
                name=name,
                registration_no=registration_no,
                password=password
            )
            if options['verbosity'] >= 1:
                self.stdout.write("Superuser created successfully.")
        except exceptions.ValidationError as e:
            raise CommandError('; '.join(e.messages))
        except Exception as e:
            raise CommandError(str(e))