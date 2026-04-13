import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={logo} alt="Diamond Perfume" className="h-8 w-auto" />
              <span className="font-serif text-sm tracking-[0.15em] uppercase">Diamond Perfume</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed font-sans">
              Curating the world's finest fragrances for the most discerning connoisseurs.
            </p>
          </div>
          {[
            { title: 'Shop', links: ['All Fragrances', 'Men', 'Women', 'Unisex'] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-xs uppercase tracking-[0.2em] font-sans font-medium mb-4 text-primary">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors font-sans">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 pt-8 border-t border-border text-center">
          <p className="text-xs text-muted-foreground font-sans">© 2026 Diamond Perfume. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}