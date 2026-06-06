from decimal import Decimal

from django.db import transaction
from django.utils.dateparse import parse_datetime
from django.utils import timezone
from rest_framework import serializers

from apps.core.permissions import user_shop_ids
from apps.inventory.models import InventoryLog
from apps.products.models import Product
from .models import Sale, SaleItem


class SaleItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SaleItem
        fields = ('id', 'product', 'product_name', 'quantity', 'unit_price', 'subtotal')
        read_only_fields = ('id',)


class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True)

    class Meta:
        model = Sale
        fields = ('id', 'shop', 'cashier', 'receipt_number', 'total_amount', 'payment_method', 'amount_received', 'change_amount', 'created_at', 'items')
        read_only_fields = ('cashier',)

    def validate(self, attrs):
        items = attrs.get('items') or []
        if not items:
            raise serializers.ValidationError('No checkout with empty cart.')
        total = sum(Decimal(str(item['subtotal'])) for item in items)
        if total != attrs['total_amount']:
            raise serializers.ValidationError('Sale total does not match line items.')
        if attrs['payment_method'] == Sale.CASH and attrs['amount_received'] < attrs['total_amount']:
            raise serializers.ValidationError('Cash received must cover total amount.')
        if attrs['shop'].id not in user_shop_ids(self.context['request'].user):
            raise serializers.ValidationError('You cannot create sales for this shop.')
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        items = validated_data.pop('items')
        request = self.context['request']
        created_at = validated_data.get('created_at')
        if isinstance(created_at, str):
            validated_data['created_at'] = parse_datetime(created_at) or timezone.now()
        sale = Sale.objects.create(cashier=request.user, **validated_data)
        for item in items:
            product = Product.objects.select_for_update().get(id=item['product'].id, shop=sale.shop, is_active=True)
            if product.stock < item['quantity']:
                raise serializers.ValidationError(f'{product.name} has insufficient stock.')
            previous = product.stock
            product.stock -= item['quantity']
            product.save(update_fields=['stock', 'updated_at'])
            SaleItem.objects.create(sale=sale, product=product, product_name=product.name, quantity=item['quantity'], unit_price=item['unit_price'], subtotal=item['subtotal'])
            InventoryLog.objects.create(product=product, action=InventoryLog.SALE, quantity=item['quantity'], previous_stock=previous, new_stock=product.stock, note=sale.receipt_number)
        return sale
