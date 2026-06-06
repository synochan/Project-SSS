import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies = [('products', '0001_initial'), ('shops', '0001_initial'), migrations.swappable_dependency(settings.AUTH_USER_MODEL)]
    operations = [
        migrations.CreateModel(
            name='Sale',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('receipt_number', models.CharField(max_length=40, unique=True)),
                ('total_amount', models.DecimalField(decimal_places=2, max_digits=12)),
                ('payment_method', models.CharField(choices=[('CASH', 'Cash'), ('GCASH', 'GCash'), ('OTHER', 'Other')], max_length=16)),
                ('amount_received', models.DecimalField(decimal_places=2, max_digits=12)),
                ('change_amount', models.DecimalField(decimal_places=2, max_digits=12)),
                ('created_at', models.DateTimeField()),
                ('cashier', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='sales', to=settings.AUTH_USER_MODEL)),
                ('shop', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sales', to='shops.shop')),
            ],
        ),
        migrations.CreateModel(
            name='SaleItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('product_name', models.CharField(max_length=180)),
                ('quantity', models.PositiveIntegerField()),
                ('unit_price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('subtotal', models.DecimalField(decimal_places=2, max_digits=12)),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='products.product')),
                ('sale', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='sales.sale')),
            ],
        ),
        migrations.AddIndex(model_name='sale', index=models.Index(fields=['shop', 'created_at'], name='sales_sale_shop_id_7035a1_idx')),
    ]
