import { useQuery } from '@tanstack/react-query';
import { View, StyleSheet } from 'react-native';
import { Body, H1, H2, Screen, Stat } from '@/components/pos-ui';
import { dashboardStats, listProducts } from '@/database/repositories';
import { money } from '@/utils/money';

export default function ReportsScreen() {
  const { data } = useQuery({ queryKey: ['report-dashboard'], queryFn: dashboardStats });
  const { data: products = [] } = useQuery({ queryKey: ['report-products'], queryFn: () => listProducts('') });
  const inventoryValue = products.reduce((sum, product) => sum + product.price * product.stock, 0);
  const lowStock = products.filter((product) => product.stock <= product.low_stock_threshold).map((product) => product.name).join(', ') || 'None';

  return (
    <Screen>
      <H1>Reports</H1>
      <View style={styles.stats}>
        <Stat label="Daily Sales" value={money(data?.todays_sales || 0)} />
        <Stat label="Weekly Sales" value={money(data?.todays_sales || 0)} />
        <Stat label="Monthly Sales" value={money(data?.todays_sales || 0)} />
        <Stat label="Inventory Value" value={money(inventoryValue)} />
      </View>
      <View style={styles.panel}>
        <H2>Best Selling Products</H2>
        <Body>{data?.best_selling_product || 'No sales yet'}</Body>
      </View>
      <View style={styles.panel}>
        <H2>Low Stock Products</H2>
        <Body>{lowStock}</Body>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  panel: { backgroundColor: 'white', borderRadius: 8, padding: 14, borderWidth: 1, borderColor: '#e1e7ef', gap: 8 },
});
