import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    """
    Crea un superusuario si no existe uno con el mismo nombre de usuario.
    Toma los datos de las variables de entorno.
    """
    help = 'Crea un superusuario a partir de variables de entorno si no existe.'

    def handle(self, *args, **options):
        username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')

        if not all([username, email, password]):
            self.stdout.write(self.style.ERROR(
                'Faltan las variables de entorno DJANGO_SUPERUSER_USERNAME, DJANGO_SUPERUSER_EMAIL o DJANGO_SUPERUSER_PASSWORD.'
            ))
            return

        if not User.objects.filter(username=username).exists():
            self.stdout.write(self.style.SUCCESS(f'Creando superusuario: {username}'))
            User.objects.create_superuser(username=username, email=email, password=password)
        else:
            self.stdout.write(self.style.WARNING(f'El superusuario "{username}" ya existe.'))
