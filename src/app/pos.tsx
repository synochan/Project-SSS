import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Body, Button, Field, H1, H2, palette, Screen } from '@/components/pos-ui';
import { listProducts } from '@/database/repositories';
import { useCartStore } from '@/store/cart-store';
import { money } from '@/utils/money';

export default function POSScreen() {
  const [query, setQuery] = useState('');
  const { width } = useWindowDimensions();
  const { data = [] } = useQuery({ queryKey: ['pos-products', query], queryFn: () => listProducts(query) });
  const add = useCartStore((state) => state.add);
  const increase = useCartStore((state) => state.increase);
  const decrease = useCartStore((state) => state.decrease);
  const items = useCartStore((state) => state.items);
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const columnCount = width >= 1120 ? 3 : width >= 520 ? 2 : 1;

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <H1>POS</H1>
          <Body>{items.length === 0 ? 'Ready for the next sale' : `${items.length} cart line${items.length > 1 ? 's' : ''}`}</Body>
        </View>
        <Link href="/checkout" asChild><Button disabled={items.length === 0}>{money(total)}</Button></Link>
      </View>
      <Field value={query} onChangeText={setQuery} placeholder="Search product" />
      <FlatList
        key={columnCount}
        data={data}
        numColumns={columnCount}
        keyExtractor={(item) => String(item.id)}
        columnWrapperStyle={columnCount > 1 ? styles.columns : undefined}
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
        <View style={styles.cartHeader}>
          <H2>Cart</H2>
          <Text style={styles.price}>{money(total)}</Text>
        </View>
        {items.length === 0 && <Body>No items yet</Body>}
        {items.map((item) => (
          <View key={String(item.product.id)} style={styles.cartLine}>
            <View style={styles.cartCopy}>
              <Text style={styles.cartTitle}>{item.product.name}</Text>
              <Text style={styles.meta}>{money(item.product.price)} each</Text>
            </View>
            <View style={styles.qtyControls}>
              <Button size="compact" variant="ghost" onPress={() => decrease(item.product.id)}>-</Button>
              <Text style={styles.qty}>{item.quantity}</Text>
              <Button size="compact" variant="ghost" onPress={() => increase(item.product.id)}>+</Button>
            </View>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  list: { gap: 10, paddingBottom: 12 },
  columns: { gap: 10 },
  product: { flex: 1, backgroundColor: palette.surface, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: palette.line, gap: 8 },
  name: { color: palette.ink, fontWeight: '900', fontSize: 16 },
  meta: { color: palette.muted },
  price: { color: palette.primaryDark, fontWeight: '900' },
  cart: { backgroundColor: palette.surface, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: palette.line, gap: 10 },
  cartHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  cartLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, borderTopWidth: 1, borderTopColor: palette.line, paddingTop: 10 },
  cartCopy: { flex: 1, minWidth: 0 },
  cartTitle: { color: palette.ink, fontWeight: '800' },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qty: { minWidth: 24, textAlign: 'center', color: palette.ink, fontWeight: '900' },
});
