from rest_framework import serializers

from .models import InventoryLog


class InventoryLogSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = InventoryLog
        fields = ('id', 'product', 'product_name', 'action', 'quantity', 'previous_stock', 'new_stock', 'note', 'created_at')
        read_only_fields = ('previous_stock', 'new_stock', 'created_at')


class StockAdjustmentSerializer(serializers.Serializer):
    product = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)
    note = serializers.CharField(required=False, allow_blank=True)
