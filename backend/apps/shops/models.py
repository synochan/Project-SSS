from django.conf import settings
from django.db import models


class Shop(models.Model):
    name = models.CharField(max_length=160)
    address = models.TextField(blank=True)
    contact_number = models.CharField(max_length=32, blank=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_shops')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class ShopMember(models.Model):
    OWNER = 'OWNER'
    CASHIER = 'CASHIER'
    ROLE_CHOICES = [(OWNER, 'Owner'), (CASHIER, 'Cashier')]

    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='memberships')
    role = models.CharField(max_length=16, choices=ROLE_CHOICES)

    class Meta:
        unique_together = ('shop', 'user')
