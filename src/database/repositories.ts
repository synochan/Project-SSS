import { database } from './schema';
import { CartItem, Product, Sale, SyncStatus } from '@/types/domain';
import { receiptNumber } from '@/utils/money';

const uuid = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export async function seedLocalProducts(shop = 1) {
  const db = await database();
  const count = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM products');
  if ((count?.count || 0) > 0) return;
  const products = [
    ['Fried Chicken', 'Food', 99, 50, 8],
    ['Rice', 'Food', 15, 100, 20],
    ['Softdrinks 8oz', 'Drinks', 20, 75, 12],
    ['Burger', 'Food', 75, 30, 6],
    ['Fries', 'Food', 45, 40, 8],
  ] as const;
  for (const [name, category, price, stock, threshold] of products) {
    await db.runAsync(
      'INSERT INTO products (id, shop, name, category, price, stock, low_stock_threshold, is_active, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)',
      [uuid(), shop, name, category, price, stock, threshold, new Date().toISOString()],
    );
  }
}

export async function listProducts(query = '') {
  const db = await database();
  const rows = await db.getAllAsync<Product>('SELECT * FROM products WHERE is_active = 1 AND name LIKE ? ORDER BY name', [`%${query}%`]);
  return rows.map((row) => ({ ...row, is_active: Boolean(row.is_active) }));
}

export async function upsertProduct(product: Partial<Product>) {
  const db = await database();
  const id = String(product.id || uuid());
  await db.runAsync(
    `INSERT OR REPLACE INTO products
    (id, remote_id, shop, name, category, price, stock, low_stock_threshold, image, is_active, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      product.remote_id ?? null,
      product.shop || 1,
      product.name || '',
      product.category || 'General',
      product.price || 0,
      product.stock || 0,
      product.low_stock_threshold || 5,
      product.image || null,
      product.is_active === false ? 0 : 1,
      new Date().toISOString(),
    ],
  );
  await enqueue('product', id, product.remote_id ? 'UPDATE' : 'CREATE', { ...product, id });
}

export async function adjustStock(productId: string | number, quantity: number, action: 'ADD' | 'REDUCE' | 'ADJUST', note = '') {
  const db = await database();
  const product = await db.getFirstAsync<Product>('SELECT * FROM products WHERE id = ?', [String(productId)]);
  if (!product) throw new Error('Product not found');
  const newStock = action === 'ADD' ? product.stock + quantity : product.stock - quantity;
  if (newStock < 0) throw new Error('No negative stock allowed');
  await db.runAsync('UPDATE products SET stock = ?, updated_at = ? WHERE id = ?', [newStock, new Date().toISOString(), String(productId)]);
  await db.runAsync(
    'INSERT INTO inventory_logs (id, product, action, quantity, previous_stock, new_stock, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [uuid(), String(productId), action, quantity, product.stock, newStock, note, new Date().toISOString()],
  );
}

export async function createOfflineSale(cart: CartItem[], payment_method: Sale['payment_method'], amount_received: number, cashier = 1, shop = 1) {
  if (cart.length === 0) throw new Error('No checkout with empty cart');
  const db = await database();
  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  if (payment_method === 'CASH' && amount_received < total) throw new Error('Cash received must cover total');
  for (const item of cart) {
    const latest = await db.getFirstAsync<Product>('SELECT * FROM products WHERE id = ?', [String(item.product.id)]);
    if (!latest || latest.stock < item.quantity) throw new Error(`${item.product.name} has insufficient stock`);
  }
  const id = uuid();
  const sale: Sale = {
    id,
    shop,
    cashier,
    receipt_number: receiptNumber(),
    total_amount: total,
    payment_method,
    amount_received,
    change_amount: payment_method === 'CASH' ? amount_received - total : 0,
    created_at: new Date().toISOString(),
    synced: false,
    items: cart.map((item) => ({
      id: uuid(),
      product: item.product.remote_id || item.product.id,
      product_name: item.product.name,
      quantity: item.quantity,
      unit_price: item.product.price,
      subtotal: item.product.price * item.quantity,
    })),
  };
  await db.runAsync(
    'INSERT INTO sales (id, shop, cashier, receipt_number, total_amount, payment_method, amount_received, change_amount, created_at, synced) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)',
    [sale.id, shop, cashier, sale.receipt_number, total, payment_method, amount_received, sale.change_amount, sale.created_at],
  );
  for (const cartItem of cart) {
    const item = sale.items.find((candidate) => candidate.product === (cartItem.product.remote_id || cartItem.product.id));
    await db.runAsync(
      'INSERT INTO sale_items (id, sale_id, product, product_name, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [String(item?.id), sale.id, String(cartItem.product.id), cartItem.product.name, cartItem.quantity, cartItem.product.price, cartItem.product.price * cartItem.quantity],
    );
    await adjustStock(cartItem.product.id, cartItem.quantity, 'REDUCE', `Sale ${sale.receipt_number}`);
  }
  await enqueue('sale', id, 'CREATE', sale);
  return sale;
}

export async function listSales() {
  const db = await database();
  return db.getAllAsync<Sale>('SELECT * FROM sales ORDER BY created_at DESC LIMIT 100');
}

export async function dashboardStats() {
  const db = await database();
  const today = new Date().toISOString().slice(0, 10);
  const sales = await db.getFirstAsync<{ total: number; count: number }>(
    "SELECT COALESCE(SUM(total_amount),0) as total, COUNT(*) as count FROM sales WHERE substr(created_at,1,10) = ?",
    [today],
  );
  const products = await db.getFirstAsync<{ total: number; low: number }>(
    'SELECT COUNT(*) as total, SUM(CASE WHEN stock <= low_stock_threshold THEN 1 ELSE 0 END) as low FROM products WHERE is_active = 1',
  );
  const best = await db.getFirstAsync<{ product_name: string }>(
    'SELECT product_name, SUM(quantity) qty FROM sale_items GROUP BY product_name ORDER BY qty DESC LIMIT 1',
  );
  return {
    todays_sales: sales?.total || 0,
    todays_transactions: sales?.count || 0,
    low_stock_count: products?.low || 0,
    total_products: products?.total || 0,
    best_selling_product: best?.product_name || 'No sales yet',
  };
}

export async function enqueue(entity_type: string, entity_id: string, action: string, payload: unknown, status: SyncStatus = 'PENDING') {
  const db = await database();
  await db.runAsync(
    'INSERT INTO sync_queue (id, entity_type, entity_id, action, payload, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [uuid(), entity_type, entity_id, action, JSON.stringify(payload), status, new Date().toISOString()],
  );
}

export async function pendingQueue() {
  const db = await database();
  return db.getAllAsync<{ id: string; entity_type: string; entity_id: string; action: string; payload: string; status: SyncStatus }>(
    "SELECT * FROM sync_queue WHERE status IN ('PENDING','FAILED') ORDER BY created_at",
  );
}

export async function markQueue(id: string, status: SyncStatus) {
  const db = await database();
  await db.runAsync('UPDATE sync_queue SET status = ? WHERE id = ?', [status, id]);
}

export async function markSaleSynced(localId: string, remoteId: number) {
  const db = await database();
  await db.runAsync('UPDATE sales SET synced = 1, remote_id = ? WHERE id = ?', [remoteId, localId]);
}
