import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { useState } from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { Body, Button, Field, H1, palette, Screen } from '@/components/pos-ui';
import { listProducts } from '@/database/repositories';
import { useAuthStore } from '@/store/auth-store';
import { money } from '@/utils/money';

export default function ProductsScreen() {
  const [query, setQuery] = useState('');
  const user = useAuthStore((state) => state.user);
  const canManageProducts = !user || user.role === 'OWNER';
  const { data = [], refetch } = useQuery({ queryKey: ['products', query], queryFn: () => listProducts(query) });

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <H1>Products</H1>
          {!canManageProducts && <Body>Cashier view</Body>}
        </View>
        {canManageProducts && <Link href="/product-form" asChild><Button>Add</Button></Link>}
      </View>
      <Field value={query} onChangeText={setQuery} placeholder="Search products" onSubmitEditing={() => refetch()} />
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.row}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.thumbnail} />
            ) : (
              <View style={styles.thumbnailFallback}>
                <Text style={styles.thumbnailText}>{item.name.slice(0, 1).toUpperCase()}</Text>
              </View>
            )}
            <View style={styles.copy}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>{item.category} - Stock {item.stock}</Text>
              {item.stock <= item.low_stock_threshold && <Text style={styles.warning}>Low stock</Text>}
            </View>
            <Text style={styles.price}>{money(item.price)}</Text>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  list: { gap: 10, paddingBottom: 30 },
  row: {
    backgroundColor: palette.surface,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: palette.line,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  thumbnail: { width: 58, height: 58, borderRadius: 8, backgroundColor: palette.surfaceMuted },
  thumbnailFallback: {
    width: 58,
    height: 58,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surfaceMuted,
    borderWidth: 1,
    borderColor: palette.line,
  },
  thumbnailText: { color: palette.primaryDark, fontWeight: '900', fontSize: 20 },
  copy: { flex: 1, minWidth: 0, justifyContent: 'center' },
  name: { color: palette.ink, fontWeight: '900', fontSize: 16 },
  meta: { color: palette.muted, marginTop: 4 },
  warning: { color: palette.danger, marginTop: 4, fontWeight: '800' },
  price: { color: palette.primaryDark, fontWeight: '900' },
});
