import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

type Row = Record<string, any>;
type Store = {
  products: Row[];
  sales: Row[];
  sale_items: Row[];
  inventory_logs: Row[];
  sync_queue: Row[];
};

type DatabaseLike = {
  execAsync(sql: string): Promise<void>;
  getFirstAsync<T>(sql: string, params?: unknown[]): Promise<T | null>;
  getAllAsync<T>(sql: string, params?: unknown[]): Promise<T[]>;
  runAsync(sql: string, params?: unknown[]): Promise<void>;
};

let db: DatabaseLike | null = null;
const storageKey = 'cashtrack-pos-db';

export async function database() {
  if (!db) {
    db = await openDatabase();
    await migrate(db);
  }
  return db;
}

async function openDatabase(): Promise<DatabaseLike> {
  if (Platform.OS === 'web') {
    try {
      return (await SQLite.openDatabaseAsync('cashtrack.db')) as unknown as DatabaseLike;
    } catch (error) {
      console.warn('SQLite web failed to initialize; using localStorage database fallback.', error);
      return createLocalDatabase();
    }
  }
  return (await SQLite.openDatabaseAsync('cashtrack.db')) as unknown as DatabaseLike;
}

async function migrate(sqlite: DatabaseLike) {
  await sqlite.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      remote_id INTEGER,
      shop INTEGER NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER NOT NULL,
      low_stock_threshold INTEGER NOT NULL DEFAULT 5,
      image TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT
    );
    CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY,
      remote_id INTEGER,
      shop INTEGER NOT NULL,
      cashier INTEGER NOT NULL,
      receipt_number TEXT NOT NULL,
      total_amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      amount_received REAL NOT NULL,
      change_amount REAL NOT NULL,
      created_at TEXT NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS sale_items (
      id TEXT PRIMARY KEY,
      sale_id TEXT NOT NULL,
      product TEXT NOT NULL,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      subtotal REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS inventory_logs (
      id TEXT PRIMARY KEY,
      product TEXT NOT NULL,
      action TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      previous_stock INTEGER NOT NULL,
      new_stock INTEGER NOT NULL,
      note TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      payload TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}

function createLocalDatabase(): DatabaseLike {
  const read = (): Store => {
    if (typeof localStorage === 'undefined') return emptyStore();
    const saved = localStorage.getItem(storageKey);
    if (!saved) return emptyStore();
    try {
      return { ...emptyStore(), ...JSON.parse(saved) };
    } catch {
      return emptyStore();
    }
  };

  const write = (store: Store) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(store));
    }
  };

  return {
    async execAsync() {},
    async getFirstAsync<T>(sql: string, params: unknown[] = []) {
      const store = read();
      if (sql.includes('COUNT(*) as count FROM products')) {
        return { count: store.products.length } as T;
      }
      if (sql.includes('SELECT * FROM products WHERE id = ?')) {
        return (store.products.find((product) => String(product.id) === String(params[0])) || null) as T | null;
      }
      if (sql.includes('COALESCE(SUM(total_amount),0)')) {
        const date = String(params[0]);
        const rows = store.sales.filter((sale) => String(sale.created_at).slice(0, 10) === date);
        return { total: rows.reduce((sum, sale) => sum + Number(sale.total_amount || 0), 0), count: rows.length } as T;
      }
      if (sql.includes('COUNT(*) as total')) {
        const active = store.products.filter((product) => product.is_active !== 0);
        return {
          total: active.length,
          low: active.filter((product) => Number(product.stock) <= Number(product.low_stock_threshold)).length,
        } as T;
      }
      if (sql.includes('SELECT product_name, SUM(quantity) qty')) {
        const totals = new Map<string, number>();
        for (const item of store.sale_items) {
          totals.set(String(item.product_name), (totals.get(String(item.product_name)) || 0) + Number(item.quantity || 0));
        }
        const [product_name] = [...totals.entries()].sort((a, b) => b[1] - a[1])[0] || [];
        return product_name ? ({ product_name } as T) : null;
      }
      return null;
    },
    async getAllAsync<T>(sql: string, params: unknown[] = []) {
      const store = read();
      if (sql.includes('FROM products WHERE is_active = 1')) {
        const query = String(params[0] || '').replaceAll('%', '').toLowerCase();
        return store.products
          .filter((product) => product.is_active !== 0 && String(product.name).toLowerCase().includes(query))
          .sort((a, b) => String(a.name).localeCompare(String(b.name))) as T[];
      }
      if (sql.includes('FROM sales ORDER BY created_at DESC')) {
        return [...store.sales].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))).slice(0, 100) as T[];
      }
      if (sql.includes('FROM sync_queue WHERE status IN')) {
        return store.sync_queue
          .filter((item) => item.status === 'PENDING' || item.status === 'FAILED')
          .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at))) as T[];
      }
      return [];
    },
    async runAsync(sql: string, params: unknown[] = []) {
      const store = read();
      if (sql.includes('INSERT INTO products') || sql.includes('INSERT OR REPLACE INTO products')) {
        const product = productFromParams(params);
        store.products = [product, ...store.products.filter((item) => String(item.id) !== String(product.id))];
      } else if (sql.includes('UPDATE products SET stock')) {
        const [stock, updated_at, id] = params;
        store.products = store.products.map((product) =>
          String(product.id) === String(id) ? { ...product, stock, updated_at } : product,
        );
      } else if (sql.includes('INSERT INTO inventory_logs')) {
        store.inventory_logs.push(rowFromColumns(['id', 'product', 'action', 'quantity', 'previous_stock', 'new_stock', 'note', 'created_at'], params));
      } else if (sql.includes('INSERT INTO sales')) {
        store.sales.push({
          ...rowFromColumns(
            ['id', 'shop', 'cashier', 'receipt_number', 'total_amount', 'payment_method', 'amount_received', 'change_amount', 'created_at'],
            params,
          ),
          synced: false,
        });
      } else if (sql.includes('INSERT INTO sale_items')) {
        store.sale_items.push(rowFromColumns(['id', 'sale_id', 'product', 'product_name', 'quantity', 'unit_price', 'subtotal'], params));
      } else if (sql.includes('INSERT INTO sync_queue')) {
        store.sync_queue.push(rowFromColumns(['id', 'entity_type', 'entity_id', 'action', 'payload', 'status', 'created_at'], params));
      } else if (sql.includes('UPDATE sync_queue SET status')) {
        const [status, id] = params;
        store.sync_queue = store.sync_queue.map((item) => (String(item.id) === String(id) ? { ...item, status } : item));
      } else if (sql.includes('UPDATE sales SET synced')) {
        const [remote_id, id] = params;
        store.sales = store.sales.map((sale) => (String(sale.id) === String(id) ? { ...sale, synced: true, remote_id } : sale));
      }
      write(store);
    },
  };
}

function emptyStore(): Store {
  return {
    products: [],
    sales: [],
    sale_items: [],
    inventory_logs: [],
    sync_queue: [],
  };
}

function rowFromColumns(columns: string[], values: unknown[]) {
  return Object.fromEntries(columns.map((column, index) => [column, values[index]]));
}

function productFromParams(values: unknown[]): Row {
  const columns =
    values.length === 8
      ? ['id', 'shop', 'name', 'category', 'price', 'stock', 'low_stock_threshold', 'updated_at']
      : ['id', 'remote_id', 'shop', 'name', 'category', 'price', 'stock', 'low_stock_threshold', 'image', 'is_active', 'updated_at'];
  return {
    remote_id: null,
    image: null,
    is_active: 1,
    ...rowFromColumns(columns, values),
  };
}
