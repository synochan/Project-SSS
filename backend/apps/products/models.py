from django.db import models


class Product(models.Model):
    shop = models.ForeignKey('shops.Shop', on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=180)
    category = models.CharField(max_length=80, default='General')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    low_stock_threshold = models.PositiveIntegerField(default=5)
    image = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=['shop', 'name'])]

    def __str__(self):
        return self.name
