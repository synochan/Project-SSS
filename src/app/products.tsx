import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Button, Field, H1, Screen } from '@/components/pos-ui';
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
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>{item.category} • Stock {item.stock}</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  list: { gap: 10, paddingBottom: 30 },
  row: { backgroundColor: 'white', borderRadius: 8, padding: 14, borderWidth: 1, borderColor: '#e1e7ef', flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  name: { color: '#17202a', fontWeight: '800', fontSize: 16 },
  meta: { color: '#607080', marginTop: 4 },
  warning: { color: '#b42318', marginTop: 4, fontWeight: '700' },
  price: { color: '#0f7b6c', fontWeight: '800' },
});
