from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('demo/', views.demo, name='demo'),
    path('<str:room_name>/', views.room, name='room'),
]
