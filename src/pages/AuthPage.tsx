import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Diamond, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const ADMIN_SERVICE_EMAIL = import.meta.env.VITE_ADMIN_SERVICE_EMAIL || 'super_admin@diamondscent.com';
  const ADMIN_SERVICE_PASSWORD = import.meta.env.VITE_ADMIN_SERVICE_PASSWORD || 'AdminPassword2026!';

  const resolveIdentifier = (value: string) => {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return '';
    return normalized.includes('@') ? normalized.split('@')[0] : normalized;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast.error('Please enter username/email and password');
      return;
    }
    
    setLoading(true);
    const username = resolveIdentifier(identifier);

    const { data: adminMatch, error: adminError } = await supabase.rpc('authenticate_admin', {
      p_identifier: username,
      p_password: password,
    });

    if (adminError || !adminMatch || adminMatch.length === 0) {
      toast.error('Invalid username or password');
      setLoading(false);
      return;
    }

    // Open a valid Supabase session for admin panel data access.
    const { error } = await supabase.auth.signInWithPassword({
      email: ADMIN_SERVICE_EMAIL,
      password: ADMIN_SERVICE_PASSWORD,
    });
    
    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success('Welcome back!');
      navigate('/staff-portal');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <Diamond className="h-6 w-6 mx-auto mb-4" />
            <h1 className="font-serif text-2xl">Admin Portal</h1>
            <p className="text-xs text-muted-foreground font-sans mt-2">
              Sign in to manage your store
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] font-sans font-medium block mb-1.5">Email or Username</label>
              <input 
                type="text" 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full border border-border px-4 py-3 text-sm font-sans focus:outline-none focus:border-foreground transition-colors bg-background" 
                placeholder="Enter your username or email" 
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] font-sans font-medium block mb-1.5">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-border px-4 py-3 text-sm font-sans focus:outline-none focus:border-foreground transition-colors bg-background" 
                placeholder="••••••••" 
                disabled={loading}
              />
            </div>
            
            <button type="submit" className="btn-luxury w-full mt-2" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Secure Sign In'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
