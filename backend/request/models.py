from django.db import models
from django.contrib.auth.models import User
from department.models import Department

class Request(models.Model):
    subject = models.CharField(max_length=255, verbose_name='Asunto')
    description = models.TextField(verbose_name='Descripción')
    note = models.TextField(verbose_name='nota')
    # department_id
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name='requests_for_department',
        verbose_name='Departamento'
    )
    # technician_id
    technician = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='assigned_requests',
        verbose_name='Técnico Asignado'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creación')
    
    class Meta:
        verbose_name = 'Solicitud'
        verbose_name_plural = 'Solicitudes'
        ordering = ['-created_at']

    def __str__(self):
        return self.subject