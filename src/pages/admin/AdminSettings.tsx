import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Loader2 } from 'lucide-react';
import {
  useGovernorateShippingRules,
  useStoreSettings,
  useUpsertGovernorateShippingRules,
  useUpsertStoreSettings,
} from '@/hooks/useStoreSettings';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettings() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useStoreSettings();
  const { data: governorateRules, isLoading: isRulesLoading } = useGovernorateShippingRules();
  const upsertSettings = useUpsertStoreSettings();
  const upsertGovernorateRules = useUpsertGovernorateShippingRules();

  const [shippingIsFree, setShippingIsFree] = useState(false);
  const [shippingFee, setShippingFee] = useState('15');
  const [deliveryEta, setDeliveryEta] = useState('3-5 business days');
  const [promoBuy2Get1Enabled, setPromoBuy2Get1Enabled] = useState(true);
  const [bulkFee, setBulkFee] = useState('15');
  const [localRules, setLocalRules] = useState<
    Array<{ governorate: string; is_free: boolean; shipping_fee: number; arrival_eta: string }>
  >([]);

  useEffect(() => {
    if (!settings) return;
    setShippingIsFree(settings.shipping_is_free);
    setShippingFee(String(settings.shipping_fee ?? 0));
    setDeliveryEta(settings.delivery_eta ?? '3-5 business days');
    setPromoBuy2Get1Enabled(settings.promo_buy2get1_enabled ?? true);
    setBulkFee(String(settings.shipping_fee ?? 15));
  }, [settings]);

  useEffect(() => {
    if (!governorateRules) return;
    setLocalRules(
      governorateRules.map((r) => ({
        governorate: r.governorate,
        is_free: r.is_free,
        shipping_fee: Number(r.shipping_fee ?? 0),
        arrival_eta: r.arrival_eta ?? settings?.delivery_eta ?? '3-5 business days',
      }))
    );
  }, [governorateRules, settings?.delivery_eta]);

  const updateRule = (
    governorate: string,
    updates: Partial<{ is_free: boolean; shipping_fee: number; arrival_eta: string }>
  ) => {
    setLocalRules((prev) =>
      prev.map((rule) => (rule.governorate === governorate ? { ...rule, ...updates } : rule))
    );
  };

  const applyAll = (isFree: boolean) => {
    const parsedBulk = Number(bulkFee);
    if (!isFree && (!Number.isFinite(parsedBulk) || parsedBulk < 0)) {
      toast({
        title: 'Invalid bulk fee',
        description: 'Please enter a valid fee before applying to all governorates.',
        variant: 'destructive',
      });
      return;
    }

    setLocalRules((prev) =>
      prev.map((rule) => ({
        ...rule,
        is_free: isFree,
        shipping_fee: isFree ? 0 : parsedBulk,
        arrival_eta: rule.arrival_eta || deliveryEta,
      }))
    );
  };

  const handlePromoToggle = async () => {
    const nextValue = !promoBuy2Get1Enabled;
    const parsedFee = Number(shippingFee);

    setPromoBuy2Get1Enabled(nextValue);
    try {
      await upsertSettings.mutateAsync({
        shipping_is_free: shippingIsFree,
        shipping_fee: shippingIsFree
          ? 0
          : Number.isFinite(parsedFee) && parsedFee >= 0
            ? parsedFee
            : Number(settings?.shipping_fee ?? 15),
        delivery_eta: deliveryEta.trim() || settings?.delivery_eta || '3-5 business days',
        promo_buy2get1_enabled: nextValue,
      });

      toast({
        title: nextValue ? 'Offer activated' : 'Offer turned off',
        description: nextValue
          ? 'Buy 2 Get 1 banners and checkout discount are now active.'
          : 'Buy 2 Get 1 banners and checkout discount are now disabled.',
      });
    } catch (err) {
      setPromoBuy2Get1Enabled(!nextValue);
      toast({
        title: 'Offer update failed',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    const parsedFee = Number(shippingFee);
    if (!shippingIsFree && (!Number.isFinite(parsedFee) || parsedFee < 0)) {
      toast({
        title: 'Invalid shipping fee',
        description: 'Please enter a valid shipping fee.',
        variant: 'destructive',
      });
      return;
    }

    const invalidRule = localRules.find((rule) => !rule.is_free && (!Number.isFinite(rule.shipping_fee) || rule.shipping_fee < 0));
    if (invalidRule) {
      toast({
        title: 'Invalid governorate fee',
        description: `Please enter a valid fee for ${invalidRule.governorate}.`,
        variant: 'destructive',
      });
      return;
    }

    await Promise.all([
      upsertSettings.mutateAsync({
        shipping_is_free: shippingIsFree,
        shipping_fee: shippingIsFree ? 0 : parsedFee,
        delivery_eta: deliveryEta.trim() || '3-5 business days',
        promo_buy2get1_enabled: promoBuy2Get1Enabled,
      }),
      upsertGovernorateRules.mutateAsync(
        localRules.map((rule) => ({
          governorate: rule.governorate,
          is_free: rule.is_free,
          shipping_fee: rule.is_free ? 0 : rule.shipping_fee,
          arrival_eta: rule.arrival_eta?.trim() || deliveryEta.trim() || '3-5 business days',
        }))
      ),
    ]);

    toast({
      title: 'Settings saved',
      description: 'Shipping rules and delivery settings updated successfully.',
    });
  };

  return (
    <AdminLayout>
      <h1 className="font-serif text-2xl mb-8">Settings</h1>
      <div className="bg-background border border-border p-6">
        <h2 className="font-serif text-lg mb-6">Store Settings</h2>
        {isLoading || isRulesLoading ? (
          <div className="py-10 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-4">
              <label className="text-[10px] uppercase tracking-[0.2em] font-sans font-medium block mb-3">Buy 2 Get 1 Free Offer</label>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm font-sans font-medium">Master Box + Tester promo</p>
                  <p className="text-xs text-muted-foreground font-sans mt-1">
                    Applies separately per type. For every 3 of the same type, the lowest-priced one is free.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handlePromoToggle}
                  disabled={upsertSettings.isPending}
                  className={`px-5 py-2 text-xs font-sans uppercase tracking-[0.15em] border transition-colors ${
                    promoBuy2Get1Enabled
                      ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {upsertSettings.isPending ? 'Saving...' : promoBuy2Get1Enabled ? 'Offer Active' : 'Offer Off'}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] font-sans font-medium block mb-2">Default Shipping Mode</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShippingIsFree(true)}
                  className={`px-4 py-2 text-xs font-sans border ${shippingIsFree ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}
                >
                  Free Shipping
                </button>
                <button
                  type="button"
                  onClick={() => setShippingIsFree(false)}
                  className={`px-4 py-2 text-xs font-sans border ${!shippingIsFree ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}
                >
                  Paid Shipping
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] font-sans font-medium block mb-1.5">Shipping Fee (EGP)</label>
              <input
                type="number"
                min="0"
                value={shippingFee}
                disabled={shippingIsFree}
                onChange={(e) => setShippingFee(e.target.value)}
                className="w-full border border-border px-4 py-3 text-sm font-sans focus:outline-none focus:border-foreground transition-colors disabled:opacity-50"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] font-sans font-medium block mb-1.5">Estimated Arrival Text</label>
              <input
                value={deliveryEta}
                onChange={(e) => setDeliveryEta(e.target.value)}
                placeholder="e.g. 2-4 business days"
                className="w-full border border-border px-4 py-3 text-sm font-sans focus:outline-none focus:border-foreground transition-colors"
              />
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-sans font-medium mb-3">Governorate Shipping Rules</p>
              <div className="border border-border p-4 mb-4 space-y-3">
                <p className="text-xs text-muted-foreground font-sans">
                  Configure each governorate as free shipping or paid shipping with a custom fee.
                </p>
                <div className="flex flex-wrap items-end gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] font-sans font-medium block mb-1.5">Bulk Fee (EGP)</label>
                    <input
                      type="number"
                      min="0"
                      value={bulkFee}
                      onChange={(e) => setBulkFee(e.target.value)}
                      className="border border-border bg-secondary text-white px-3 py-2 text-xs font-sans focus:outline-none focus:border-foreground transition-colors"
                    />
                  </div>
                  <button type="button" onClick={() => applyAll(true)} className="btn-outline-luxury">Set All Free</button>
                  <button type="button" onClick={() => applyAll(false)} className="btn-outline-luxury">Set All Paid</button>
                </div>
              </div>

              <div className="max-h-[420px] overflow-auto border border-border">
                <div className="grid grid-cols-12 gap-2 px-3 py-2 border-b border-border text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-sans">
                  <span className="col-span-4">Governorate</span>
                  <span className="col-span-3">Mode</span>
                  <span className="col-span-2">Fee (EGP)</span>
                  <span className="col-span-3">Arrival ETA</span>
                </div>
                {localRules.map((rule) => (
                  <div key={rule.governorate} className="grid grid-cols-12 gap-2 px-3 py-2 border-b border-border items-center">
                    <span className="col-span-4 text-sm font-sans">{rule.governorate}</span>
                    <div className="col-span-3 flex gap-1">
                      <button
                        type="button"
                        onClick={() => updateRule(rule.governorate, { is_free: true, shipping_fee: 0 })}
                        className={`px-2 py-1 text-[10px] border ${rule.is_free ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}
                      >
                        Free
                      </button>
                      <button
                        type="button"
                        onClick={() => updateRule(rule.governorate, { is_free: false, shipping_fee: rule.shipping_fee || Number(shippingFee) || 15 })}
                        className={`px-2 py-1 text-[10px] border ${!rule.is_free ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}
                      >
                        Paid
                      </button>
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="0"
                        disabled={rule.is_free}
                        value={rule.is_free ? 0 : rule.shipping_fee}
                        onChange={(e) => updateRule(rule.governorate, { shipping_fee: Number(e.target.value) })}
                        className="w-full border border-border bg-secondary text-white px-2 py-1.5 text-xs font-sans focus:outline-none focus:border-foreground transition-colors disabled:opacity-50"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        value={rule.arrival_eta}
                        onChange={(e) => updateRule(rule.governorate, { arrival_eta: e.target.value })}
                        className="w-full border border-border bg-secondary text-white px-2 py-1.5 text-xs font-sans focus:outline-none focus:border-foreground transition-colors"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={upsertSettings.isPending || upsertGovernorateRules.isPending}
              className="btn-luxury mt-2 w-full"
            >
              {upsertSettings.isPending || upsertGovernorateRules.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
