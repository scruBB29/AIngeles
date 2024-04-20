from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # chats
    path("api/v1/chats/", include("apps.chats.urls")),
]
