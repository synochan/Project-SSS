import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import { Body, Button, Field, H1, Screen } from '@/components/pos-ui';
import { useAuthStore } from '@/store/auth-store';

export default function LoginScreen() {
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const [email, setEmail] = useState('owner@cashtrack.test');
  const [password, setPassword] = useState('password123');

  async function submit() {
    try {
      await login(email, password);
      router.replace('/');
    } catch (error) {
      Alert.alert('Login failed', error instanceof Error ? error.message : 'Check your credentials.');
    }
  }

  return (
    <Screen>
      <H1>Login</H1>
      <Field value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Email" />
      <Field value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" />
      <Button onPress={submit} disabled={loading}>{loading ? 'Signing in...' : 'Login'}</Button>
      <View>
        <Body>Forgot password support is exposed in backend structure.</Body>
        <Link href="/register"><Body>Create an owner account</Body></Link>
      </View>
    </Screen>
  );
}
