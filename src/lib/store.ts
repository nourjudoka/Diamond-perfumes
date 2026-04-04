import { create } from 'zustand';
import type { Tables } from '@/integrations/supabase/types';

export type DbProduct = Tables<'products'>;
export type DbOrder = Tables<'orders'>;
export type DbDiscount = Tables<'discounts'>;

export interface CartItem {
  product: DbProduct;
  size: string;
  quantity: number;
}

interface StoreState {
  cart: CartItem[];
  cartOpen: boolean;
  addToCart: (product: DbProduct, size: string) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, qty: number) => void;
  clearCart: () => void;
  setCartOpen: (open: boolean) => void;
}

export const useStore = create<StoreState>((set) => ({
  cart: [],
  cartOpen: false,
  addToCart: (product, size) =>
    set((state) => {
      const existing = state.cart.find((i) => i.product.id === product.id && i.size === size);
      if (existing) {
        return { cart: state.cart.map((i) => i.product.id === product.id && i.size === size ? { ...i, quantity: i.quantity + 1 } : i), cartOpen: true };
      }
      return { cart: [...state.cart, { product, size, quantity: 1 }], cartOpen: true };
    }),
  removeFromCart: (productId, size) =>
    set((state) => ({ cart: state.cart.filter((i) => !(i.product.id === productId && i.size === size)) })),
  updateQuantity: (productId, size, qty) =>
    set((state) => ({
      cart: qty <= 0
        ? state.cart.filter((i) => !(i.product.id === productId && i.size === size))
        : state.cart.map((i) => i.product.id === productId && i.size === size ? { ...i, quantity: qty } : i),
    })),
  clearCart: () => set({ cart: [] }),
  setCartOpen: (open) => set({ cartOpen: open }),
}));
