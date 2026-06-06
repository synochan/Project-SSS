import * as Network from 'expo-network';
import { markQueue, markSaleSynced, pendingQueue } from '@/database/repositories';
import { api } from './api';

let syncing = false;

export async function isOnline() {
  const state = await Network.getNetworkStateAsync();
  return Boolean(state.isConnected && state.isInternetReachable !== false);
}

export async function processSyncQueue() {
  if (syncing) return;
  if (!(await isOnline())) return;
  syncing = true;
  try {
    const items = await pendingQueue();
    for (const item of items) {
      await markQueue(item.id, 'SYNCING');
      try {
        const payload = JSON.parse(item.payload);
        if (item.entity_type === 'sale' && item.action === 'CREATE') {
          const response = await api.post<{ id: number }>('/sales/', payload);
          await markSaleSynced(item.entity_id, response.id);
        }
        if (item.entity_type === 'product') {
          if (item.action === 'CREATE') await api.post('/products/', payload);
          if (item.action === 'UPDATE' && payload.remote_id) await api.put(`/products/${payload.remote_id}/`, payload);
        }
        await markQueue(item.id, 'SYNCED');
      } catch {
        await markQueue(item.id, 'FAILED');
      }
    }
  } finally {
    syncing = false;
  }
}
