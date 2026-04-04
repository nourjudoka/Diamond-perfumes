import { useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { useProducts, useAddProduct, useDeleteProduct, useUpdateProduct } from '@/hooks/useProducts';
import { Plus, Trash2, Percent, Loader2, Pencil, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

interface SizeEntry { label: string; price: string; }

const EMPTY_FORM = {
  name: '', brand: '', stock: '', description: '',
  gender: 'Unisex', scentFamily: 'Woody', discount: '0', image: '',
};

const EMPTY_SIZE: SizeEntry = { label: '', price: '' };

function SizeBuilder({ sizes, onChange }: { sizes: SizeEntry[]; onChange: (s: SizeEntry[]) => void }) {
  const add = () => onChange([...sizes, { ...EMPTY_SIZE }]);
  const remove = (i: number) => onChange(sizes.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof SizeEntry, val: string) =>
    onChange(sizes.map((s, idx) => idx === i ? { ...s, [field]: val } : s));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] uppercase tracking-[0.2em] font-sans font-medium">Sizes & Prices</label>
        <button type="button" onClick={add}
          className="flex items-center gap-1 text-[10px] font-sans uppercase tracking-wider text-primary hover:text-primary/80 transition-colors">
          <Plus className="h-3 w-3" /> Add Size
        </button>
      </div>
      {sizes.length === 0 && (
        <p className="text-[11px] text-muted-foreground font-sans border border-dashed border-border px-4 py-3">
          No sizes added. Click "Add Size" to add at least one.
        </p>
      )}
      {sizes.map((s, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input value={s.label} onChange={e => update(i, 'label', e.target.value)}
            placeholder="Label (e.g. 50ml)"
            className="flex-1 border border-border px-3 py-2 text-sm font-sans focus:outline-none focus:border-foreground bg-background" />
          <input type="number" value={s.price} onChange={e => update(i, 'price', e.target.value)}
            placeholder="EGP Price"
            className="w-28 border border-border px-3 py-2 text-sm font-sans focus:outline-none focus:border-foreground bg-background" />
          <button type="button" onClick={() => remove(i)}
            className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function AdminProducts() {
  const { data: products = [], isLoading } = useProducts();
  const addProduct = useAddProduct();
  const deleteProduct = useDeleteProduct();
  const updateProduct = useUpdateProduct();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [sizes, setSizes] = useState<SizeEntry[]>([{ label: '100ml', price: '' }]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const openAdd = () => {
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setSizes([{ label: '100ml', price: '' }]);
    setImageFile(null);
    setOpen(true);
  };

  const openEdit = (p: ReturnType<typeof useProducts>['data'][number]) => {
    setEditId(p.id);
    setForm({
      name: p.name, brand: p.brand, stock: String(p.stock ?? ''),
      description: p.description ?? '', gender: p.gender ?? 'Unisex',
      scentFamily: p.scent_family ?? 'Woody', discount: String(p.discount_percent ?? 0), image: p.image ?? '',
    });
    const existingSizes = Array.isArray(p.sizes)
      ? (p.sizes as { label: string; price: number }[]).map(s => ({ label: s.label, price: String(s.price) }))
      : [{ label: '100ml', price: String(p.price ?? '') }];
    setSizes(existingSizes);
    setImageFile(null);
    setOpen(true);
  };

  const handleSave = async () => {
    if (sizes.length === 0) return;
    setIsUploading(true);
    let imageUrl = form.image;

    try {
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
        imageUrl = data.publicUrl;
      }

      const sizesJson = sizes.map(s => ({ label: s.label, price: Number(s.price) }));
      const basePrice = Math.min(...sizesJson.map(s => s.price));

      const payload = {
        name: form.name,
        brand: form.brand,
        price: basePrice,
        image: imageUrl || null,
        gender: form.gender,
        scent_family: form.scentFamily,
        sizes: sizesJson as unknown as string[],
        notes: { top: ['—'], heart: ['—'], base: ['—'] },
        description: form.description,
        stock: Number(form.stock),
        discount_percent: Number(form.discount),
      };

      if (editId) {
        updateProduct.mutate({ id: editId, updates: payload });
      } else {
        addProduct.mutate(payload);
      }

      setOpen(false);
      setForm({ ...EMPTY_FORM });
      setSizes([{ label: '100ml', price: '' }]);
      setImageFile(null);
      setEditId(null);
    } catch (err) {
      console.error('Error saving product:', err);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return <AdminLayout><div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-2xl">Products</h1>
        <button onClick={openAdd} className="btn-luxury flex items-center gap-2 text-xs">
          <Plus className="h-3.5 w-3.5" /> Add Product
        </button>
      </div>

      <div className="bg-background border border-border overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {['Product', 'Brand', 'Gender', 'Sizes', 'From Price', 'Discount', 'Stock', ''].map((h) => (
                <th key={h} className="text-left px-6 py-3 text-[10px] uppercase tracking-[0.2em] font-sans font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const pSizes = Array.isArray(p.sizes) ? p.sizes as { label: string; price: number }[] : [];
              const minPrice = pSizes.length > 0 ? Math.min(...pSizes.map(s => s.price)) : p.price;
              return (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-sans font-medium">{p.name}</td>
                  <td className="px-6 py-4 text-sm font-sans text-muted-foreground">{p.brand}</td>
                  <td className="px-6 py-4 text-xs font-sans">{p.gender}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {pSizes.map(s => (
                        <span key={s.label} className="text-[10px] font-sans bg-secondary px-1.5 py-0.5 border border-border">
                          {s.label} · EGP {s.price}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-sans">EGP {minPrice}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <input type="number" min="0" max="100" value={p.discount_percent || 0}
                        onChange={(e) => updateProduct.mutate({ id: p.id, updates: { discount_percent: Number(e.target.value) } })}
                        className="w-16 border border-border px-2 py-1 text-xs font-sans bg-background focus:outline-none focus:border-primary" />
                      <Percent className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-sans">{p.stock}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-secondary rounded-sm text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => deleteProduct.mutate(p.id)} className="p-1.5 hover:bg-secondary rounded-sm text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">{editId ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {[
              { label: 'Product Name', key: 'name' },
              { label: 'Brand', key: 'brand' },
              { label: 'Stock Quantity', key: 'stock', type: 'number' },
              { label: 'Discount %', key: 'discount', type: 'number' },
            ].map((field) => (
              <div key={field.key}>
                <label className="text-[10px] uppercase tracking-[0.2em] font-sans font-medium block mb-1.5">{field.label}</label>
                <input type={field.type || 'text'} value={(form as Record<string, string>)[field.key]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  className="w-full border border-border px-4 py-3 text-sm font-sans focus:outline-none focus:border-foreground transition-colors bg-background" />
              </div>
            ))}

            <SizeBuilder sizes={sizes} onChange={setSizes} />

            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] font-sans font-medium block mb-1.5">Product Image</label>
              <input type="file" accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full border border-border px-4 py-2 text-sm font-sans focus:outline-none focus:border-foreground transition-colors bg-background file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:uppercase file:tracking-wider file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer" />
              {form.image && !imageFile && (
                <p className="text-[10px] text-muted-foreground font-sans mt-1">Current image set. Upload a new file to replace it.</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] font-sans font-medium block mb-1.5">Gender</label>
                <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full border border-border px-4 py-3 text-sm font-sans focus:outline-none focus:border-foreground bg-background">
                  <option>Men</option><option>Women</option><option>Unisex</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] font-sans font-medium block mb-1.5">Scent Family</label>
                <select value={form.scentFamily} onChange={(e) => setForm({ ...form, scentFamily: e.target.value })}
                  className="w-full border border-border px-4 py-3 text-sm font-sans focus:outline-none focus:border-foreground bg-background">
                  <option>Woody</option><option>Floral</option><option>Citrus</option><option>Oriental</option><option>Fresh</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] font-sans font-medium block mb-1.5">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3} className="w-full border border-border px-4 py-3 text-sm font-sans focus:outline-none focus:border-foreground transition-colors resize-none bg-background" />
            </div>

            <button onClick={handleSave} disabled={addProduct.isPending || updateProduct.isPending || isUploading || sizes.length === 0}
              className="btn-luxury w-full">
              {addProduct.isPending || updateProduct.isPending || isUploading ? 'Saving...' : editId ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
