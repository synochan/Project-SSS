import { Link, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button, H1, palette, Screen } from '@/components/pos-ui';
import { money } from '@/utils/money';

export default function ReceiptScreen() {
  const params = useLocalSearchParams<{ receipt: string; total: string; change: string }>();
  return (
    <Screen>
      <View style={styles.receipt}>
        <H1>Receipt</H1>
        <Text style={styles.label}>Receipt Number</Text>
        <Text style={styles.value}>{params.receipt}</Text>
        <Text style={styles.label}>Date</Text>
        <Text style={styles.value}>{new Date().toLocaleString()}</Text>
        <Text style={styles.label}>Total</Text>
        <Text style={styles.total}>{money(Number(params.total || 0))}</Text>
        <Text style={styles.label}>Change</Text>
        <Text style={styles.value}>{money(Number(params.change || 0))}</Text>
      </View>
      <Link href="/pos" asChild><Button>New Sale</Button></Link>
      <Link href="/sales-history" asChild><Button variant="ghost">View Sales</Button></Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  receipt: { backgroundColor: palette.surface, borderRadius: 8, padding: 18, borderWidth: 1, borderColor: palette.line, gap: 8 },
  label: { color: palette.muted, fontSize: 12, marginTop: 8, fontWeight: '700' },
  value: { color: palette.ink, fontWeight: '800', fontSize: 16 },
  total: { color: palette.primaryDark, fontWeight: '900', fontSize: 28 },
});
