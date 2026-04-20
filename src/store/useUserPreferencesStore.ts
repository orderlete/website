import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from './useCartStore';

interface UserPreferencesStore {
  categoryScores: Record<string, number>;
  recordInteraction: (product: Product, weight: number) => void;
  getTopCategories: (limit?: number) => string[];
}

export const useUserPreferencesStore = create<UserPreferencesStore>()(
  persist(
    (set, get) => ({
      categoryScores: {},
      
      recordInteraction: (product, weight = 1) => {
        const currentScores = { ...get().categoryScores };
        
        // Add score to main category
        if (product.category) {
          currentScores[product.category] = (currentScores[product.category] || 0) + weight;
        }

        // Add score to subcategories (often present as product.categories or product.subcategories)
        const categories = (product as any).categories || [];
        const subcategories = (product as any).subcategories || [];
        
        [...categories, ...subcategories].forEach((cat: string) => {
          if (cat && typeof cat === 'string') {
             currentScores[cat] = (currentScores[cat] || 0) + weight;
          }
        });

        // Optional: decay older scores to prevent long-term lock-in could be implemented here
        // but simple additive scoring works for now

        set({ categoryScores: currentScores });
      },

      getTopCategories: (limit = 3) => {
        const scores = get().categoryScores;
        return Object.entries(scores)
          .sort(([, a], [, b]) => b - a)
          .slice(0, limit)
          .map(([cat]) => cat);
      }
    }),
    {
      name: 'user-preferences-storage',
    }
  )
);
