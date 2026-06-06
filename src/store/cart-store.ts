import { create } from 'zustand';
import { CartItem, Product } from '@/types/domain';

type CartState = {
  items: CartItem[];
  add: (product: Product) => void;
  increase: (id: Product['id']) => void;
  decrease: (id: Product['id']) => void;
  remove: (id: Product['id']) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>((set) => ({
  items: [],
  add(product) {
    set((state) => {
      const current = state.items.find((item) => item.product.id === product.id);
      if (current) {
        return {
          items: state.items.map((item) =>
            item.product.id === product.id && item.quantity < product.stock ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        };
      }
      if (product.stock <= 0) return state;
      return { items: [...state.items, { product, quantity: 1 }] };
    });
  },
  increase(id) {
    set((state) => ({
      items: state.items.map((item) =>
        item.product.id === id && item.quantity < item.product.stock ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    }));
  },
  decrease(id) {
    set((state) => ({
      items: state.items
        .map((item) => (item.product.id === id ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0),
    }));
  },
  remove(id) {
    set((state) => ({ items: state.items.filter((item) => item.product.id !== id) }));
  },
  clear() {
    set({ items: [] });
  },
}));
