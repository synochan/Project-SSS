from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from apps.products.models import Product
from apps.shops.models import Shop, ShopMember


class Command(BaseCommand):
    help = 'Create demo owner, shop, cashier, and products.'

    def handle(self, *args, **options):
        User = get_user_model()
        owner, _ = User.objects.get_or_create(
            email='owner@cashtrack.test',
            defaults={'username': 'owner', 'first_name': 'Demo', 'last_name': 'Owner'},
        )
        owner.set_password('password123')
        owner.save()
        cashier, _ = User.objects.get_or_create(
            email='cashier@cashtrack.test',
            defaults={'username': 'cashier', 'first_name': 'Demo', 'last_name': 'Cashier'},
        )
        cashier.set_password('password123')
        cashier.save()
        shop, _ = Shop.objects.get_or_create(name='CashTrack Demo Shop', owner=owner, defaults={'address': 'Demo Street', 'contact_number': '09170000000'})
        ShopMember.objects.get_or_create(shop=shop, user=owner, defaults={'role': ShopMember.OWNER})
        ShopMember.objects.get_or_create(shop=shop, user=cashier, defaults={'role': ShopMember.CASHIER})
        products = [
            ('Fried Chicken', 99, 50),
            ('Rice', 15, 100),
            ('Softdrinks 8oz', 20, 75),
            ('Burger', 75, 30),
            ('Fries', 45, 40),
        ]
        for name, price, stock in products:
            Product.objects.update_or_create(
                shop=shop,
                name=name,
                defaults={'category': 'Food', 'price': price, 'stock': stock, 'low_stock_threshold': 5, 'is_active': True},
            )
        self.stdout.write(self.style.SUCCESS('Seeded demo CashTrack data.'))
