import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useStore } from '@/lib/store';
import { useCreateOrder } from '@/hooks/useOrders';
import { useValidateDiscount } from '@/hooks/useDiscounts';
import { useGovernorateShippingRules, useStoreSettings } from '@/hooks/useStoreSettings';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Check, Smartphone, Wallet, Banknote, Copy, CheckCheck, Minus, Plus, X, ShoppingBag, Tag, Loader2 } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import { EGYPT_GOVERNORATES } from '@/constants/egyptGovernorates';

type PaymentMethod = Database['public']['Enums']['payment_method'];

const steps = ['Cart', 'Shipping', 'Payment', 'Confirm'];

const paymentMethods: { id: PaymentMethod; label: string; icon: typeof Smartphone; description: string; details?: string }[] = [
  { id: 'InstaPay', label: 'InstaPay', icon: Smartphone, description: 'Transfer via InstaPay to our account', details: 'kkareemramadann@instapay' },
  { id: 'Vodafone Cash', label: 'Orange Cash', icon: Wallet, description: 'Send to our Orange Cash wallet', details: '01286500085' },
  { id: 'Cash on Delivery', label: 'Cash on Delivery', icon: Banknote, description: 'Pay when you receive your order' },
];

function CartStep({ onNext }: { onNext: () => void }) {
  const { cart, removeFromCart, updateQuantity } = useStore();

  if (cart.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground font-sans text-sm mb-6">Your bag is empty</p>
        <Link to="/shop" className="btn-luxury inline-block">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-serif text-xl mb-6">Your Bag</h2>
      <div className="space-y-4">
        {cart.map((item) => {
          const effectivePrice = item.product.discount_percent && item.product.discount_percent > 0
            ? item.product.price * (1 - item.product.discount_percent / 100)
            : item.product.price;
          return (
            <div key={`${item.product.id}-${item.size}`} className="flex gap-4 py-4 border-b border-border">
              <div className="w-20 h-24 bg-secondary flex items-center justify-center shrink-0">
                <span className="text-xs text-muted-foreground font-sans">{item.product.brand}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-sans">{item.product.brand}</p>
                    <p className="text-sm font-serif mt-0.5">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-sans">{item.size}</p>
                    {item.product.discount_percent && item.product.discount_percent > 0 && (
                      <p className="text-[10px] text-primary font-sans mt-0.5">{item.product.discount_percent}% off applied</p>
                    )}
                  </div>
                  <button onClick={() => removeFromCart(item.product.id, item.size)} className="p-1 hover:text-destructive transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-border">
                    <button onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)} className="p-1.5 hover:bg-secondary"><Minus className="h-3 w-3" /></button>
                    <span className="px-3 text-xs font-sans">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)} className="p-1.5 hover:bg-secondary"><Plus className="h-3 w-3" /></button>
                  </div>
                  <span className="text-sm font-sans font-medium">EGP {(effectivePrice * item.quantity).toFixed(0)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <button onClick={onNext} className="btn-luxury mt-8 w-full">Continue to Shipping</button>
    </div>
  );
}

function ShippingStep({ shipping, shippingErrors, setShipping, onNext, onBack }: {
  shipping: Record<string, string>;
  shippingErrors: Record<string, string>;
  setShipping: (s: Record<string, string>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="font-serif text-xl mb-4">Shipping Details</h2>
      {[
        { label: 'Full Name', key: 'name' },
        { label: 'Email', key: 'email' },
        { label: 'Phone', key: 'phone' },
        { label: 'Address', key: 'address' },
        { label: 'City', key: 'city' },
      ].map((field) => (
        <div key={field.key}>
          <label className="text-[10px] uppercase tracking-[0.2em] font-sans font-medium block mb-1.5">{field.label}</label>
          <input value={shipping[field.key]} onChange={(e) => setShipping({ ...shipping, [field.key]: e.target.value })}
            className="w-full border border-border bg-background px-4 py-3 text-sm font-sans focus:outline-none focus:border-primary transition-colors" />
          {shippingErrors[field.key] && <p className="text-[10px] text-destructive mt-1 font-sans">{shippingErrors[field.key]}</p>}
        </div>
      ))}
      <div>
        <label className="text-[10px] uppercase tracking-[0.2em] font-sans font-medium block mb-1.5">Governorate (Egypt)</label>
        <select
          value={shipping.governorate}
          onChange={(e) => setShipping({ ...shipping, governorate: e.target.value })}
          className="w-full border border-border bg-background px-4 py-3 text-sm font-sans focus:outline-none focus:border-primary transition-colors"
        >
          <option value="">Select Governorate</option>
          {EGYPT_GOVERNORATES.map((gov) => (
            <option key={gov} value={gov}>{gov}</option>
          ))}
        </select>
        {shippingErrors.governorate && <p className="text-[10px] text-destructive mt-1 font-sans">{shippingErrors.governorate}</p>}
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={onBack} className="btn-outline-luxury">Back</button>
        <button onClick={onNext} className="btn-luxury flex-1">Continue to Payment</button>
      </div>
    </div>
  );
}

function PaymentStep({ selectedPayment, setSelectedPayment, copied, handleCopy, deliveryEta, onNext, onBack }: {
  selectedPayment: PaymentMethod; setSelectedPayment: (p: PaymentMethod) => void;
  copied: boolean; handleCopy: (t: string) => void; deliveryEta: string; onNext: () => void; onBack: () => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="font-serif text-xl mb-4">Payment Method</h2>
      <div className="space-y-3">
        {paymentMethods.map((pm) => (
          <button key={pm.id} onClick={() => setSelectedPayment(pm.id)}
            className={`w-full flex items-start gap-4 p-4 border text-left transition-all ${
              selectedPayment === pm.id ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
            }`}>
            <div className={`w-10 h-10 flex items-center justify-center shrink-0 ${
              selectedPayment === pm.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
            }`}>
              <pm.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-sans font-medium">{pm.label}</p>
              <p className="text-xs text-muted-foreground font-sans mt-0.5">{pm.description}</p>
              {pm.details && selectedPayment === pm.id && (
                <div className="mt-3 bg-background border border-border p-3 flex items-center justify-between">
                  <span className="text-xs font-sans font-medium">{pm.details}</span>
                  <button onClick={(e) => { e.stopPropagation(); handleCopy(pm.details!); }} className="p-1 hover:bg-secondary transition-colors">
                    {copied ? <CheckCheck className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                  </button>
                </div>
              )}
            </div>
            <div className={`w-4 h-4 border-2 rounded-full mt-0.5 shrink-0 flex items-center justify-center ${
              selectedPayment === pm.id ? 'border-primary' : 'border-muted-foreground/40'
            }`}>
              {selectedPayment === pm.id && <div className="w-2 h-2 rounded-full bg-primary" />}
            </div>
          </button>
        ))}
      </div>

      {selectedPayment !== 'Cash on Delivery' && (
        <div className="bg-secondary/50 border border-border p-4 mt-4">
          {selectedPayment === 'InstaPay' && (
            <div className="text-xs font-sans text-muted-foreground mb-3 space-y-1">
              <p>
                InstaPay link:{' '}
                <a
                  href="https://ipn.eg/S/kkareemramadann/instapay/9MAHNI"
                  target="_blank"
                  rel="noreferrer"
                  className="underline text-foreground"
                >
                  https://ipn.eg/S/kkareemramadann/instapay/9MAHNI
                </a>
              </p>
              <p>اضغط الرابط لارسال نقود الى kkareemramadann@instapay</p>
              <p>Powered by InstaPay</p>
            </div>
          )}
          <p className="text-xs font-sans text-muted-foreground">
            ⚠️ Required: send a screenshot of your payment to <strong>01286500085</strong>.
          </p>
          <p className="text-xs font-sans text-muted-foreground mt-2">
            Estimated arrival: <strong>{deliveryEta}</strong>.
          </p>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <button onClick={onBack} className="btn-outline-luxury">Back</button>
        <button onClick={onNext} className="btn-luxury flex-1">Review Order</button>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const { cart, clearCart } = useStore();
  const { toast } = useToast();
  const createOrder = useCreateOrder();
  const validateDiscount = useValidateDiscount();
  const { data: storeSettings } = useStoreSettings();
  const { data: governorateRules } = useGovernorateShippingRules();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('InstaPay');
  const [copied, setCopied] = useState(false);
  const [shipping, setShipping] = useState<Record<string, string>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    governorate: '',
  });
  const [shippingErrors, setShippingErrors] = useState<Record<string, string>>({});
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent: number; amount: number } | null>(null);
  const [discountError, setDiscountError] = useState('');

  const subtotal = cart.reduce((s, i) => {
    const effectivePrice = i.product.discount_percent && i.product.discount_percent > 0
      ? i.product.price * (1 - i.product.discount_percent / 100) : i.product.price;
    return s + effectivePrice * i.quantity;
  }, 0);
  const selectedGovernorateRule = governorateRules?.find((rule) => rule.governorate === shipping.governorate);
  const shippingCost = selectedGovernorateRule
    ? selectedGovernorateRule.is_free
      ? 0
      : Number(selectedGovernorateRule.shipping_fee ?? 0)
    : storeSettings?.shipping_is_free
      ? 0
      : Number(storeSettings?.shipping_fee ?? 15);
  const selectedArrivalEta = selectedGovernorateRule?.arrival_eta || storeSettings?.delivery_eta || '3-5 business days';

  let discountSaving = 0;
  if (appliedDiscount) {
    if (appliedDiscount.percent > 0) discountSaving = subtotal * (appliedDiscount.percent / 100);
    if (appliedDiscount.amount > 0) discountSaving += appliedDiscount.amount;
  }
  const total = Math.max(0, subtotal + shippingCost - discountSaving);

  const validateShipping = () => {
    const requiredFields: Array<[string, string]> = [
      ['name', 'Full Name is required'],
      ['email', 'Email is required'],
      ['phone', 'Phone is required'],
      ['address', 'Address is required'],
      ['city', 'City is required'],
      ['governorate', 'Please choose a governorate in Egypt'],
    ];

    const nextErrors: Record<string, string> = {};
    for (const [key, message] of requiredFields) {
      if (!shipping[key]?.trim()) nextErrors[key] = message;
    }

    setShippingErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleShippingNext = () => {
    if (!validateShipping()) return;
    setStep(2);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyDiscount = async () => {
    setDiscountError('');
    try {
      const discount = await validateDiscount.mutateAsync(discountCode);
      if (discount.min_order_amount && subtotal < discount.min_order_amount) {
        setDiscountError(`Minimum order amount is EGP ${discount.min_order_amount}`);
        return;
      }
      setAppliedDiscount({
        code: discount.code || discountCode,
        percent: discount.discount_percent,
        amount: discount.discount_amount || 0,
      });
    } catch (err: unknown) {
      setDiscountError(err instanceof Error ? err.message : 'Invalid code');
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateShipping()) {
      setStep(1);
      return;
    }

    const num = `ORD-${String(Date.now()).slice(-6)}`;
    try {
      await createOrder.mutateAsync({
        order: {
          order_number: num,
          customer_name: shipping.name || 'Guest',
          email: shipping.email,
          phone: shipping.phone,
          address: `${shipping.address}, ${shipping.city}, ${shipping.governorate}`,
          payment_method: selectedPayment,
          subtotal,
          shipping_cost: shippingCost,
          discount_amount: discountSaving,
          total,
          discount_code: appliedDiscount?.code || null,
        },
        items: cart.map((item) => ({
          order_id: '', // will be set by hook
          product_id: item.product.id,
          product_name: item.product.name,
          product_brand: item.product.brand,
          size: item.size,
          quantity: item.quantity,
          unit_price: item.product.discount_percent && item.product.discount_percent > 0
            ? item.product.price * (1 - item.product.discount_percent / 100) : item.product.price,
          total_price: (item.product.discount_percent && item.product.discount_percent > 0
            ? item.product.price * (1 - item.product.discount_percent / 100) : item.product.price) * item.quantity,
        })),
      });
      setOrderNumber(num);
      clearCart();
      setDone(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to place order.';
      toast({
        title: 'Order failed',
        description: /out of stock/i.test(message)
          ? 'One or more items are out of stock. Please update your cart.'
          : message,
        variant: 'destructive',
      });
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8" />
            </div>
            <h1 className="font-serif text-3xl mb-3">Thank You</h1>
            <p className="text-sm text-muted-foreground font-sans mb-2">Your order <strong className="text-foreground">{orderNumber}</strong> has been placed successfully.</p>

            {selectedPayment !== 'Cash on Delivery' && (
              <div className="bg-secondary p-5 text-left mb-6 mt-4">
                <p className="text-[10px] uppercase tracking-[0.2em] font-sans font-medium text-muted-foreground mb-2">Payment Instructions</p>
                {selectedPayment === 'InstaPay' && (
                  <div className="text-sm font-sans space-y-1">
                    <p>Please send <strong>EGP {total.toFixed(0)}</strong> via InstaPay to <strong>kkareemramadann@instapay</strong>.</p>
                    <p>
                      Link:{' '}
                      <a
                        href="https://ipn.eg/S/kkareemramadann/instapay/9MAHNI"
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        https://ipn.eg/S/kkareemramadann/instapay/9MAHNI
                      </a>
                    </p>
                    <p>اضغط الرابط لارسال نقود الى kkareemramadann@instapay</p>
                    <p className="text-xs text-muted-foreground">Powered by InstaPay</p>
                  </div>
                )}
                {selectedPayment === 'Vodafone Cash' && (
                  <p className="text-sm font-sans">Please send <strong>EGP {total.toFixed(0)}</strong> to Orange Cash wallet <strong>01286500085</strong>.</p>
                )}
                <p className="text-xs text-muted-foreground font-sans mt-3">
                  Required: send a screenshot of your payment to <strong>01286500085</strong>.
                </p>
                <p className="text-xs text-muted-foreground font-sans mt-1">
                  Estimated arrival: <strong>{selectedArrivalEta}</strong>.
                </p>
              </div>
            )}

            <Link to="/shop" className="btn-luxury inline-block">Continue Shopping</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 md:px-8 py-10 flex-1">
        <h1 className="section-heading text-center mb-10">Checkout</h1>

        <div className="flex items-center justify-center gap-4 md:gap-8 mb-12">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <span className={`w-7 h-7 flex items-center justify-center text-xs font-sans border ${
                i <= step ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'
              }`}>{i + 1}</span>
              <span className={`text-xs uppercase tracking-[0.15em] font-sans hidden sm:inline ${i <= step ? 'text-foreground' : 'text-muted-foreground'}`}>{s}</span>
              {i < steps.length - 1 && <div className={`w-6 md:w-12 h-px ml-2 ${i < step ? 'bg-primary' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-5xl mx-auto">
          <div className="lg:col-span-2">
            {step === 0 && <CartStep onNext={() => setStep(1)} />}
            {step === 1 && (
              <ShippingStep
                shipping={shipping}
                shippingErrors={shippingErrors}
                setShipping={setShipping}
                onNext={handleShippingNext}
                onBack={() => setStep(0)}
              />
            )}
            {step === 2 && (
              <PaymentStep
                selectedPayment={selectedPayment}
                setSelectedPayment={setSelectedPayment}
                copied={copied}
                handleCopy={handleCopy}
                deliveryEta={selectedArrivalEta}
                onNext={() => setStep(3)}
                onBack={() => setStep(1)}
              />
            )}
            {step === 3 && (
              <div>
                <h2 className="font-serif text-xl mb-6">Order Review</h2>
                <div className="bg-secondary p-4 mb-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-sans font-medium text-muted-foreground mb-2">Shipping To</p>
                  <p className="text-sm font-sans font-medium">{shipping.name}</p>
                  <p className="text-xs text-muted-foreground font-sans">{shipping.address}, {shipping.city}</p>
                  <p className="text-xs text-muted-foreground font-sans">{shipping.governorate}</p>
                  <p className="text-xs text-muted-foreground font-sans">{shipping.phone}</p>
                </div>
                <div className="bg-secondary p-4 mb-6">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-sans font-medium text-muted-foreground mb-2">Payment Method</p>
                  <p className="text-sm font-sans font-medium">{selectedPayment}</p>
                </div>
                <div className="space-y-3 mb-6">
                  {cart.map((item) => {
                    const ep = item.product.discount_percent && item.product.discount_percent > 0
                      ? item.product.price * (1 - item.product.discount_percent / 100) : item.product.price;
                    return (
                      <div key={`${item.product.id}-${item.size}`} className="flex justify-between items-center py-3 border-b border-border">
                        <div>
                          <p className="text-sm font-serif">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground font-sans">{item.product.brand} · {item.size} · Qty {item.quantity}</p>
                        </div>
                        <span className="text-sm font-sans">EGP {(ep * item.quantity).toFixed(0)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="btn-outline-luxury">Back</button>
                  <button onClick={handlePlaceOrder} disabled={createOrder.isPending} className="btn-luxury flex-1">
                    {createOrder.isPending ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Place Order'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Summary sidebar */}
          <div className="bg-secondary p-6 h-fit">
            <h3 className="font-serif text-lg mb-6">Order Summary</h3>
            <div className="space-y-3 text-sm font-sans">
              {cart.map((item) => (
                <div key={`${item.product.id}-${item.size}`} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{item.product.name} × {item.quantity}</span>
                  <span>EGP {((item.product.discount_percent && item.product.discount_percent > 0
                    ? item.product.price * (1 - item.product.discount_percent / 100) : item.product.price) * item.quantity).toFixed(0)}</span>
                </div>
              ))}
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>EGP {subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : `EGP ${shippingCost}`}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Estimated arrival</span>
                <span>{selectedArrivalEta}</span>
              </div>

              {/* Discount code */}
              {!appliedDiscount ? (
                <div className="border-t border-border pt-3">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Discount Code</p>
                  <div className="flex gap-2">
                    <input value={discountCode} onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                      placeholder="Enter code" className="flex-1 border border-border bg-background px-3 py-2 text-xs font-sans focus:outline-none focus:border-primary" />
                    <button onClick={handleApplyDiscount} disabled={!discountCode || validateDiscount.isPending}
                      className="px-3 py-2 bg-primary text-primary-foreground text-xs font-sans hover:opacity-90 transition-opacity">
                      {validateDiscount.isPending ? '...' : 'Apply'}
                    </button>
                  </div>
                  {discountError && <p className="text-[10px] text-destructive mt-1 font-sans">{discountError}</p>}
                </div>
              ) : (
                <div className="border-t border-border pt-3 flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <Tag className="h-3 w-3 text-primary" />
                    <span className="text-xs text-primary font-medium">{appliedDiscount.code}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-primary">-EGP {discountSaving.toFixed(0)}</span>
                    <button onClick={() => setAppliedDiscount(null)} className="text-muted-foreground hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}

              <div className="border-t border-border pt-3 flex justify-between font-medium text-base">
                <span>Total</span>
                <span className="text-primary">EGP {total.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
