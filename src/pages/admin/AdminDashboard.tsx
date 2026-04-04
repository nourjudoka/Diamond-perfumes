import { AdminLayout } from '@/components/AdminLayout';
import { useProducts } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';
import { useDiscounts } from '@/hooks/useDiscounts';
import { DollarSign, ShoppingCart, Package, AlertTriangle, Smartphone, Wallet, Banknote, Tag, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: discounts = [] } = useDiscounts();

  if (ordersLoading || productsLoading) {
    return <AdminLayout><div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div></AdminLayout>;
  }

  const realOrders = orders.filter((o) => !o.is_fake);
  const fakeOrders = orders.filter((o) => o.is_fake);
  const totalSales = realOrders.reduce((s, o) => s + o.total, 0);
  const activeOrders = realOrders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  const deliveredOrders = realOrders.filter((o) => o.status === 'Delivered').length;

  const paymentBreakdown = [
    { method: 'InstaPay', icon: Smartphone, count: realOrders.filter((o) => o.payment_method === 'InstaPay').length, total: realOrders.filter((o) => o.payment_method === 'InstaPay').reduce((s, o) => s + o.total, 0), color: 'text-violet-600 bg-violet-50' },
    { method: 'Vodafone Cash', icon: Wallet, count: realOrders.filter((o) => o.payment_method === 'Vodafone Cash').length, total: realOrders.filter((o) => o.payment_method === 'Vodafone Cash').reduce((s, o) => s + o.total, 0), color: 'text-red-600 bg-red-50' },
    { method: 'COD', icon: Banknote, count: realOrders.filter((o) => o.payment_method === 'Cash on Delivery').length, total: realOrders.filter((o) => o.payment_method === 'Cash on Delivery').reduce((s, o) => s + o.total, 0), color: 'text-amber-600 bg-amber-50' },
  ];

  const screenshotCount = realOrders.filter((o) => o.payment_screenshot).length;

  const metrics = [
    { label: 'Total Revenue', value: `$${totalSales.toLocaleString()}`, icon: DollarSign, sub: `${deliveredOrders} delivered` },
    { label: 'Active Orders', value: activeOrders.toString(), icon: ShoppingCart, sub: `${orders.length} total` },
    { label: 'Products', value: products.length.toString(), icon: Package, sub: `${products.filter((p) => p.stock < 15).length} low stock` },
    { label: 'Fake Orders', value: fakeOrders.length.toString(), icon: AlertTriangle, sub: `$${fakeOrders.reduce((s, o) => s + o.total, 0).toLocaleString()} blocked`, alert: fakeOrders.length > 0 },
  ];

  const statusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-green-900/30 text-green-400 border-green-800';
      case 'Shipped': return 'bg-blue-900/30 text-blue-400 border-blue-800';
      case 'Confirmed': return 'bg-emerald-900/30 text-emerald-400 border-emerald-800';
      case 'Cancelled': return 'bg-red-900/30 text-red-400 border-red-800';
      default: return 'bg-amber-900/30 text-amber-400 border-amber-800';
    }
  };

  return (
    <AdminLayout>
      <h1 className="font-serif text-2xl mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((m) => (
          <div key={m.label} className={`bg-background border p-6 ${m.alert ? 'border-destructive/30' : 'border-border'}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-[0.2em] font-sans text-muted-foreground">{m.label}</span>
              <m.icon className={`h-4 w-4 ${m.alert ? 'text-destructive' : 'text-muted-foreground'}`} />
            </div>
            <span className="font-serif text-2xl">{m.value}</span>
            <p className="text-[11px] font-sans text-muted-foreground mt-1">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Active Discounts */}
      {discounts.length > 0 && (
        <div className="bg-background border border-border mb-8">
          <div className="p-6 border-b border-border">
            <h2 className="font-serif text-lg flex items-center gap-2"><Tag className="h-4 w-4 text-primary" /> Active Offers</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
            {discounts.filter(d => d.is_active).map((d) => (
              <div key={d.id} className="p-5 border-b sm:border-r border-border last:border-r-0 last:border-b-0">
                <p className="text-sm font-sans font-medium">{d.name}</p>
                <p className="text-xs text-muted-foreground font-sans mt-0.5">{d.description}</p>
                {d.code && <span className="inline-block mt-2 text-[10px] bg-primary/10 text-primary px-2 py-0.5 font-sans font-medium">{d.code}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Breakdown */}
      <div className="bg-background border border-border mb-8">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="font-serif text-lg">Payment Methods</h2>
          <span className="text-xs font-sans text-muted-foreground">{screenshotCount} with proof attached</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3">
          {paymentBreakdown.map((pm) => (
            <div key={pm.method} className="p-5 border-b sm:border-b-0 sm:border-r border-border last:border-r-0 last:border-b-0">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 flex items-center justify-center ${pm.color}`}>
                  <pm.icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-sans font-medium">{pm.method}</span>
              </div>
              <p className="font-serif text-xl">${pm.total.toLocaleString()}</p>
              <p className="text-[11px] font-sans text-muted-foreground mt-0.5">{pm.count} orders</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-background border border-border">
        <div className="p-6 border-b border-border"><h2 className="font-serif text-lg">Recent Orders</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Order', 'Customer', 'Date', 'Payment', 'Status', 'Total'].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-[10px] uppercase tracking-[0.2em] font-sans font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 8).map((order) => (
                <tr key={order.id} className={`border-b border-border last:border-0 hover:bg-secondary/50 transition-colors ${order.is_fake ? 'bg-destructive/5' : ''}`}>
                  <td className="px-6 py-4 text-sm font-sans font-medium">
                    <span className="flex items-center gap-2">
                      {order.order_number}
                      {order.is_fake && <AlertTriangle className="h-3 w-3 text-destructive" />}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-sans">{order.customer_name}</td>
                  <td className="px-6 py-4 text-sm font-sans text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4"><span className="text-[10px] font-sans text-muted-foreground">{order.payment_method}</span></td>
                  <td className="px-6 py-4"><span className={`text-[10px] font-sans px-2 py-1 border ${statusColor(order.status)}`}>{order.status}</span></td>
                  <td className="px-6 py-4 text-sm font-sans">${order.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
