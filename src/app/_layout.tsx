import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { seedLocalProducts } from '@/database/repositories';
import { processSyncQueue } from '@/services/sync-engine';
import { useAuthStore } from '@/store/auth-store';

const queryClient = new QueryClient();

export default function RootLayout() {
  const loadMe = useAuthStore((state) => state.loadMe);
  useEffect(() => {
    seedLocalProducts();
    loadMe();
    processSyncQueue();
    const interval = setInterval(processSyncQueue, 20000);
    return () => clearInterval(interval);
  }, [loadMe]);
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#f5f5f2' } }}>
          <Stack.Screen name="index" options={{ title: 'CashTrack POS' }} />
          <Stack.Screen name="login" options={{ title: 'Login' }} />
          <Stack.Screen name="register" options={{ title: 'Register' }} />
          <Stack.Screen name="products" options={{ title: 'Products' }} />
          <Stack.Screen name="product-form" options={{ title: 'Product Form' }} />
          <Stack.Screen name="inventory" options={{ title: 'Inventory' }} />
          <Stack.Screen name="pos" options={{ title: 'POS' }} />
          <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
          <Stack.Screen name="receipt" options={{ title: 'Receipt' }} />
          <Stack.Screen name="sales-history" options={{ title: 'Sales History' }} />
          <Stack.Screen name="reports" options={{ title: 'Reports' }} />
          <Stack.Screen name="profile" options={{ title: 'Profile' }} />
          <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
