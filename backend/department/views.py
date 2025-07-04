from rest_framework import viewsets, permissions
from .models import Department
from .serializers import DepartmentSerializer

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all().order_by('name')
    permission_classes = [permissions.AllowAny]
    serializer_class = DepartmentSerializer