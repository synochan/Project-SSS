export type Role = 'OWNER' | 'CASHIER';
export type PaymentMethod = 'CASH' | 'GCASH' | 'OTHER';
export type SyncStatus = 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';

export type User = {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role?: Role;
  shop_id?: number;
};

export type Shop = {
  id: number;
  name: string;
  address: string;
  contact_number: string;
  owner: number;
};

export type Product = {
  id: number | string;
  remote_id?: number;
  shop: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  low_stock_threshold: number;
  image?: string | null;
  is_active: boolean | number;
  updated_at?: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type SaleItem = {
  id?: number | string;
  product: number | string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
};

export type Sale = {
  id: number | string;
  remote_id?: number;
  shop: number;
  cashier: number;
  receipt_number: string;
  total_amount: number;
  payment_method: PaymentMethod;
  amount_received: number;
  change_amount: number;
  created_at: string;
  synced?: boolean | number;
  items: SaleItem[];
};

export type InventoryLog = {
  id?: number | string;
  product: number | string;
  action: 'ADD' | 'REDUCE' | 'SALE' | 'ADJUST';
  quantity: number;
  previous_stock: number;
  new_stock: number;
  note?: string;
  created_at: string;
};

export type DashboardStats = {
  todays_sales: number;
  todays_transactions: number;
  low_stock_count: number;
  total_products: number;
  best_selling_product: string;
};
