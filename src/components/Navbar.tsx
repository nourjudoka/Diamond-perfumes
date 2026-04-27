import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { CartDrawer } from './CartDrawer';
import logo from '@/assets/logo.png';
import brandLogo from '../../DIAMOND LOGO (1).png';
import { useProducts } from '@/hooks/useProducts';

const navLinks = [
  { label: 'Shop All', to: '/shop' },
  { label: 'Master Box', to: '/shop?type=Master%20Box' },
  { label: 'Tester Collection', to: '/shop?type=Tester' },
  { label: 'Best Sellers', to: '/shop?best_sellers=true' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { cart, setCartOpen } = useStore();
  const { data: products = [] } = useProducts();
  const navigate = useNavigate();
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const searchResults = normalizedSearch
    ? products
        .filter((product) =>
          [product.name, product.brand, product.gender, product.product_type, product.scent_family]
            .some((value) => String(value ?? '').toLowerCase().includes(normalizedSearch))
        )
        .slice(0, 5)
    : [];

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchTerm('');
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchTerm.trim();
    if (!query) return;
    navigate(`/shop?q=${encodeURIComponent(query)}`);
    closeSearch();
    setMobileOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile menu toggle */}
            <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img
                src={brandLogo}
                alt="Diamond Perfume"
                onError={(e) => {
                  e.currentTarget.src = logo;
                }}
                className="h-10 md:h-12 w-auto"
              />
              <div className="hidden sm:flex flex-col">
                <span className="font-serif text-lg md:text-xl tracking-[0.1em] uppercase text-[#D4AF37]">
                  Diamond Perfume
                </span>
                <span className="font-serif text-[10px] tracking-[0.2em] uppercase text-[#D4AF37]">
                  More than perfume, it is you
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Icons */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSearchOpen((open) => !open)}
                  className="p-2 hover:text-primary transition-colors"
                  aria-label="Search products"
                >
                  <Search className="h-4 w-4" />
                </button>
                {searchOpen && (
                  <div className="absolute right-0 top-full mt-3 w-[min(88vw,360px)] border border-border bg-background shadow-2xl z-50">
                    <form onSubmit={handleSearchSubmit} className="flex items-center border-b border-border">
                      <Search className="ml-3 h-4 w-4 text-muted-foreground" />
                      <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                        placeholder="Search perfume, brand, type..."
                        className="flex-1 bg-transparent px-3 py-3 text-sm font-sans outline-none"
                      />
                      <button type="button" onClick={closeSearch} className="p-3 text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </form>
                    <div className="max-h-80 overflow-y-auto">
                      {normalizedSearch && searchResults.length === 0 && (
                        <p className="px-4 py-4 text-xs font-sans text-muted-foreground">No matching products.</p>
                      )}
                      {searchResults.map((product) => (
                        <Link
                          key={product.id}
                          to={`/product/${product.id}`}
                          onClick={closeSearch}
                          className="block border-b border-border px-4 py-3 last:border-b-0 hover:bg-secondary transition-colors"
                        >
                          <p className="text-sm font-serif">{product.name}</p>
                          <p className="mt-0.5 text-[10px] uppercase tracking-[0.15em] font-sans text-muted-foreground">
                            {product.brand} - {product.product_type}
                          </p>
                        </Link>
                      ))}
                    </div>
                    {normalizedSearch && (
                      <button
                        type="button"
                        onClick={() => {
                          navigate(`/shop?q=${encodeURIComponent(searchTerm.trim())}`);
                          closeSearch();
                        }}
                        className="w-full border-t border-border px-4 py-3 text-left text-xs uppercase tracking-[0.18em] font-sans text-primary hover:bg-secondary"
                      >
                        View all results for "{searchTerm.trim()}"
                      </button>
                    )}
                  </div>
                )}
              </div>
              <button onClick={() => setCartOpen(true)} className="p-2 hover:text-primary transition-colors relative">
                <ShoppingBag className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-sans font-medium w-4 h-4 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-background animate-fade-in">
            <nav className="flex flex-col py-4 px-6 gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm tracking-[0.15em] uppercase text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
      <CartDrawer />
    </>
  );
}