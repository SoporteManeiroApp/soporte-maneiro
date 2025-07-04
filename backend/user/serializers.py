from rest_framework import serializers
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'is_superuser',
            'is_staff',
            'is_active',
            'date_joined',
            'last_login',
            'password',
        ]
        
        read_only_fields = [
            'id',
            'is_staff',
            'is_active',
            'date_joined',
            'last_login',
            'is_superuser',
        ]

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        validated_data['is_staff'] = True
        user = User.objects.create(**validated_data)
        if password is not None:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            instance.set_password(validated_data['password'])
            validated_data.pop('password')
        instance.email = validated_data.get('email', instance.email)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.username = validated_data.get('username', instance.username)

        instance.save()
        return super().update(instance, validated_data)