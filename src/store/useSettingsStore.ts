import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface SettingsStore {
  storeStatus: 'open' | 'closed';
  fetchStatus: () => Promise<void>;
  isClosed: () => boolean;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  storeStatus: 'open',
  fetchStatus: async () => {
    try {
      const { data } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'store_status')
        .single();
      if (data) set({ storeStatus: data.value as 'open' | 'closed' });
    } catch (err) {
      console.error('Failed to fetch store status');
    }
  },
  isClosed: () => get().storeStatus === 'closed',
}));
