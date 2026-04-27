import { useState, useMemo, useEffect } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { PromoDealShowcase, PromoStrip } from '@/components/Buy2Get1Promo';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useStoreSettings } from '@/hooks/useStoreSettings';

type Gender = 'Men' | 'Women' | 'Unisex';
type ProductType = 'Master Box' | 'Tester';

export default function ShopPage() {
  const { data: products = [], isLoading } = useProducts();
  const { data: storeSettings } = useStoreSettings();
  const [searchParams] = useSearchParams();
  const [selectedGender, setSelectedGender] = useState<Gender | null>(searchParams.get('gender') as Gender | null);
  const [selectedType, setSelectedType] = useState<ProductType | null>(searchParams.get('type') as ProductType | null);
  const [showBestSellersOnly, setShowBestSellersOnly] = useState(searchParams.get('best_sellers') === 'true');

  useEffect(() => {
    setSelectedGender(searchParams.get('gender') as Gender | null);
    setSelectedType(searchParams.get('type') as ProductType | null);
    setShowBestSellersOnly(searchParams.get('best_sellers') === 'true');
  }, [searchParams]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (selectedGender) {
        if (selectedGender === 'Unisex' && p.gender !== 'Unisex') return false;
        if (selectedGender === 'Men' && p.gender !== 'Men' && p.gender !== 'Unisex') return false;
        if (selectedGender === 'Women' && p.gender !== 'Women' && p.gender !== 'Unisex') return false;
      }
      if (selectedType) {
        const pt = p.product_type ?? 'Master Box';
        if (pt !== selectedType) return false;
      }
      if (showBestSellersOnly && !p.is_best_seller) {
        return false;
      }
      return true;
    });
  }, [products, selectedGender, selectedType, showBestSellersOnly]);

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

  const isPromoEnabled = storeSettings?.promo_buy2get1_enabled ?? true;

  return (
    <div className="min-h-screen">
      <Navbar />

      {isPromoEnabled && (
        <PromoStrip />
      )}

      <div className="container mx-auto px-4 md:px-8 py-10">
        <div className="mb-10">
          <h1 className="section-heading mb-2">
            {selectedType === 'Tester' ? 'Tester Collection' : selectedType === 'Master Box' ? 'Master Boxes' : 'All Fragrances'}
          </h1>
          <p className="text-sm text-muted-foreground font-sans">{filtered.length} products</p>
        </div>

        {isPromoEnabled && <PromoDealShowcase activeType={selectedType} />}

        <div className="flex flex-col md:flex-row gap-8 md:gap-10">
          {/* Sidebar */}
          <aside className="w-44 shrink-0 hidden md:block">

            {/* Gender filter */}
            <div className="mb-8">
              <p className="text-[10px] uppercase tracking-[0.2em] font-sans font-medium mb-4">Gender</p>
              <div className="space-y-1">
                {(['Men', 'Women', 'Unisex'] as Gender[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGender(selectedGender === g ? null : g)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-sans text-left transition-colors ${
                      selectedGender === g
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    <span>{g === 'Men' ? '♂' : g === 'Women' ? '♀' : '⚥'}</span>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Product type filter */}
            <div className="mb-8">
              <p className="text-[10px] uppercase tracking-[0.2em] font-sans font-medium mb-4">Type</p>
              <div className="space-y-2">
                {(['Master Box', 'Tester'] as ProductType[]).map((t) => (
                  <label
                    key={t}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-sans cursor-pointer hover:bg-secondary transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedType === t}
                      onChange={() => setSelectedType(selectedType === t ? null : t)}
                      className="accent-primary w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className={selectedType === t ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                      {t}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Collection filter */}
            <div className="mb-8">
              <p className="text-[10px] uppercase tracking-[0.2em] font-sans font-medium mb-4">Collection</p>
              <div className="space-y-2">
                  <label className="flex items-center gap-2.5 px-3 py-2 text-xs font-sans cursor-pointer hover:bg-secondary transition-colors">
                    <input
                      type="checkbox"
                      checked={showBestSellersOnly}
                      onChange={(e) => setShowBestSellersOnly(e.target.checked)}
                      className="accent-primary w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className={showBestSellersOnly ? 'text-primary font-medium flex items-center gap-1.5' : 'text-muted-foreground flex items-center gap-1.5'}>
                      Best Sellers <span className="text-[10px]">★</span>
                    </span>
                  </label>
              </div>
            </div>

            {(selectedGender || selectedType || showBestSellersOnly) && (
              <button
                onClick={() => { setSelectedGender(null); setSelectedType(null); setShowBestSellersOnly(false); }}
                className="text-[10px] text-muted-foreground hover:text-foreground font-sans underline underline-offset-2 transition-colors"
              >
                Clear filters
              </button>
            )}
          </aside>

          {/* Mobile filter pills */}
          <div className="md:hidden w-full mb-4 flex flex-wrap gap-2">
            <button
                onClick={() => setShowBestSellersOnly(!showBestSellersOnly)}
                className={`px-3 py-1.5 text-xs font-sans border transition-colors flex items-center gap-1 ${
                  showBestSellersOnly ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'
                }`}
              >
                Best Sellers <span className="text-[9px]">★</span>
            </button>
            {(['Men', 'Women', 'Unisex'] as Gender[]).map((g) => (
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
          <div className="flex-1 min-w-0 w-full overflow-hidden">
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground font-sans text-sm">No products match your selection.</p>
                <button
                  onClick={() => { setSelectedGender(null); setSelectedType(null); setShowBestSellersOnly(false); }}
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
