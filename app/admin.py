from django.contrib import admin
from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser, Document

# Register your models here.
admin.site.register(Document)
admin.site.register(CustomUser)


class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = CustomUser
        fields = ["user_name", "password1"]
