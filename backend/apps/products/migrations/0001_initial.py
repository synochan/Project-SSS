import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies = [('shops', '0001_initial')]
    operations = [
        migrations.CreateModel(
            name='Product',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=180)),
                ('category', models.CharField(default='General', max_length=80)),
                ('price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('stock', models.PositiveIntegerField(default=0)),
                ('low_stock_threshold', models.PositiveIntegerField(default=5)),
                ('image', models.URLField(blank=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('shop', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='products', to='shops.shop')),
            ],
        ),
        migrations.AddIndex(model_name='product', index=models.Index(fields=['shop', 'name'], name='products_pr_shop_i_3bb1b5_idx')),
    ]
