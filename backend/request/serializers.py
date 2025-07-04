from rest_framework import serializers
from .models import Request

class RequestSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    # technician_username = serializers.CharField(source='technician.username', read_only=True)
    technician_full_name = serializers.SerializerMethodField()
        
    class Meta:
        model = Request
        fields = [
            'id',
            'subject',
            'description',
            'note',
            'department',
            'department_name',
            'technician',
            'technician_full_name',
            'created_at'
        ]
        read_only_fields = [
            'id',
            'created_at',
            'department_name',
            'technician_full_name'
        ]
        
    def get_technician_full_name(self, obj):
        if obj.technician:
            return f"{obj.technician.first_name} {obj.technician.last_name}".strip()
        return None 