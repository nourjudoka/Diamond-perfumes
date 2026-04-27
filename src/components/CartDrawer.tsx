import { Link } from 'react-router-dom';
import { Gift, Minus, Plus, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useStore } from '@/lib/store';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { calcBuy2Get1Free, promoBreakdown } from '@/lib/promoDeals';

export function CartDrawer() {
  const { cart, cartOpen, setCartOpen, removeFromCart, updateQuantity } = useStore();
  const { data: storeSettings } = useStoreSettings();
  const isPromoEnabled = storeSettings?.promo_buy2get1_enabled ?? true;
  const subtotal = cart.reduce((sum, i) => {
    const effectivePrice = i.product.discount_percent && i.product.discount_percent > 0
      ? i.product.price * (1 - i.product.discount_percent / 100)
      : i.product.price;
    return sum + effectivePrice * i.quantity;
  }, 0);
  const promoDealSaving = isPromoEnabled ? calcBuy2Get1Free(cart) : 0;
  const promoItems = isPromoEnabled ? promoBreakdown(cart) : [];
  const total = Math.max(0, subtotal - promoDealSaving);

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-serif text-xl tracking-wide">Shopping Bag</SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Your bag is empty</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {cart.map((item) => (
                <div key={`${item.product.id}-${item.size}`} className="flex gap-4">
                  <div className="w-20 h-24 bg-secondary flex items-center justify-center shrink-0">
                    <span className="text-xs text-muted-foreground font-sans">{item.product.brand}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-sans">{item.product.brand}</p>
                        <p className="text-sm font-serif mt-0.5">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 font-sans">{item.size}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.product.id, item.size)} className="p-1 hover:text-destructive transition-colors">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-border">
                        <button onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)} className="p-1.5 hover:bg-secondary"><Minus className="h-3 w-3" /></button>
                        <span className="px-3 text-xs font-sans">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)} className="p-1.5 hover:bg-secondary"><Plus className="h-3 w-3" /></button>
                      </div>
                      <span className="text-sm font-sans font-medium">EGP {(item.product.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4 space-y-3">
              {promoItems.length > 0 && (
                <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-3 py-2 space-y-1">
                  {promoItems.map((p) => (
                    <div key={p.type} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Gift className="h-3 w-3 text-[#D4AF37]" />
                        <span className="text-[10px] uppercase tracking-[0.15em] font-sans text-[#D4AF37]">
                          Buy 2 Get 1 Free - {p.type}
                        </span>
                      </div>
                      <span className="text-[10px] font-sans text-[#D4AF37] font-medium">-EGP {p.saving.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              )}
              {promoDealSaving > 0 && (
                <div className="flex justify-between items-center text-xs font-sans text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="line-through">EGP {subtotal.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm uppercase tracking-wider font-sans">Total</span>
                <span className="text-lg font-serif text-primary">EGP {total.toLocaleString()}</span>
              </div>
              <Link
                to="/checkout"
                onClick={() => setCartOpen(false)}
                className="btn-luxury block text-center w-full"
              >
                Proceed to Checkout
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}