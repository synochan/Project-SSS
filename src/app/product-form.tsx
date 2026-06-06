import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { Button, Field, H1, Screen } from '@/components/pos-ui';
import { upsertProduct } from '@/database/repositories';

export default function ProductFormScreen() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('General');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [threshold, setThreshold] = useState('5');

  async function submit() {
    const parsedPrice = Number(price);
    const parsedStock = Number(stock);
    const parsedThreshold = Number(threshold);
    if (!name.trim() || !price.trim() || !stock.trim() || !Number.isFinite(parsedPrice) || parsedPrice < 0 || !Number.isFinite(parsedStock) || parsedStock < 0) {
      Alert.alert('Invalid product', 'Name, price, and non-negative stock are required.');
      return;
    }
    if (!Number.isFinite(parsedThreshold) || parsedThreshold < 0) {
      Alert.alert('Invalid threshold', 'Low stock threshold must be zero or higher.');
      return;
    }
    await upsertProduct({ name: name.trim(), category: category.trim() || 'General', price: parsedPrice, stock: parsedStock, low_stock_threshold: parsedThreshold, shop: 1, is_active: true });
    router.replace('/products');
  }

  return (
    <Screen>
      <H1>Product</H1>
      <Field value={name} onChangeText={setName} placeholder="Product name" />
      <Field value={category} onChangeText={setCategory} placeholder="Category" />
      <Field value={price} onChangeText={setPrice} keyboardType="decimal-pad" placeholder="Price" />
      <Field value={stock} onChangeText={setStock} keyboardType="number-pad" placeholder="Stock" />
      <Field value={threshold} onChangeText={setThreshold} keyboardType="number-pad" placeholder="Low stock threshold" />
      <Button onPress={submit}>Save Product</Button>
    </Screen>
  );
}
