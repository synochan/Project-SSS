import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Button, Field, H1, Screen } from '@/components/pos-ui';
import { listProducts } from '@/database/repositories';
import { useCartStore } from '@/store/cart-store';
import { money } from '@/utils/money';

export default function POSScreen() {
  const [query, setQuery] = useState('');
  const { data = [] } = useQuery({ queryKey: ['pos-products', query], queryFn: () => listProducts(query) });
  const add = useCartStore((state) => state.add);
  const items = useCartStore((state) => state.items);
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <Screen>
      <View style={styles.header}>
        <H1>POS</H1>
        <Link href="/checkout" asChild><Button disabled={items.length === 0}>{money(total)}</Button></Link>
      </View>
      <Field value={query} onChangeText={setQuery} placeholder="Search product" />
      <FlatList
        data={data}
        numColumns={2}
        keyExtractor={(item) => String(item.id)}
        columnWrapperStyle={styles.columns}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.product}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>{money(item.price)}</Text>
            <Text style={styles.meta}>Stock {item.stock}</Text>
            <Button disabled={item.stock <= 0} onPress={() => add(item)}>{item.stock <= 0 ? 'Out' : 'Add'}</Button>
          </View>
        )}
      />
      <View style={styles.cart}>
        <Text style={styles.cartTitle}>Cart: {items.length} items</Text>
        {items.map((item) => <Text key={String(item.product.id)} style={styles.meta}>{item.product.name} x {item.quantity}</Text>)}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  list: { gap: 10, paddingBottom: 12 },
  columns: { gap: 10 },
  product: { flex: 1, backgroundColor: 'white', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#e1e7ef', gap: 8 },
  name: { color: '#17202a', fontWeight: '800', fontSize: 16 },
  meta: { color: '#607080' },
  cart: { backgroundColor: 'white', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#e1e7ef' },
  cartTitle: { color: '#17202a', fontWeight: '800', marginBottom: 6 },
});
