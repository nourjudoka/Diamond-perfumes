import { useMemo, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { useDiscounts, useAddDiscount, useDeleteDiscount, useUpdateDiscount } from '@/hooks/useDiscounts';
import { Plus, Trash2, Tag, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type DiscountMode = 'offers' | 'promocodes';

export default function AdminDiscounts() {
  const { data: discounts = [], isLoading } = useDiscounts();
  const addDiscount = useAddDiscount();
  const deleteDiscount = useDeleteDiscount();
  const updateDiscount = useUpdateDiscount();
  const [mode, setMode] = useState<DiscountMode>('offers');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', description: '', discount_percent: '0', discount_amount: '0', min_order_amount: '0', expires_at: '' });

  const filteredDiscounts = useMemo(() => {
    if (mode === 'offers') {
      return discounts.filter((d) => !d.code);
    }
    return discounts.filter((d) => !!d.code);
  }, [discounts, mode]);

  const generatePromoCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const next = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setForm((prev) => ({ ...prev, code: next }));
  };

  const handleAdd = () => {
    addDiscount.mutate({
      name: form.name,
      code: mode === 'promocodes' ? form.code.toUpperCase() || null : null,
      description: form.description,
      discount_percent: Number(form.discount_percent),
      discount_amount: Number(form.discount_amount),
      min_order_amount: Number(form.min_order_amount),
      expires_at: form.expires_at || null,
    });
    setOpen(false);
    setForm({ name: '', code: '', description: '', discount_percent: '0', discount_amount: '0', min_order_amount: '0', expires_at: '' });
  };

  if (isLoading) {
    return <AdminLayout><div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-2xl flex items-center gap-2"><Tag className="h-5 w-5 text-primary" /> Discounts & Offers</h1>
        <button onClick={() => setOpen(true)} className="btn-luxury flex items-center gap-2 text-xs">
          <Plus className="h-3.5 w-3.5" /> {mode === 'offers' ? 'Add Website Offer' : 'Add Promo Code'}
        </button>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setMode('offers')}
          className={`px-4 py-2 text-xs font-sans border ${mode === 'offers' ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}
        >
          Offers Displayed On Website
        </button>
        <button
          onClick={() => setMode('promocodes')}
          className={`px-4 py-2 text-xs font-sans border ${mode === 'promocodes' ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}
        >
          Promo Code Maker & Generator
        </button>
      </div>

      <div className="bg-background border border-border overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {['Name', 'Code', 'Discount', 'Min Order', 'Status', 'Expires', ''].map((h) => (
                <th key={h} className="text-left px-6 py-3 text-[10px] uppercase tracking-[0.2em] font-sans font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredDiscounts.map((d) => (
              <tr key={d.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-sans font-medium">{d.name}</p>
                  <p className="text-[11px] text-muted-foreground font-sans">{d.description}</p>
                </td>
                <td className="px-6 py-4">
                  {d.code ? <span className="text-xs font-sans bg-primary/10 text-primary px-2 py-1">{d.code}</span> : <span className="text-xs text-muted-foreground font-sans">—</span>}
                </td>
                <td className="px-6 py-4 text-sm font-sans">
                  {d.discount_percent > 0 && `${d.discount_percent}%`}
                  {d.discount_percent > 0 && d.discount_amount && d.discount_amount > 0 && ' + '}
                  {d.discount_amount && d.discount_amount > 0 && `EGP ${d.discount_amount}`}
                </td>
                <td className="px-6 py-4 text-sm font-sans text-muted-foreground">{d.min_order_amount ? `EGP ${d.min_order_amount}` : '—'}</td>
                <td className="px-6 py-4">
                  <button onClick={() => updateDiscount.mutate({ id: d.id, updates: { is_active: !d.is_active } })}
                    className={`text-[10px] font-sans px-2 py-1 border transition-colors ${
                      d.is_active ? 'bg-green-900/30 text-green-400 border-green-800' : 'bg-secondary text-muted-foreground border-border'
                    }`}>
                    {d.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 text-xs font-sans text-muted-foreground">
                  {d.expires_at ? new Date(d.expires_at).toLocaleDateString() : 'No expiry'}
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => deleteDiscount.mutate(d.id)} className="p-1.5 hover:bg-secondary rounded-sm text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredDiscounts.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-muted-foreground font-sans">
                  {mode === 'offers' ? 'No website offers yet' : 'No promo codes yet'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {mode === 'offers' ? 'Add Website Offer' : 'Create Promo Code'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {[
              { label: mode === 'offers' ? 'Offer Name' : 'Promo Name', key: 'name' },
              { label: 'Description', key: 'description' },
            ].map((field) => (
              <div key={field.key}>
                <label className="text-[10px] uppercase tracking-[0.2em] font-sans font-medium block mb-1.5">{field.label}</label>
                <input value={(form as Record<string, string>)[field.key]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  className="w-full border border-border px-4 py-3 text-sm font-sans focus:outline-none focus:border-foreground transition-colors bg-background" />
              </div>
            ))}
            {mode === 'promocodes' && (
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] font-sans font-medium block mb-1.5">Promo Code</label>
                <div className="flex gap-2">
                  <input
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    className="flex-1 border border-border px-4 py-3 text-sm font-sans focus:outline-none focus:border-foreground transition-colors bg-background"
                  />
                  <button type="button" onClick={generatePromoCode} className="btn-outline-luxury text-xs whitespace-nowrap">
                    Generate
                  </button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] font-sans font-medium block mb-1.5">Discount %</label>
                <input type="number" value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })}
                  className="w-full border border-border px-4 py-3 text-sm font-sans focus:outline-none focus:border-foreground bg-background" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] font-sans font-medium block mb-1.5">Flat $ Off</label>
                <input type="number" value={form.discount_amount} onChange={(e) => setForm({ ...form, discount_amount: e.target.value })}
                  className="w-full border border-border px-4 py-3 text-sm font-sans focus:outline-none focus:border-foreground bg-background" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] font-sans font-medium block mb-1.5">Min Order $</label>
                <input type="number" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })}
                  className="w-full border border-border px-4 py-3 text-sm font-sans focus:outline-none focus:border-foreground bg-background" />
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] font-sans font-medium block mb-1.5">Expires At (optional)</label>
              <input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                className="w-full border border-border px-4 py-3 text-sm font-sans focus:outline-none focus:border-foreground bg-background" />
            </div>
            <button onClick={handleAdd} disabled={addDiscount.isPending} className="btn-luxury w-full">
              {addDiscount.isPending ? 'Saving...' : mode === 'offers' ? 'Add Website Offer' : 'Create Promo Code'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
