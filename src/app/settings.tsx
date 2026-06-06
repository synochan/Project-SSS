import { Button, Body, H1, Screen } from '@/components/pos-ui';
import { processSyncQueue } from '@/services/sync-engine';

export default function SettingsScreen() {
  return (
    <Screen>
      <H1>Settings</H1>
      <Body>JWT tokens are stored with Expo SecureStore. Offline data is stored in Expo SQLite and synced automatically.</Body>
      <Button onPress={processSyncQueue}>Sync Now</Button>
    </Screen>
  );
}
