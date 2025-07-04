#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input

# El proceso de Render es lo suficientemente robusto para manejar las migraciones aquí.
python manage.py migrate

# Llama a nuestro comando personalizado para crear el superusuario de forma segura.
python manage.py create_superuser_if_not_exists