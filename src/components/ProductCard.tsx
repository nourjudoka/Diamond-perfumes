import { Link } from 'react-router-dom';
import { useStore, DbProduct } from '@/lib/store';
import { ShoppingBag, Percent, Star } from 'lucide-react';

export function ProductCard({ product }: { product: DbProduct }) {
  const addToCart = useStore((s) => s.addToCart);
  const outOfStock = Number(product.stock) <= 0;

  return (
    <div className="product-card group flex flex-col h-full bg-card hover:shadow-2xl transition-all duration-500 ease-out sm:p-2">
      <Link to={`/product/${product.id}`} className="relative block h-full">
        <div className="aspect-[3/4] bg-secondary relative overflow-hidden mb-5 flex-shrink-0">
          {product.image ? (
            <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-serif text-lg text-muted-foreground/30 select-none tracking-widest uppercase">{product.brand}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500" />
          
          {product.is_best_seller && (
             <div className="absolute top-2 right-2 bg-primary/95 text-primary-foreground px-2 py-1 flex items-center gap-1 shadow-sm font-sans tracking-wide">
                <Star className="h-3 w-3 fill-current" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Best Seller</span>
             </div>
          )}

          {product.discount_percent && product.discount_percent > 0 && (
            <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 flex items-center gap-1">
              <Percent className="h-3 w-3" />
              <span className="text-[9px] font-sans font-bold tracking-wider">{product.discount_percent}% OFF</span>
            </div>
          )}
          {outOfStock && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-foreground/90 backdrop-blur-sm text-background px-4 py-2 w-3/4 text-center">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em]">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>
      <div className="space-y-1.5 flex flex-col flex-grow px-2 md:px-0">
        <p className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-muted-foreground font-sans">{product.brand}</p>
        <Link to={`/product/${product.id}`} className="flex-grow">
          <h3 className="font-serif text-sm md:text-base hover:text-primary transition-colors line-clamp-2 md:leading-relaxed">{product.name}</h3>
        </Link>
        <div className="flex items-center justify-between pt-3 pb-2 border-t border-border/50 mt-auto">
          <div className="flex flex-col">
            {product.discount_percent && product.discount_percent > 0 ? (
              <>
                <span className="text-xs md:text-sm font-sans text-muted-foreground line-through opacity-70">EGP {product.price}</span>
                <span className="text-sm md:text-base font-sans font-medium text-primary tracking-wide">EGP {(product.price * (1 - product.discount_percent / 100)).toFixed(0)}</span>
              </>
            ) : (
              <span className="text-sm md:text-base font-sans font-medium tracking-wide text-foreground">EGP {product.price}</span>
            )}
          </div>
          <button
            onClick={(e) => { e.preventDefault(); addToCart({ ...product, price: product.price }, product.sizes[0]); }}
            disabled={outOfStock}
            className="p-2.5 bg-secondary hover:bg-primary hover:text-primary-foreground rounded-full transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed text-foreground"
            aria-label="Add to cart"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}