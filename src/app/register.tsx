import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { Button, Field, H1, Screen } from '@/components/pos-ui';
import { useAuthStore } from '@/store/auth-store';

export default function RegisterScreen() {
  const register = useAuthStore((state) => state.register);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');

  async function submit() {
    try {
      await register({ email, username, password, shop_name: shopName, first_name: username });
      router.replace('/');
    } catch (error) {
      Alert.alert('Registration failed', error instanceof Error ? error.message : 'Please check the form.');
    }
  }

  return (
    <Screen>
      <H1>Register Owner</H1>
      <Field value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Email" />
      <Field value={username} onChangeText={setUsername} autoCapitalize="none" placeholder="Username" />
      <Field value={shopName} onChangeText={setShopName} placeholder="Shop name" />
      <Field value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" />
      <Button onPress={submit}>Create Account</Button>
    </Screen>
  );
}
