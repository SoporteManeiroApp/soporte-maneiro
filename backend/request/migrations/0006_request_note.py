# Generated by Django 4.2.23 on 2025-06-23 12:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('request', '0005_alter_request_created_at'),
    ]

    operations = [
        migrations.AddField(
            model_name='request',
            name='note',
            field=models.TextField(default='', verbose_name='Descripción'),
            preserve_default=False,
        ),
    ]
