from django.contrib import admin
from django.urls import path, include
from app.views import register

urlpatterns = [
    path('', include('django.contrib.auth.urls')),  # /login and /logout
    path('register/', register, name='register'),
    path('admin/', admin.site.urls),
    path('app/', include('app.urls'))
]
