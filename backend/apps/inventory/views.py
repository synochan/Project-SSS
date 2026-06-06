from django.db import transaction
from rest_framework import decorators, response, status, viewsets

from apps.core.permissions import user_is_owner_for_shop, user_shop_ids
from apps.products.models import Product
from .models import InventoryLog
from .serializers import InventoryLogSerializer, StockAdjustmentSerializer


class InventoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InventoryLogSerializer

    def get_queryset(self):
        return InventoryLog.objects.filter(product__shop_id__in=user_shop_ids(self.request.user)).select_related('product').order_by('-created_at')

    @decorators.action(detail=False, methods=['post'], url_path='add-stock')
    def add_stock(self, request):
        return self._adjust(request, 'ADD')

    @decorators.action(detail=False, methods=['post'], url_path='reduce-stock')
    def reduce_stock(self, request):
        return self._adjust(request, 'REDUCE')

    @transaction.atomic
    def _adjust(self, request, action):
        serializer = StockAdjustmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = Product.objects.select_for_update().get(id=serializer.validated_data['product'], shop_id__in=user_shop_ids(request.user))
        if not user_is_owner_for_shop(request.user, product.shop_id):
            return response.Response({'detail': 'Only owners can adjust inventory.'}, status=status.HTTP_403_FORBIDDEN)
        quantity = serializer.validated_data['quantity']
        previous = product.stock
        product.stock = product.stock + quantity if action == 'ADD' else product.stock - quantity
        if product.stock < 0:
            return response.Response({'detail': 'No negative stock.'}, status=status.HTTP_400_BAD_REQUEST)
        product.save(update_fields=['stock', 'updated_at'])
        log = InventoryLog.objects.create(
            product=product,
            action=action,
            quantity=quantity,
            previous_stock=previous,
            new_stock=product.stock,
            note=serializer.validated_data.get('note', ''),
        )
        return response.Response(InventoryLogSerializer(log).data)
