import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies = [('products', '0001_initial')]
    operations = [
        migrations.CreateModel(
            name='InventoryLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('action', models.CharField(choices=[('ADD', 'Add'), ('REDUCE', 'Reduce'), ('SALE', 'Sale'), ('ADJUST', 'Adjust')], max_length=16)),
                ('quantity', models.PositiveIntegerField()),
                ('previous_stock', models.PositiveIntegerField()),
                ('new_stock', models.PositiveIntegerField()),
                ('note', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='inventory_logs', to='products.product')),
            ],
        ),
    ]
