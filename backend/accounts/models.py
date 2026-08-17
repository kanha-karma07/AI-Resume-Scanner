from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):

    class Roles(models.TextChoices):
        CANDIDATE = "candidate", "Candidate"
        RECRUITER = "recruiter", "Recruiter"
        ADMIN = "admin", "Admin"

    role = models.CharField(
        max_length=20,
        choices=Roles.choices,
        default=Roles.CANDIDATE
    )

    class MembershipTypes(models.TextChoices):
        FREE = "FREE", "Free"
        PREMIUM = "PREMIUM", "Premium"

    class SubscriptionStatus(models.TextChoices):
        FREE = "FREE", "Free"
        ACTIVE = "ACTIVE", "Active"
        CANCELED = "CANCELED", "Canceled"

    class PaymentStatus(models.TextChoices):
        PENDING = "PENDING", "Pending"
        SUCCESS = "SUCCESS", "Success"
        FAILED = "FAILED", "Failed"

    is_premium = models.BooleanField(default=False)
    
    membership_type = models.CharField(
        max_length=20,
        choices=MembershipTypes.choices,
        default=MembershipTypes.FREE
    )

    plan = models.CharField(
        max_length=20,
        choices=MembershipTypes.choices,
        default=MembershipTypes.FREE
    )

    subscription_status = models.CharField(
        max_length=20,
        choices=SubscriptionStatus.choices,
        default=SubscriptionStatus.FREE
    )

    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING
    )

    membership_start_date = models.DateTimeField(null=True, blank=True)
    membership_end_date = models.DateTimeField(null=True, blank=True)

    full_name = models.CharField(
        max_length=255,
        blank=True,
        default=""
    )
    
    company_name = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )
    
    phone_number = models.CharField(
        max_length=15,
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.username


import uuid

class PaymentHistory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="payment_history")
    plan = models.CharField(max_length=50)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50)
    date = models.DateTimeField(auto_now_add=True)
    payment_type = models.CharField(max_length=50, default="DEMO PAYMENT")
    order_id = models.CharField(max_length=100, blank=True, null=True)
    payment_id = models.CharField(max_length=100, blank=True, null=True)
    signature = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} - {self.plan} - {self.status}"