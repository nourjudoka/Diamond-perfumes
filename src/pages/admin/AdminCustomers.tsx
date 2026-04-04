import { AdminLayout } from '@/components/AdminLayout';
import { useOrders } from '@/hooks/useOrders';
import { Loader2 } from 'lucide-react';

export default function AdminCustomers() {
  const { data: orders = [], isLoading } = useOrders();

  // Derive customers from orders
  const customerMap = new Map<string, { name: string; email: string; phone: string; orders: number; spent: number; lastOrder: string }>();
  orders.filter(o => !o.is_fake).forEach((o) => {
    const key = o.email;
    const existing = customerMap.get(key);
    if (existing) {
      existing.orders++;
      existing.spent += o.total;
      if (o.created_at > existing.lastOrder) existing.lastOrder = o.created_at;
    } else {
      customerMap.set(key, { name: o.customer_name, email: o.email, phone: o.phone, orders: 1, spent: o.total, lastOrder: o.created_at });
    }
  });
  const customers = Array.from(customerMap.values()).sort((a, b) => b.spent - a.spent);

  if (isLoading) {
    return <AdminLayout><div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <h1 className="font-serif text-2xl mb-8">Customers</h1>
      <div className="bg-background border border-border overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {['Customer', 'Email', 'Phone', 'Orders', 'Total Spent', 'Last Order'].map((h) => (
                <th key={h} className="text-left px-6 py-3 text-[10px] uppercase tracking-[0.2em] font-sans font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.email} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                <td className="px-6 py-4 text-sm font-sans font-medium">{c.name}</td>
                <td className="px-6 py-4 text-sm font-sans text-muted-foreground">{c.email}</td>
                <td className="px-6 py-4 text-sm font-sans text-muted-foreground">{c.phone}</td>
                <td className="px-6 py-4 text-sm font-sans">{c.orders}</td>
                <td className="px-6 py-4 text-sm font-sans">${c.spent.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm font-sans text-muted-foreground">{new Date(c.lastOrder).toLocaleDateString()}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground font-sans">No customers yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
