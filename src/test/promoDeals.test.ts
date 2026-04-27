import { describe, expect, it } from 'vitest';
import { calcBuy2Get1Free, promoBreakdown } from '@/lib/promoDeals';
import type { CartItem, DbProduct } from '@/lib/store';

function cartItem(productType: string, price: number, quantity = 1, discountPercent = 0): CartItem {
  return {
    product: {
      id: `${productType}-${price}-${quantity}`,
      name: `${productType} ${price}`,
      brand: 'Test Brand',
      price,
      product_type: productType,
      discount_percent: discountPercent,
    } as DbProduct,
    size: '100ml',
    quantity,
  };
}

describe('buy 2 get 1 promo', () => {
  it('makes the lowest-priced Master Box free for every three Master Boxes', () => {
    const cart = [
      cartItem('Master Box', 1500),
      cartItem('Master Box', 1350),
      cartItem('Master Box', 1100),
    ];

    expect(calcBuy2Get1Free(cart)).toBe(1100);
    expect(promoBreakdown(cart)).toEqual([
      { type: 'Master Box', freeCount: 1, saving: 1100, freeItemPrices: [1100] },
    ]);
  });

  it('keeps Tester and Master Box offers separate', () => {
    const cart = [
      cartItem('Master Box', 1500),
      cartItem('Master Box', 1350),
      cartItem('Tester', 900),
      cartItem('Tester', 800),
      cartItem('Tester', 700),
    ];

    expect(calcBuy2Get1Free(cart)).toBe(700);
    expect(promoBreakdown(cart)).toEqual([
      { type: 'Tester', freeCount: 1, saving: 700, freeItemPrices: [700] },
    ]);
  });

  it('counts quantities and uses discounted prices', () => {
    const cart = [cartItem('Tester', 1000, 3, 10)];

    expect(calcBuy2Get1Free(cart)).toBe(900);
  });
});
