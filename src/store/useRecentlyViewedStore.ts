import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from './useCartStore';

interface RecentlyViewedStore {
  items: Product[];
  addRecentlyViewed: (product: Product) => void;
  clearRecentlyViewed: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set, get) => ({
      items: [],
      addRecentlyViewed: (product) => {
        const currentItems = get().items;
        // prevent duplicate
        const filteredItems = currentItems.filter(item => item.id !== product.id);
        // keep max 20 items
        set({
          items: [product, ...filteredItems].slice(0, 20)
        });
      },
      clearRecentlyViewed: () => set({ items: [] }),
    }),
    {
      name: 'recently-viewed-storage',
    }
  )
);
