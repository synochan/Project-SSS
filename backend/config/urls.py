from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.inventory.views import InventoryViewSet
from apps.products.views import ProductViewSet
from apps.reports.views import DailyReportView, MonthlyReportView, WeeklyReportView
from apps.sales.views import SaleViewSet
from apps.shops.views import ShopViewSet
from apps.users.views import CurrentUserView, LoginView, LogoutView, RegisterView
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register('shops', ShopViewSet, basename='shop')
router.register('products', ProductViewSet, basename='product')
router.register('sales', SaleViewSet, basename='sale')
router.register('inventory', InventoryViewSet, basename='inventory')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/register/', RegisterView.as_view()),
    path('api/auth/login/', LoginView.as_view()),
    path('api/auth/logout/', LogoutView.as_view()),
    path('api/auth/refresh/', TokenRefreshView.as_view()),
    path('api/auth/me/', CurrentUserView.as_view()),
    path('api/reports/daily/', DailyReportView.as_view()),
    path('api/reports/weekly/', WeeklyReportView.as_view()),
    path('api/reports/monthly/', MonthlyReportView.as_view()),
    path('api/', include(router.urls)),
]
