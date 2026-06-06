from django.db import models


class InventoryLog(models.Model):
    ADD = 'ADD'
    REDUCE = 'REDUCE'
    SALE = 'SALE'
    ADJUST = 'ADJUST'
    ACTIONS = [(ADD, 'Add'), (REDUCE, 'Reduce'), (SALE, 'Sale'), (ADJUST, 'Adjust')]

    product = models.ForeignKey('products.Product', on_delete=models.CASCADE, related_name='inventory_logs')
    action = models.CharField(max_length=16, choices=ACTIONS)
    quantity = models.PositiveIntegerField()
    previous_stock = models.PositiveIntegerField()
    new_stock = models.PositiveIntegerField()
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
