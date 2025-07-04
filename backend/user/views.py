from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from .serializers import UserSerializer
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.serializers import AuthTokenSerializer
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated



class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'], url_path='toggle-active', permission_classes=[permissions.IsAdminUser])
    def toggle_active(self, request, pk=None):
        try:
            user = self.get_object() # Obtiene el usuario específico por su PK
            user.is_active = not user.is_active
            user.save()
            return Response({
                'message': f"El usuario {user.username} ahora está {'activo' if user.is_active else 'inactivo'}.",
                'is_active': user.is_active
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'detail': 'Usuario no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Clase para el inicio de sesión personalizado con token
class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = AuthTokenSerializer(data=request.data,
                                          context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        user_data = UserSerializer(user).data

        return Response({
            'token': token.key,
            'user': user_data
        }, status=status.HTTP_200_OK)