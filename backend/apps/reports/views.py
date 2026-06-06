from datetime import timedelta

from django.db.models import DecimalField, ExpressionWrapper, F, Sum
from django.utils import timezone
from rest_framework import response, views

from apps.core.permissions import user_shop_ids
from apps.products.models import Product
from apps.sales.models import SaleItem


class BaseReportView(views.APIView):
    days = 1

    def get(self, request):
        since = timezone.now() - timedelta(days=self.days)
        shops = user_shop_ids(request.user)
        items = SaleItem.objects.filter(sale__shop_id__in=shops, sale__created_at__gte=since)
        best = items.values('product_name').annotate(quantity=Sum('quantity')).order_by('-quantity').first()
        products = Product.objects.filter(shop_id__in=shops, is_active=True)
        inventory_value = ExpressionWrapper(F('price') * F('stock'), output_field=DecimalField(max_digits=14, decimal_places=2))
        return response.Response({
            'sales': items.aggregate(total=Sum('subtotal'))['total'] or 0,
            'transactions': items.values('sale_id').distinct().count(),
            'best_selling_products': items.values('product_name').annotate(quantity=Sum('quantity')).order_by('-quantity')[:10],
            'best_selling_product': best['product_name'] if best else None,
            'inventory_value': products.aggregate(value=Sum(inventory_value))['value'] or 0,
            'low_stock_products': products.filter(stock__lte=F('low_stock_threshold')).values('id', 'name', 'stock'),
            'low_stock_count': products.filter(stock__lte=F('low_stock_threshold')).count(),
            'total_products': products.count(),
        })


class DailyReportView(BaseReportView):
    days = 1


class WeeklyReportView(BaseReportView):
    days = 7


class MonthlyReportView(BaseReportView):
    days = 30
