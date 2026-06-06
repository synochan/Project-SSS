import { router } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';
import { Button, H1, palette, Screen } from '@/components/pos-ui';
import { useAuthStore } from '@/store/auth-store';

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  async function signOut() {
    await logout();
    router.replace('/');
  }

  return (
    <Screen>
      <H1>Profile</H1>
      <View style={styles.panel}>
        <Text style={styles.name}>{user?.first_name || user?.username || 'Offline User'}</Text>
        <Text style={styles.meta}>{user?.email || 'No remote account loaded'}</Text>
        <Text style={styles.meta}>Role: {user?.role || 'OWNER demo'}</Text>
      </View>
      <Button variant="danger" onPress={signOut}>Logout</Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  panel: { backgroundColor: palette.surface, borderRadius: 8, padding: 14, borderWidth: 1, borderColor: palette.line, gap: 6 },
  name: { color: palette.ink, fontWeight: '900', fontSize: 20 },
  meta: { color: palette.muted },
});
