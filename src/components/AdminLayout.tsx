import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, Menu, Tag, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo.png';

const navItems = [
  { label: 'Dashboard', to: '/staff-portal', icon: LayoutDashboard },
  { label: 'Orders', to: '/staff-portal/orders', icon: ShoppingCart },
  { label: 'Products', to: '/staff-portal/products', icon: Package },
  { label: 'Discounts', to: '/staff-portal/discounts', icon: Tag },
  { label: 'Customers', to: '/staff-portal/customers', icon: Users },
  { label: 'Settings', to: '/staff-portal/settings', icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/staff-access');
  };

  return (
    <div className="min-h-screen flex bg-secondary/50">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-foreground/20 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 z-50 h-screen w-60 bg-background border-r border-border flex flex-col transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="h-16 flex items-center gap-2 px-6 border-b border-border">
          <img src={logo} alt="Diamond Perfume" className="h-8 w-auto" />
          <span className="font-serif text-sm tracking-[0.1em] uppercase">Admin</span>
        </div>
        <nav className="flex-1 py-4 px-3">
          {navItems.map((item) => {
            const active = location.pathname === item.to || (item.to !== '/staff-portal' && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 mb-0.5 text-xs font-sans tracking-wide rounded-sm transition-colors ${
                  active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border flex flex-col gap-2">
          <button onClick={handleSignOut} className="flex items-center gap-2 text-xs font-sans text-muted-foreground hover:text-primary transition-colors text-left py-2">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
          <Link to="/" className="text-xs font-sans text-muted-foreground hover:text-primary transition-colors py-2">
            ← Back to Store
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 bg-background border-b border-border flex items-center px-4 md:px-8">
          <button className="md:hidden p-2 mr-2" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-xs font-sans text-muted-foreground uppercase tracking-wider">Diamond Perfume · Admin Panel</span>
        </header>
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}