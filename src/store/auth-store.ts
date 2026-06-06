import { create } from 'zustand';
import { api } from '@/services/api';
import { clearTokens, saveTokens } from '@/services/token-storage';
import { User } from '@/types/domain';

type AuthState = {
  user?: User;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: Record<string, unknown>) => Promise<void>;
  loadMe: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  loading: false,
  async login(email, password) {
    set({ loading: true });
    const tokens = await api.post<{ access: string; refresh: string }>('/auth/login/', { email, password });
    await saveTokens(tokens.access, tokens.refresh);
    const user = await api.get<User>('/auth/me/');
    set({ user, loading: false });
  },
  async register(payload) {
    set({ loading: true });
    const tokens = await api.post<{ access: string; refresh: string }>('/auth/register/', payload);
    await saveTokens(tokens.access, tokens.refresh);
    const user = await api.get<User>('/auth/me/');
    set({ user, loading: false });
  },
  async loadMe() {
    try {
      const user = await api.get<User>('/auth/me/');
      set({ user });
    } catch {
      set({ user: undefined });
    }
  },
  async logout() {
    await clearTokens();
    set({ user: undefined });
  },
}));
