import { useState, useMemo } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

type Gender = 'Men' | 'Women';
type ProductType = 'Master Box' | 'Tester';

export default function ShopPage() {
  const { data: products = [], isLoading } = useProducts();
  const [searchParams] = useSearchParams();
  const initialGender = (searchParams.get('gender') as Gender | null);

  const [selectedGender, setSelectedGender] = useState<Gender | null>(initialGender);
  const [selectedType, setSelectedType] = useState<ProductType | null>(null);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (selectedGender) {
        if (selectedGender === 'Men' && p.gender !== 'Men' && p.gender !== 'Unisex') return false;
        if (selectedGender === 'Women' && p.gender !== 'Women' && p.gender !== 'Unisex') return false;
      }
      if (selectedType) {
        const pt = (p as unknown as { product_type: string }).product_type ?? 'Master Box';
        if (pt !== selectedType) return false;
      }
      return true;
    });
  }, [products, selectedGender, selectedType]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 md:px-8 py-10">
        <div className="mb-10">
          <h1 className="section-heading mb-2">All Fragrances</h1>
          <p className="text-sm text-muted-foreground font-sans">{filtered.length} products</p>
        </div>

        <div className="flex gap-10">
          {/* Sidebar */}
          <aside className="w-44 shrink-0 hidden md:block">

            {/* Gender filter */}
            <div className="mb-8">
              <p className="text-[10px] uppercase tracking-[0.2em] font-sans font-medium mb-4">Gender</p>
              <div className="space-y-1">
                {(['Men', 'Women'] as Gender[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGender(selectedGender === g ? null : g)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-sans text-left transition-colors ${
                      selectedGender === g
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    <span>{g === 'Men' ? '♂' : '♀'}</span>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Product type filter */}
            <div className="mb-8">
              <p className="text-[10px] uppercase tracking-[0.2em] font-sans font-medium mb-4">Type</p>
              <div className="space-y-1">
                {(['Master Box', 'Tester'] as ProductType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(selectedType === t ? null : t)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-sans text-left transition-colors ${
                      selectedType === t
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    <span>{t === 'Master Box' ? '📦' : '🧪'}</span>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {(selectedGender || selectedType) && (
              <button
                onClick={() => { setSelectedGender(null); setSelectedType(null); }}
                className="text-[10px] text-muted-foreground hover:text-foreground font-sans underline underline-offset-2 transition-colors"
              >
                Clear filters
              </button>
            )}
          </aside>

          {/* Mobile filter pills */}
          <div className="md:hidden w-full mb-4 flex flex-wrap gap-2">
            {(['Men', 'Women'] as Gender[]).map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGender(selectedGender === g ? null : g)}
                className={`px-3 py-1.5 text-xs font-sans border transition-colors ${
                  selectedGender === g ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'
                }`}
              >
                {g}
              </button>
            ))}
            {(['Master Box', 'Tester'] as ProductType[]).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(selectedType === t ? null : t)}
                className={`px-3 py-1.5 text-xs font-sans border transition-colors ${
                  selectedType === t ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Product grid */}
          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground font-sans text-sm">No products match your selection.</p>
                <button
                  onClick={() => { setSelectedGender(null); setSelectedType(null); }}
                  className="mt-4 text-xs underline font-sans"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
