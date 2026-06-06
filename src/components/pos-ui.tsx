import { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

export function Screen({ children }: PropsWithChildren) {
  return <View style={styles.screen}>{children}</View>;
}

export function H1({ children }: PropsWithChildren) {
  return <Text style={styles.h1}>{children}</Text>;
}

export function H2({ children }: PropsWithChildren) {
  return <Text style={styles.h2}>{children}</Text>;
}

export function Body({ children }: PropsWithChildren) {
  return <Text style={styles.body}>{children}</Text>;
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  disabled = false,
}: PropsWithChildren<{ onPress?: () => void; variant?: 'primary' | 'ghost' | 'danger'; disabled?: boolean }>) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.button, styles[variant], disabled && styles.disabled]}>
      <Text style={[styles.buttonText, variant === 'ghost' && styles.ghostText]}>{children}</Text>
    </Pressable>
  );
}

export function Field(props: TextInputProps) {
  return <TextInput placeholderTextColor="#7b8794" {...props} style={[styles.field, props.style]} />;
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f6f8fb', padding: 16, gap: 14 },
  h1: { fontSize: 28, fontWeight: '800', color: '#17202a' },
  h2: { fontSize: 18, fontWeight: '700', color: '#243447' },
  body: { fontSize: 14, color: '#52616f' },
  button: { minHeight: 46, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  primary: { backgroundColor: '#0f7b6c' },
  danger: { backgroundColor: '#b42318' },
  ghost: { backgroundColor: '#e8edf2' },
  disabled: { opacity: 0.55 },
  buttonText: { color: 'white', fontWeight: '700' },
  ghostText: { color: '#17202a' },
  field: { minHeight: 46, borderRadius: 8, backgroundColor: 'white', borderWidth: 1, borderColor: '#d8dee6', paddingHorizontal: 12, color: '#17202a' },
  stat: { flex: 1, minWidth: 145, backgroundColor: 'white', borderRadius: 8, padding: 14, borderWidth: 1, borderColor: '#e1e7ef' },
  statLabel: { color: '#687789', fontSize: 12 },
  statValue: { color: '#17202a', fontSize: 20, fontWeight: '800', marginTop: 6 },
});
