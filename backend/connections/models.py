from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db.models import Q, F

class Connection(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    )

    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_connections'
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_connections'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.CheckConstraint(
                check=~Q(sender=F('receiver')),
                name='prevent_self_connection'
            ),
        ]

    def clean(self):
        super().clean()
        if self.sender_id and self.receiver_id and self.sender_id == self.receiver_id:
            raise ValidationError("Users cannot connect with themselves.")

    def __str__(self):
        return f"{self.sender.username} -> {self.receiver.username} ({self.status})"

