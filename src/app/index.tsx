import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Body, Button, H1, H2, Screen, Stat } from '@/components/pos-ui';
import { dashboardStats } from '@/database/repositories';
import { processSyncQueue } from '@/services/sync-engine';
import { useAuthStore } from '@/store/auth-store';
import { money } from '@/utils/money';

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const { data, refetch } = useQuery({ queryKey: ['dashboard'], queryFn: dashboardStats });

  useEffect(() => {
    const refresh = async () => {
      await processSyncQueue();
      refetch();
    };
    refresh();
  }, [refetch]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View>
          <H1>CashTrack POS</H1>
          <Body>{user ? `${user.first_name || user.username} is signed in` : 'Offline demo mode is ready'}</Body>
        </View>
        <View style={styles.stats}>
          <Stat label="Today's Sales" value={money(data?.todays_sales || 0)} />
          <Stat label="Transactions" value={String(data?.todays_transactions || 0)} />
          <Stat label="Low Stock" value={String(data?.low_stock_count || 0)} />
          <Stat label="Products" value={String(data?.total_products || 0)} />
        </View>
        <View style={styles.panel}>
          <H2>Best Selling Product</H2>
          <Body>{data?.best_selling_product || 'No sales yet'}</Body>
        </View>
        <View style={styles.grid}>
          <Link href="/pos" asChild><Button>Open POS</Button></Link>
          <Link href="/products" asChild><Button variant="ghost">Products</Button></Link>
          <Link href="/inventory" asChild><Button variant="ghost">Inventory</Button></Link>
          <Link href="/sales-history" asChild><Button variant="ghost">Sales</Button></Link>
          <Link href="/reports" asChild><Button variant="ghost">Reports</Button></Link>
          <Link href={user ? '/profile' : '/login'} asChild><Button variant="ghost">{user ? 'Profile' : 'Login'}</Button></Link>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16, paddingBottom: 24 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  panel: { backgroundColor: 'white', borderRadius: 8, padding: 14, borderWidth: 1, borderColor: '#e1e7ef', gap: 8 },
  grid: { gap: 10 },
});
