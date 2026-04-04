import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { User, MapPin, Package, LogOut } from 'lucide-react';

const tabs = [
  { id: 'orders', label: 'Order History', icon: Package },
  { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
  { id: 'account', label: 'Account Details', icon: User },
];

const mockOrders = [
  { id: 'ORD-1042', date: 'Mar 20, 2026', status: 'Delivered', total: 385 },
  { id: 'ORD-1039', date: 'Feb 14, 2026', status: 'Delivered', total: 590 },
  { id: 'ORD-1033', date: 'Jan 05, 2026', status: 'Shipped', total: 245 },
];

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('orders');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 md:px-8 py-10 flex-1">
        <h1 className="section-heading mb-10">My Account</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Sidebar */}
          <aside className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-[0.15em] font-sans transition-colors ${
                  activeTab === tab.id ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
            <button className="w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-[0.15em] font-sans text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </aside>

          {/* Content */}
          <div className="md:col-span-3">
            {activeTab === 'orders' && (
              <div>
                <h2 className="font-serif text-xl mb-6">Order History</h2>
                <div className="space-y-4">
                  {mockOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between py-4 border-b border-border">
                      <div>
                        <p className="text-sm font-sans font-medium">{order.id}</p>
                        <p className="text-xs text-muted-foreground font-sans">{order.date}</p>
                      </div>
                      <span className={`text-xs font-sans px-3 py-1 ${
                        order.status === 'Delivered' ? 'bg-secondary text-foreground' : 'bg-primary text-primary-foreground'
                      }`}>{order.status}</span>
                      <span className="text-sm font-sans">${order.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'addresses' && (
              <div>
                <h2 className="font-serif text-xl mb-6">Saved Addresses</h2>
                <div className="border border-border p-6">
                  <p className="text-sm font-sans font-medium">Home</p>
                  <p className="text-sm text-muted-foreground font-sans mt-1">123 Park Avenue, New York, NY 10001</p>
                </div>
              </div>
            )}
            {activeTab === 'account' && (
              <div>
                <h2 className="font-serif text-xl mb-6">Account Details</h2>
                <div className="space-y-4 max-w-md">
                  {['Full Name', 'Email', 'Phone'].map((field) => (
                    <div key={field}>
                      <label className="text-[10px] uppercase tracking-[0.2em] font-sans font-medium block mb-1.5">{field}</label>
                      <input className="w-full border border-border px-4 py-3 text-sm font-sans focus:outline-none focus:border-foreground transition-colors" />
                    </div>
                  ))}
                  <button className="btn-luxury mt-2">Save Changes</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
