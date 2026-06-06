from django.conf import settings
from django.db import models


class Sale(models.Model):
    CASH = 'CASH'
    GCASH = 'GCASH'
    OTHER = 'OTHER'
    PAYMENT_METHODS = [(CASH, 'Cash'), (GCASH, 'GCash'), (OTHER, 'Other')]

    shop = models.ForeignKey('shops.Shop', on_delete=models.CASCADE, related_name='sales')
    cashier = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='sales')
    receipt_number = models.CharField(max_length=40, unique=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=16, choices=PAYMENT_METHODS)
    amount_received = models.DecimalField(max_digits=12, decimal_places=2)
    change_amount = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField()

    class Meta:
        indexes = [models.Index(fields=['shop', 'created_at'])]


class SaleItem(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.Product', on_delete=models.PROTECT)
    product_name = models.CharField(max_length=180)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
