import { Link } from 'react-router-dom';
import { useStore, DbProduct } from '@/lib/store';
import { ShoppingBag, Percent } from 'lucide-react';

export function ProductCard({ product }: { product: DbProduct }) {
  const addToCart = useStore((s) => s.addToCart);
  const outOfStock = Number(product.stock) <= 0;

  return (
    <div className="product-card group">
      <Link to={`/product/${product.id}`}>
        <div className="aspect-[3/4] bg-secondary relative overflow-hidden mb-4">
          {product.image ? (
            <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-serif text-lg text-muted-foreground/40 select-none">{product.brand}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500" />
          {product.discount_percent && product.discount_percent > 0 && (
            <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 flex items-center gap-1">
              <Percent className="h-3 w-3" />
              <span className="text-[10px] font-sans font-bold">{product.discount_percent}% OFF</span>
            </div>
          )}
          {outOfStock && (
            <div className="absolute top-2 right-2 bg-destructive text-foreground px-2 py-1">
              <span className="text-[10px] font-sans font-bold uppercase">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-sans">{product.brand}</p>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-serif text-sm hover:text-primary transition-colors">{product.name}</h3>
        </Link>
        <div className="flex items-center justify-between pt-1">
          {product.discount_percent && product.discount_percent > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-sans font-medium text-primary">EGP {(product.price * (1 - product.discount_percent / 100)).toFixed(0)}</span>
              <span className="text-xs font-sans text-muted-foreground line-through">EGP {product.price}</span>
            </div>
          ) : (
            <span className="text-sm font-sans font-medium">EGP {product.price}</span>
          )}
          <button
            onClick={() => addToCart(product, product.sizes[0])}
            disabled={outOfStock}
            className="p-2 hover:bg-primary/10 hover:text-primary rounded-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Add to cart"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}