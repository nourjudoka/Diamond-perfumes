import type { CartItem } from './store';

/**
 * Buy 2 Get 1 Free promotion.
 * Rules:
 *  - Applies per product type: "Master Box" and "Tester" are independent.
 *  - For every 3 units of the same type, the cheapest one is free.
 *  - Algorithm: within each type group, sort unit prices descending.
 *    Items at indices 2, 5, 8... (every 3rd) are the cheapest of each triplet, so they are free.
 */

const PROMO_TYPES = ['Master Box', 'Tester'] as const;
type PromoType = typeof PROMO_TYPES[number];

function isPromoType(type: string): type is PromoType {
  return PROMO_TYPES.includes(type as PromoType);
}

function effectivePrice(item: CartItem): number {
  return item.product.discount_percent && item.product.discount_percent > 0
    ? item.product.price * (1 - item.product.discount_percent / 100)
    : item.product.price;
}

export function calcBuy2Get1Free(cart: CartItem[]): number {
  const groups: Record<string, number[]> = { 'Master Box': [], Tester: [] };

  for (const item of cart) {
    const type = item.product.product_type ?? 'Master Box';
    if (!isPromoType(type)) continue;
    const price = effectivePrice(item);
    for (let q = 0; q < item.quantity; q++) {
      groups[type].push(price);
    }
  }

  let saving = 0;
  for (const prices of Object.values(groups)) {
    prices.sort((a, b) => b - a); // descending, so index 2,5,8... is cheapest of each triplet
    for (let i = 2; i < prices.length; i += 3) {
      saving += prices[i];
    }
  }
  return saving;
}

export interface PromoBreakdownItem {
  type: string;
  freeCount: number;
  saving: number;
  freeItemPrices: number[]; // individual prices of free items, for display
}

/** Returns a per-type breakdown of the promo deal. */
export function promoBreakdown(cart: CartItem[]): PromoBreakdownItem[] {
  const result: PromoBreakdownItem[] = [];
  const groups: Record<string, number[]> = { 'Master Box': [], Tester: [] };

  for (const item of cart) {
    const type = item.product.product_type ?? 'Master Box';
    if (!isPromoType(type)) continue;
    const price = effectivePrice(item);
    for (let q = 0; q < item.quantity; q++) {
      groups[type].push(price);
    }
  }

  for (const [type, prices] of Object.entries(groups)) {
    prices.sort((a, b) => b - a);
    let saving = 0;
    const freeItemPrices: number[] = [];
    for (let i = 2; i < prices.length; i += 3) {
      saving += prices[i];
      freeItemPrices.push(prices[i]);
    }
    if (freeItemPrices.length > 0) {
      result.push({ type, freeCount: freeItemPrices.length, saving, freeItemPrices });
    }
  }
  return result;
}
