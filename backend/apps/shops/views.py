from rest_framework import viewsets

from apps.core.permissions import user_shop_ids
from .models import Shop, ShopMember
from .serializers import ShopSerializer


class ShopViewSet(viewsets.ModelViewSet):
    serializer_class = ShopSerializer

    def get_queryset(self):
        return Shop.objects.filter(id__in=user_shop_ids(self.request.user)).prefetch_related('members')

    def perform_create(self, serializer):
        shop = serializer.save(owner=self.request.user)
        ShopMember.objects.get_or_create(shop=shop, user=self.request.user, defaults={'role': ShopMember.OWNER})
