import { useQuery } from '@tanstack/react-query';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { H1, Screen } from '@/components/pos-ui';
import { listSales } from '@/database/repositories';
import { money } from '@/utils/money';

export default function SalesHistoryScreen() {
  const { data = [] } = useQuery({ queryKey: ['sales-history'], queryFn: listSales });
  return (
    <Screen>
      <H1>Sales History</H1>
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View>
              <Text style={styles.name}>{item.receipt_number}</Text>
              <Text style={styles.meta}>{new Date(item.created_at).toLocaleString()} • {item.payment_method}</Text>
            </View>
            <View>
              <Text style={styles.price}>{money(item.total_amount)}</Text>
              <Text style={styles.sync}>{item.synced ? 'Synced' : 'Pending'}</Text>
            </View>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10, paddingBottom: 30 },
  row: { backgroundColor: 'white', borderRadius: 8, padding: 14, borderWidth: 1, borderColor: '#e1e7ef', flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  name: { color: '#17202a', fontWeight: '800', fontSize: 15 },
  meta: { color: '#607080', marginTop: 4 },
  price: { color: '#0f7b6c', fontWeight: '800', textAlign: 'right' },
  sync: { color: '#607080', marginTop: 4, textAlign: 'right' },
});
