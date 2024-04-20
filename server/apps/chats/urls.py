from django.urls import path

# views
from .views import ChatCreateView

urlpatterns = [
    path("create/", ChatCreateView.as_view(), name="create-chat"),
]