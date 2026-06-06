import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Field, H1, Screen } from '@/components/pos-ui';
import { createOfflineSale } from '@/database/repositories';
import { processSyncQueue } from '@/services/sync-engine';
import { useCartStore } from '@/store/cart-store';
import { PaymentMethod } from '@/types/domain';
import { money } from '@/utils/money';

export default function CheckoutScreen() {
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [amountReceived, setAmountReceived] = useState('');
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  async function checkout() {
    try {
      const sale = await createOfflineSale(items, paymentMethod, Number(amountReceived || total));
      clear();
      processSyncQueue();
      router.replace({ pathname: '/receipt', params: { receipt: sale.receipt_number, total: String(sale.total_amount), change: String(sale.change_amount) } });
    } catch (error) {
      Alert.alert('Checkout blocked', error instanceof Error ? error.message : 'Please review the cart.');
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <H1>Checkout</H1>
        {items.map((item) => (
          <View key={String(item.product.id)} style={styles.row}>
            <Text style={styles.name}>{item.product.name} x {item.quantity}</Text>
            <Text style={styles.name}>{money(item.product.price * item.quantity)}</Text>
          </View>
        ))}
        <Text style={styles.total}>{money(total)}</Text>
        <View style={styles.actions}>
          {(['CASH', 'GCASH', 'OTHER'] as PaymentMethod[]).map((method) => (
            <Button key={method} variant={paymentMethod === method ? 'primary' : 'ghost'} onPress={() => setPaymentMethod(method)}>{method}</Button>
          ))}
        </View>
        <Field value={amountReceived} onChangeText={setAmountReceived} keyboardType="decimal-pad" placeholder="Amount received" />
        <Button onPress={checkout} disabled={items.length === 0}>Complete Sale</Button>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 12 },
  row: { backgroundColor: 'white', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#e1e7ef', flexDirection: 'row', justifyContent: 'space-between' },
  name: { color: '#17202a', fontWeight: '700' },
  total: { color: '#0f7b6c', fontWeight: '900', fontSize: 28, textAlign: 'right' },
  actions: { flexDirection: 'row', gap: 8 },
});
