from django.db import models

class Department(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name='Nombre')
    director = models.CharField(max_length=100, verbose_name='Director')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Creado en')
    
    class Meta:
        verbose_name = 'Departamento'
        verbose_name_plural = 'Departamentos'
        ordering = ['name']
        
    def __str__(self):
        return self.name