from rest_framework import serializers

from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ('id', 'shop', 'name', 'category', 'price', 'stock', 'low_stock_threshold', 'image', 'is_active', 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')

    def validate(self, attrs):
        if attrs.get('stock', 0) < 0:
            raise serializers.ValidationError('No negative stock.')
        return attrs
