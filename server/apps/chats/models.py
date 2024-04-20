from uuid import uuid4
from django.db import models


class Chat(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    user_id = models.UUIDField(blank=True, null=True)

    # Chat Details
    prompt = models.TextField(blank=False, null=True)
    message = models.TextField(blank=False, null=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.id

    class Meta:
        db_table = "chats"
        ordering = ["-created_at"]
        verbose_name = "Chat"
        verbose_name_plural = "Chats"
