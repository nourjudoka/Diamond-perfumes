import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { CartDrawer } from './CartDrawer';
import logo from '@/assets/logo.png';
import brandLogo from '../../DIAMOND LOGO (1).png';

const navLinks = [
  { label: 'Shop All', to: '/shop' },
  { label: 'Master Box', to: '/shop?type=Master%20Box' },
  { label: 'Tester Selection', to: '/shop?type=Tester' },
  { label: 'Best Sellers', to: '/shop?best_sellers=true' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cart, setCartOpen } = useStore();
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

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
                <span className="text-[10px] tracking-[0.15em] text-muted-foreground italic">
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
              <Link to="/shop" className="p-2 hover:text-primary transition-colors"><Search className="h-4 w-4" /></Link>
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