import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Body, Button, Field, H1, palette, Screen } from '@/components/pos-ui';
import { upsertProduct } from '@/database/repositories';
import { useAuthStore } from '@/store/auth-store';

export default function ProductFormScreen() {
  const user = useAuthStore((state) => state.user);
  const canManageProducts = !user || user.role === 'OWNER';
  const [name, setName] = useState('');
  const [category, setCategory] = useState('General');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [threshold, setThreshold] = useState('5');
  const [image, setImage] = useState('');

  async function chooseImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo access to attach a product image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (asset.base64) {
      setImage(`data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`);
      return;
    }
    setImage(asset.uri);
  }

  async function submit() {
    if (!canManageProducts) {
      Alert.alert('Owner only', 'Only owner accounts can add or update products.');
      return;
    }
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
    await upsertProduct({
      name: name.trim(),
      category: category.trim() || 'General',
      price: parsedPrice,
      stock: parsedStock,
      low_stock_threshold: parsedThreshold,
      image: image.trim() || null,
      shop: 1,
      is_active: true,
    });
    router.replace('/products');
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View>
          <H1>Product</H1>
          <Body>{canManageProducts ? 'Owner catalog controls' : 'Only owner accounts can manage products'}</Body>
        </View>
        <View style={styles.imagePanel}>
          {image ? (
            <Image source={{ uri: image }} style={styles.preview} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>Image</Text>
            </View>
          )}
          <View style={styles.imageActions}>
            <Button variant="secondary" onPress={chooseImage} disabled={!canManageProducts}>Choose Image</Button>
            {image ? <Button variant="ghost" onPress={() => setImage('')}>Remove</Button> : null}
          </View>
        </View>
        <Field value={image} onChangeText={setImage} autoCapitalize="none" placeholder="Image URL or selected image data" editable={canManageProducts} />
        <Field value={name} onChangeText={setName} placeholder="Product name" editable={canManageProducts} />
        <Field value={category} onChangeText={setCategory} placeholder="Category" editable={canManageProducts} />
        <Field value={price} onChangeText={setPrice} keyboardType="decimal-pad" placeholder="Price" editable={canManageProducts} />
        <Field value={stock} onChangeText={setStock} keyboardType="number-pad" placeholder="Stock" editable={canManageProducts} />
        <Field value={threshold} onChangeText={setThreshold} keyboardType="number-pad" placeholder="Low stock threshold" editable={canManageProducts} />
        <Button onPress={submit} disabled={!canManageProducts}>Save Product</Button>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 12, paddingBottom: 30 },
  imagePanel: {
    backgroundColor: palette.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 12,
    gap: 12,
  },
  preview: { width: '100%', height: 210, borderRadius: 8, backgroundColor: palette.surfaceMuted },
  placeholder: {
    height: 170,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surfaceMuted,
    borderWidth: 1,
    borderColor: palette.line,
  },
  placeholderText: { color: palette.muted, fontWeight: '900' },
  imageActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
