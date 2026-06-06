from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied

from apps.core.permissions import user_is_owner_for_shop, user_shop_ids
from .models import Product
from .serializers import ProductSerializer


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer

    def get_queryset(self):
        queryset = Product.objects.filter(shop_id__in=user_shop_ids(self.request.user), is_active=True)
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)
        return queryset.order_by('name')

    def perform_create(self, serializer):
        shop = serializer.validated_data['shop']
        if not user_is_owner_for_shop(self.request.user, shop.id):
            raise PermissionDenied('Only owners can add products.')
        serializer.save()

    def perform_update(self, serializer):
        if not user_is_owner_for_shop(self.request.user, serializer.instance.shop_id):
            raise PermissionDenied('Only owners can edit products.')
        serializer.save()

    def perform_destroy(self, instance):
        if not user_is_owner_for_shop(self.request.user, instance.shop_id):
            raise PermissionDenied('Only owners can delete products.')
        instance.is_active = False
        instance.save(update_fields=['is_active'])
