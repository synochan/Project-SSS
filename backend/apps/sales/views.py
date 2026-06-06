from rest_framework import viewsets

from apps.core.permissions import user_shop_ids
from .models import Sale
from .serializers import SaleSerializer


class SaleViewSet(viewsets.ModelViewSet):
    serializer_class = SaleSerializer

    def get_queryset(self):
        queryset = Sale.objects.filter(shop_id__in=user_shop_ids(self.request.user)).prefetch_related('items').order_by('-created_at')
        if not self.request.user.memberships.filter(role='OWNER').exists():
            queryset = queryset.filter(cashier=self.request.user)
        return queryset
