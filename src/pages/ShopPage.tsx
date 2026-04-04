import { useState, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { useSearchParams } from 'react-router-dom';
import { X, Loader2 } from 'lucide-react';

const scentFamilies = ['Woody', 'Floral', 'Citrus', 'Oriental', 'Fresh'];
const genders = ['Men', 'Women', 'Unisex'];
const priceRanges = [
  { label: 'Under EGP 250', min: 0, max: 250 },
  { label: 'EGP 250 - EGP 350', min: 250, max: 350 },
  { label: 'Over EGP 350', min: 350, max: 9999 },
];

export default function ShopPage() {
  const { data: products = [], isLoading } = useProducts();
  const [searchParams] = useSearchParams();
  const initialGender = searchParams.get('gender') || '';

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedGender, setSelectedGender] = useState<string>(initialGender);
  const [selectedScent, setSelectedScent] = useState<string>('');
  const [selectedPrice, setSelectedPrice] = useState<{ label: string; min: number; max: number } | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const brands = useMemo(() => [...new Set(products.map((p) => p.brand))], [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false;
      if (selectedGender && p.gender !== selectedGender) return false;
      if (selectedScent && p.scent_family !== selectedScent) return false;
      if (selectedPrice && (p.price < selectedPrice.min || p.price > selectedPrice.max)) return false;
      return true;
    });
  }, [products, selectedBrands, selectedGender, selectedScent, selectedPrice]);

  const hasFilters = selectedBrands.length > 0 || selectedGender || selectedScent || selectedPrice;

  const clearFilters = () => {
    setSelectedBrands([]);
    setSelectedGender('');
    setSelectedScent('');
    setSelectedPrice(null);
  };

  const toggleBrand = (b: string) => {
    setSelectedBrands((prev) => prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]);
  };

  const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-6">
      <h4 className="text-[10px] uppercase tracking-[0.2em] font-sans font-medium mb-3">{title}</h4>
      {children}
    </div>
  );

  const FiltersContent = () => (
    <>
      <FilterSection title="Gender">
        <div className="space-y-2">
          {genders.map((g) => (
            <button key={g} onClick={() => setSelectedGender(selectedGender === g ? '' : g)}
              className={`block text-xs font-sans transition-colors ${selectedGender === g ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}>
              {g}
            </button>
          ))}
        </div>
      </FilterSection>
      <FilterSection title="Brand">
        <div className="space-y-2">
          {brands.map((b) => (
            <button key={b} onClick={() => toggleBrand(b)}
              className={`block text-xs font-sans transition-colors ${selectedBrands.includes(b) ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}>
              {b}
            </button>
          ))}
        </div>
      </FilterSection>
      <FilterSection title="Scent Family">
        <div className="space-y-2">
          {scentFamilies.map((s) => (
            <button key={s} onClick={() => setSelectedScent(selectedScent === s ? '' : s)}
              className={`block text-xs font-sans transition-colors ${selectedScent === s ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}>
              {s}
            </button>
          ))}
        </div>
      </FilterSection>
      <FilterSection title="Price">
        <div className="space-y-2">
          {priceRanges.map((r) => (
            <button key={r.label} onClick={() => setSelectedPrice(selectedPrice?.min === r.min ? null : r)}
              className={`block text-xs font-sans transition-colors ${selectedPrice && selectedPrice.min === r.min ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}>
              {r.label}
            </button>
          ))}
        </div>
      </FilterSection>
    </>
  );

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

        <div className="md:hidden mb-6 flex gap-3">
          <button onClick={() => setFiltersOpen(!filtersOpen)} className="btn-outline-luxury text-xs py-2 px-4">
            {filtersOpen ? 'Hide Filters' : 'Show Filters'}
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-sans">
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>

        <div className="flex gap-12">
          <aside className={`${filtersOpen ? 'block' : 'hidden'} md:block w-full md:w-48 shrink-0`}>
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs uppercase tracking-[0.2em] font-sans font-medium">Filters</span>
              {hasFilters && (
                <button onClick={clearFilters} className="text-[10px] text-muted-foreground hover:text-foreground font-sans underline">
                  Clear All
                </button>
              )}
            </div>
            <FiltersContent />
          </aside>

          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground font-sans text-sm">No products match your filters.</p>
                <button onClick={clearFilters} className="mt-4 text-xs underline font-sans">Clear filters</button>
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
