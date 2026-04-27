import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { useOrders, useUpdateOrder, useDeleteOrder } from '@/hooks/useOrders';
import { Trash2, AlertTriangle, Image, Eye, Upload, Search, Loader2, Download, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Tables } from '@/integrations/supabase/types';
import type { Database } from '@/integrations/supabase/types';
import * as XLSX from 'xlsx';

type Order = Tables<'orders'>;
type OrderStatus = Database['public']['Enums']['order_status'];

const statusOptions: OrderStatus[] = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

const statusColor = (status: string) => {
  switch (status) {
    case 'Delivered': return 'bg-green-900/30 text-green-400 border-green-800';
    case 'Shipped': return 'bg-blue-900/30 text-blue-400 border-blue-800';
    case 'Confirmed': return 'bg-emerald-900/30 text-emerald-400 border-emerald-800';
    case 'Cancelled': return 'bg-red-900/30 text-red-400 border-red-800';
    default: return 'bg-slate-800 text-slate-100 border-slate-700';
  }
};

const paymentColor = (method: string) => {
  switch (method) {
    case 'InstaPay': return 'bg-violet-900/30 text-violet-400 border-violet-800';
    case 'Vodafone Cash': return 'bg-red-900/30 text-red-400 border-red-800';
    default: return 'bg-secondary text-muted-foreground border-border';
  }
};

export default function AdminOrders() {
  const { data: orders = [], isLoading } = useOrders();
  const updateOrder = useUpdateOrder();
  const deleteOrder = useDeleteOrder();
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterPayment, setFilterPayment] = useState<string>('All');
  const [showFakeOnly, setShowFakeOnly] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (search && !o.customer_name.toLowerCase().includes(search.toLowerCase()) &&
        !o.order_number.toLowerCase().includes(search.toLowerCase()) &&
        !(o.email || '').toLowerCase().includes(search.toLowerCase())) return false;
      if (filterStatus !== 'All' && o.status !== filterStatus) return false;
      if (filterPayment !== 'All' && o.payment_method !== filterPayment) return false;
      if (showFakeOnly && !o.is_fake) return false;
      if (dateFrom && new Date(o.created_at) < new Date(dateFrom)) return false;
      if (dateTo && new Date(o.created_at) > new Date(dateTo + 'T23:59:59')) return false;
      if (minAmount && Number(o.total) < Number(minAmount)) return false;
      if (maxAmount && Number(o.total) > Number(maxAmount)) return false;
      return true;
    });
  }, [orders, search, filterStatus, filterPayment, showFakeOnly, dateFrom, dateTo, minAmount, maxAmount]);

  // Stats for filtered orders
  const stats = useMemo(() => {
    const real = filtered.filter(o => !o.is_fake);
    return {
      total: real.length,
      revenue: real.reduce((sum, o) => sum + Number(o.total), 0),
      avgOrder: real.length > 0 ? real.reduce((sum, o) => sum + Number(o.total), 0) / real.length : 0,
    };
  }, [filtered]);

  const handleScreenshot = (orderId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        updateOrder.mutate({ id: orderId, updates: { payment_screenshot: e.target.result as string } });
      }
    };
    reader.readAsDataURL(file);
  };

  const exportToExcel = () => {
    const rows = filtered.map(o => ({
      'Order Number': o.order_number,
      'Customer Name': o.customer_name,
      'Email': o.email,
      'Phone': o.phone,
      'Address': o.address,
      'Status': o.status,
      'Payment Method': o.payment_method,
      'Subtotal (EGP)': Number(o.subtotal),
      'Shipping (EGP)': Number(o.shipping_cost),
      'Discount (EGP)': Number(o.discount_amount),
      'Buy 2 Get 1 Discount (EGP)': Number(o.promo_buy2get1_discount_amount ?? 0),
      'Total (EGP)': Number(o.total),
      'Discount Code': o.discount_code || '',
      'Admin Notes': o.admin_notes || '',
      'Is Fake': o.is_fake ? 'Yes' : 'No',
      'Date': new Date(o.created_at).toLocaleString(),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');

    // Auto column widths
    const colWidths = Object.keys(rows[0] || {}).map(k => ({ wch: Math.max(k.length, 14) }));
    ws['!cols'] = colWidths;

    const date = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `diamond-orders-${date}.xlsx`);
  };

  const resetFilters = () => {
    setSearch(''); setFilterStatus('All'); setFilterPayment('All');
    setShowFakeOnly(false); setDateFrom(''); setDateTo('');
    setMinAmount(''); setMaxAmount('');
  };

  if (isLoading) {
    return <AdminLayout><div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="font-serif text-2xl">Orders</h1>
        <div className="flex items-center gap-2">
          <button onClick={exportToExcel} disabled={filtered.length === 0}
            className="flex items-center gap-2 text-xs font-sans px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-40">
            <Download className="h-3.5 w-3.5" /> Export Excel ({filtered.length})
          </button>
          <button onClick={() => setShowFakeOnly(!showFakeOnly)}
            className={`flex items-center gap-1.5 text-xs font-sans px-3 py-2 border transition-colors ${showFakeOnly ? 'bg-destructive/10 border-destructive/30 text-destructive' : 'border-border text-muted-foreground hover:text-foreground'}`}>
            <AlertTriangle className="h-3 w-3" /> Fake
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: TrendingUp, label: 'Filtered Orders', value: stats.total },
          { icon: DollarSign, label: 'Revenue (EGP)', value: `EGP ${stats.revenue.toLocaleString()}` },
          { icon: TrendingUp, label: 'Avg Order (EGP)', value: `EGP ${stats.avgOrder.toFixed(0)}` },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-background border border-border px-5 py-4">
            <p className="text-[10px] uppercase tracking-[0.2em] font-sans text-muted-foreground mb-1 flex items-center gap-1.5">
              <Icon className="h-3 w-3" />{label}
            </p>
            <p className="font-serif text-xl">{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-background border border-border p-4 mb-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-[0.2em] font-sans font-medium text-muted-foreground">Filters</p>
          <button onClick={resetFilters} className="text-[10px] font-sans text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">Reset all</button>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, order ID..."
              className="w-full pl-9 pr-4 py-2 border border-border text-sm font-sans focus:outline-none focus:border-foreground bg-background" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-border px-3 py-2 text-xs font-sans focus:outline-none focus:border-foreground bg-background">
            <option value="All">All Statuses</option>
            {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)}
            className="border border-border px-3 py-2 text-xs font-sans focus:outline-none focus:border-foreground bg-background">
            <option value="All">All Payments</option>
            <option>InstaPay</option><option>Vodafone Cash</option><option>Cash on Delivery</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="border border-border px-3 py-2 text-xs font-sans focus:outline-none focus:border-foreground bg-background" />
            <span className="text-xs text-muted-foreground font-sans">to</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="border border-border px-3 py-2 text-xs font-sans focus:outline-none focus:border-foreground bg-background" />
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <input type="number" value={minAmount} onChange={e => setMinAmount(e.target.value)} placeholder="Min EGP"
              className="w-24 border border-border px-3 py-2 text-xs font-sans focus:outline-none focus:border-foreground bg-background" />
            <span className="text-xs text-muted-foreground font-sans">–</span>
            <input type="number" value={maxAmount} onChange={e => setMaxAmount(e.target.value)} placeholder="Max EGP"
              className="w-24 border border-border px-3 py-2 text-xs font-sans focus:outline-none focus:border-foreground bg-background" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-background border border-border overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {['Order ID', 'Customer', 'Date', 'Payment', 'Status', 'Total', 'Proof', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.2em] font-sans font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr key={order.id} className={`border-b border-border last:border-0 hover:bg-secondary/50 transition-colors ${order.is_fake ? 'bg-destructive/5' : ''}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-sans font-medium">{order.order_number}</span>
                    {order.is_fake && <span className="text-[9px] font-sans uppercase tracking-wider bg-destructive/10 text-destructive px-1.5 py-0.5 border border-destructive/20">Fake</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm font-sans">{order.customer_name}</p>
                  <p className="text-[11px] text-muted-foreground font-sans">{order.phone}</p>
                </td>
                <td className="px-4 py-3 text-xs font-sans text-muted-foreground">
                  <p>{new Date(order.created_at).toLocaleDateString()}</p>
                  <p>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-sans px-2 py-1 border ${paymentColor(order.payment_method)}`}>{order.payment_method}</span>
                </td>
                <td className="px-4 py-3">
                  <select value={order.status}
                    onChange={(e) => updateOrder.mutate({ id: order.id, updates: { status: e.target.value as OrderStatus } })}
                    className={`text-[11px] font-sans px-2 py-1 border cursor-pointer focus:outline-none ${statusColor(order.status)}`}>
                    {statusOptions.map((s) => (
                      <option key={s} value={s} className="bg-slate-900 text-slate-100">
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-sm font-sans font-medium">EGP {Number(order.total).toLocaleString()}</td>
                <td className="px-4 py-3">
                  {order.payment_screenshot ? (
                    <button onClick={() => setViewOrder(order)} className="text-[10px] font-sans text-green-400 flex items-center gap-1 hover:underline">
                      <Image className="h-3 w-3" /> View
                    </button>
                  ) : (
                    <label className="text-[10px] font-sans text-muted-foreground flex items-center gap-1 cursor-pointer hover:text-foreground">
                      <Upload className="h-3 w-3" /> Upload
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        if (e.target.files?.[0]) handleScreenshot(order.id, e.target.files[0]);
                      }} />
                    </label>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setViewOrder(order)} className="p-1.5 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="View Details">
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => updateOrder.mutate({ id: order.id, updates: { is_fake: !order.is_fake, admin_notes: order.is_fake ? '' : 'Marked as fake order' } })}
                      className={`p-1.5 hover:bg-secondary transition-colors ${order.is_fake ? 'text-destructive' : 'text-muted-foreground hover:text-amber-600'}`}
                      title={order.is_fake ? 'Unmark Fake' : 'Mark as Fake'}>
                      <AlertTriangle className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setConfirmDelete(order.id)} className="p-1.5 hover:bg-secondary text-muted-foreground hover:text-destructive transition-colors" title="Remove">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground font-sans">No orders match your filters</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!viewOrder} onOpenChange={() => setViewOrder(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl flex items-center gap-3">
              Order {viewOrder?.order_number}
              {viewOrder?.is_fake && <span className="text-xs font-sans uppercase tracking-wider bg-destructive/10 text-destructive px-2 py-0.5 border border-destructive/20">Fake</span>}
            </DialogTitle>
          </DialogHeader>
          {viewOrder && (
            <div className="space-y-5 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-sans text-muted-foreground mb-1">Customer</p>
                  <p className="text-sm font-sans font-medium">{viewOrder.customer_name}</p>
                  <p className="text-xs text-muted-foreground font-sans">{viewOrder.email}</p>
                  <p className="text-xs text-muted-foreground font-sans">{viewOrder.phone}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-sans text-muted-foreground mb-1">Delivery</p>
                  <p className="text-sm font-sans">{viewOrder.address}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-sans text-muted-foreground mb-1">Total</p>
                  <p className="text-lg font-serif">EGP {Number(viewOrder.total).toLocaleString()}</p>
                  {viewOrder.discount_amount > 0 && (
                    <p className="text-[10px] text-primary font-sans">-EGP {viewOrder.discount_amount} discount</p>
                  )}
                  {(viewOrder.promo_buy2get1_discount_amount ?? 0) > 0 && (
                    <p className="text-[10px] text-[#D4AF37] font-sans">
                      -EGP {Number(viewOrder.promo_buy2get1_discount_amount).toLocaleString()} buy 2 get 1
                    </p>
                  )}
                  {viewOrder.discount_code && (
                    <p className="text-[10px] text-primary font-sans mt-1">Promo code used: {viewOrder.discount_code}</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-sans text-muted-foreground mb-1">Payment</p>
                  <span className={`text-[10px] font-sans px-2 py-1 border inline-block ${paymentColor(viewOrder.payment_method)}`}>{viewOrder.payment_method}</span>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-sans text-muted-foreground mb-1">Status</p>
                  <span className={`text-[10px] font-sans px-2 py-1 border inline-block ${statusColor(viewOrder.status)}`}>{viewOrder.status}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-sans text-muted-foreground mb-2">Order Date</p>
                <p className="text-sm font-sans">{new Date(viewOrder.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-sans text-muted-foreground mb-2">Payment Proof</p>
                {viewOrder.payment_screenshot ? (
                  <div className="border border-border p-2">
                    <img src={viewOrder.payment_screenshot} alt="Payment proof" className="w-full max-h-64 object-contain" />
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 border border-dashed border-border p-6 cursor-pointer hover:bg-secondary/50 transition-colors">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-sans text-muted-foreground">Upload payment screenshot</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      if (e.target.files?.[0]) handleScreenshot(viewOrder.id, e.target.files[0]);
                    }} />
                  </label>
                )}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-sans text-muted-foreground mb-2">Admin Notes</p>
                <textarea value={viewOrder.admin_notes || ''}
                  onChange={(e) => {
                    updateOrder.mutate({ id: viewOrder.id, updates: { admin_notes: e.target.value } });
                    setViewOrder({ ...viewOrder, admin_notes: e.target.value });
                  }}
                  rows={3} placeholder="Add internal notes..."
                  className="w-full border border-border px-3 py-2 text-sm font-sans focus:outline-none focus:border-foreground transition-colors resize-none bg-background" />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => {
                  updateOrder.mutate({ id: viewOrder.id, updates: { is_fake: !viewOrder.is_fake, admin_notes: viewOrder.is_fake ? '' : 'Marked as fake order' } });
                  setViewOrder({ ...viewOrder, is_fake: !viewOrder.is_fake });
                }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-sans uppercase tracking-[0.15em] border transition-colors ${viewOrder.is_fake ? 'border-destructive/30 text-destructive bg-destructive/5' : 'border-border text-muted-foreground hover:border-amber-300 hover:text-amber-600'}`}>
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {viewOrder.is_fake ? 'Unmark Fake' : 'Mark as Fake'}
                </button>
                <button onClick={() => { deleteOrder.mutate(viewOrder.id); setViewOrder(null); }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-sans uppercase tracking-[0.15em] border border-destructive/30 text-destructive hover:bg-destructive hover:text-foreground transition-colors">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle className="font-serif text-lg">Remove Order</DialogTitle></DialogHeader>
          <p className="text-sm font-sans text-muted-foreground mt-2">Are you sure you want to permanently remove this order?</p>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setConfirmDelete(null)} className="btn-outline-luxury flex-1 text-xs">Cancel</button>
            <button onClick={() => { if (confirmDelete) deleteOrder.mutate(confirmDelete); setConfirmDelete(null); }}
              className="flex-1 bg-destructive text-foreground px-4 py-2.5 text-xs font-sans uppercase tracking-[0.15em] hover:opacity-80 transition-opacity">
              Remove Order
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
