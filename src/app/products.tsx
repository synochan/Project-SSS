import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Button, Field, H1, palette, Screen } from '@/components/pos-ui';
import { listProducts } from '@/database/repositories';
import { money } from '@/utils/money';

export default function ProductsScreen() {
  const [query, setQuery] = useState('');
  const { data = [], refetch } = useQuery({ queryKey: ['products', query], queryFn: () => listProducts(query) });

  return (
    <Screen>
      <View style={styles.header}>
        <H1>Products</H1>
        <Link href="/product-form" asChild><Button>Add</Button></Link>
      </View>
      <Field value={query} onChangeText={setQuery} placeholder="Search products" onSubmitEditing={() => refetch()} />
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.row}>
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
  copy: { flex: 1, minWidth: 0 },
  name: { color: palette.ink, fontWeight: '900', fontSize: 16 },
  meta: { color: palette.muted, marginTop: 4 },
  warning: { color: palette.danger, marginTop: 4, fontWeight: '800' },
  price: { color: palette.primaryDark, fontWeight: '900' },
});
