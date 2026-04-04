import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Diamond, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
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
              <label className="text-[10px] uppercase tracking-[0.2em] font-sans font-medium block mb-1.5">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-border px-4 py-3 text-sm font-sans focus:outline-none focus:border-foreground transition-colors bg-background" 
                placeholder="your@email.com" 
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
