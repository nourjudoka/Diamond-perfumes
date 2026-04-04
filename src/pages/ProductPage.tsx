import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useStore } from '@/lib/store';
import { useProduct } from '@/hooks/useProducts';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { motion } from 'framer-motion';
import { Loader2, Percent } from 'lucide-react';

interface SizeOption { label: string; price: number; }

export default function ProductPage() {
  const { id } = useParams();
  const addToCart = useStore((s) => s.addToCart);
  const { data: product, isLoading } = useProduct(id);
  const [selectedSize, setSelectedSize] = useState<SizeOption | null>(null);

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

  if (!product) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="section-heading mb-4">Product Not Found</h1>
          <Link to="/shop" className="text-sm underline font-sans">Back to shop</Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Parse sizes — support new jsonb format {label, price} and fallback to old string array
  const sizeOptions: SizeOption[] = Array.isArray(product.sizes)
    ? (product.sizes as unknown[]).map((s) => {
        if (typeof s === 'object' && s !== null && 'label' in s && 'price' in s) {
          return { label: (s as { label: string; price: number }).label, price: Number((s as { label: string; price: number }).price) };
        }
        return { label: String(s), price: product.price };
      })
    : [{ label: 'Standard', price: product.price }];

  const activeSize = selectedSize ?? sizeOptions[0];
  const notes = product.notes as { top: string[]; heart: string[]; base: string[] };
  const hasDiscount = product.discount_percent && product.discount_percent > 0;
  const displayPrice = hasDiscount
    ? activeSize.price * (1 - (product.discount_percent || 0) / 100)
    : activeSize.price;
  const originalPrice = activeSize.price;

  const handleAddToCart = () => {
    // Inject size-specific price into a modified product clone
    const productWithSizePrice = { ...product, price: activeSize.price };
    addToCart(productWithSizePrice, activeSize.label);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 md:px-8 py-10">
        <nav className="mb-8 text-xs font-sans text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/shop" className="hover:text-foreground">Shop</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
            className="aspect-[3/4] bg-secondary flex items-center justify-center relative overflow-hidden">
            {product.image ? (
              <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <span className="font-serif text-2xl text-muted-foreground/30 select-none">{product.brand}</span>
            )}
            {hasDiscount && (
              <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1.5 flex items-center gap-1">
                <Percent className="h-4 w-4" />
                <span className="text-xs font-sans font-bold">{product.discount_percent}% OFF</span>
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground font-sans mb-2">{product.brand}</p>
            <h1 className="font-serif text-3xl md:text-4xl mb-2">{product.name}</h1>

            {/* Price — updates when size changes */}
            {hasDiscount ? (
              <div className="flex items-center gap-3 mb-8">
                <p className="text-xl font-sans text-primary">EGP {displayPrice.toFixed(0)}</p>
                <p className="text-lg font-sans text-muted-foreground line-through">EGP {originalPrice}</p>
              </div>
            ) : (
              <p className="text-xl font-sans mb-8">EGP {displayPrice.toFixed(0)}</p>
            )}

            {/* Size Selector — always shown, even with a single size */}
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.2em] font-sans font-medium mb-3">Size</p>
              <div className="flex flex-wrap gap-3">
                {sizeOptions.map((s) => (
                  <button key={s.label} onClick={() => setSelectedSize(s)}
                    className={`px-5 py-2.5 text-xs font-sans border transition-all duration-200 flex flex-col items-center gap-0.5 ${
                      activeSize.label === s.label
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-foreground'
                    }`}>
                    <span>{s.label}</span>
                    <span className={`text-[10px] ${activeSize.label === s.label ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      EGP {hasDiscount ? (s.price * (1 - (product.discount_percent || 0) / 100)).toFixed(0) : s.price}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {product.stock < 10 && product.stock > 0 && (
              <p className="text-xs text-primary font-sans mb-4">Only {product.stock} left in stock</p>
            )}

            <button onClick={handleAddToCart} className="btn-luxury w-full mb-8"
              disabled={product.stock === 0}>
              {product.stock === 0 ? 'Out of Stock' : 'Add to Bag'}
            </button>

            <Accordion type="multiple" className="w-full">
              <AccordionItem value="notes">
                <AccordionTrigger className="text-xs uppercase tracking-[0.2em] font-sans font-medium">Fragrance Notes</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm font-sans text-muted-foreground">
                    <div><span className="text-foreground font-medium">Top:</span> {notes.top?.join(', ') || '—'}</div>
                    <div><span className="text-foreground font-medium">Heart:</span> {notes.heart?.join(', ') || '—'}</div>
                    <div><span className="text-foreground font-medium">Base:</span> {notes.base?.join(', ') || '—'}</div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="description">
                <AccordionTrigger className="text-xs uppercase tracking-[0.2em] font-sans font-medium">Description</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm font-sans text-muted-foreground leading-relaxed">{product.description}</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
