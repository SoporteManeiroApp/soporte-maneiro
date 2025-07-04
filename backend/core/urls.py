from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from user.views import UserViewSet, CustomAuthToken
from department.views import DepartmentViewSet
from request.views import RequestViewSet


router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'requests', RequestViewSet, basename='request')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/login/', CustomAuthToken.as_view(), name='api_token_auth'),
]