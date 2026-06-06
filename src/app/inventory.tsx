import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { Button, Field, H1, Screen } from '@/components/pos-ui';
import { adjustStock, listProducts } from '@/database/repositories';

export default function InventoryScreen() {
  const { data = [], refetch } = useQuery({ queryKey: ['inventory'], queryFn: () => listProducts('') });
  const [amounts, setAmounts] = useState<Record<string, string>>({});

  async function adjust(id: string | number, mode: 'ADD' | 'REDUCE') {
    try {
      await adjustStock(id, Number(amounts[String(id)] || 0), mode, 'Manual inventory adjustment');
      await refetch();
    } catch (error) {
      Alert.alert('Inventory error', error instanceof Error ? error.message : 'Could not adjust stock.');
    }
  }

  return (
    <Screen>
      <H1>Inventory</H1>
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.titleRow}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={[styles.stock, item.stock <= 0 && styles.out]}>{item.stock <= 0 ? 'Out of stock' : `Stock ${item.stock}`}</Text>
            </View>
            <Field value={amounts[String(item.id)] || ''} onChangeText={(value) => setAmounts((state) => ({ ...state, [String(item.id)]: value }))} keyboardType="number-pad" placeholder="Qty" />
            <View style={styles.actions}>
              <Button onPress={() => adjust(item.id, 'ADD')}>Add</Button>
              <Button variant="ghost" onPress={() => adjust(item.id, 'REDUCE')}>Reduce</Button>
            </View>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10, paddingBottom: 30 },
  row: { backgroundColor: 'white', borderRadius: 8, padding: 14, borderWidth: 1, borderColor: '#e1e7ef', gap: 10 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  name: { color: '#17202a', fontWeight: '800', fontSize: 16 },
  stock: { color: '#0f7b6c', fontWeight: '700' },
  out: { color: '#b42318' },
  actions: { flexDirection: 'row', gap: 10 },
});
