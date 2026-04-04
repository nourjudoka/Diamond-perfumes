import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import ShopPage from "./pages/ShopPage.tsx";
import ProductPage from "./pages/ProductPage.tsx";
import CheckoutPage from "./pages/CheckoutPage.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminOrders from "./pages/admin/AdminOrders.tsx";
import AdminProducts from "./pages/admin/AdminProducts.tsx";
import AdminCustomers from "./pages/admin/AdminCustomers.tsx";
import AdminSettings from "./pages/admin/AdminSettings.tsx";
import AdminDiscounts from "./pages/admin/AdminDiscounts.tsx";
import AuthPage from "./pages/AuthPage.tsx";
import { ProtectedRoute } from "./components/ProtectedRoute.tsx";
import { SupportChatButton } from "./components/SupportChatButton.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/staff-access" element={<AuthPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/staff-portal" element={<AdminDashboard />} />
            <Route path="/staff-portal/orders" element={<AdminOrders />} />
            <Route path="/staff-portal/products" element={<AdminProducts />} />
            <Route path="/staff-portal/customers" element={<AdminCustomers />} />
            <Route path="/staff-portal/settings" element={<AdminSettings />} />
            <Route path="/staff-portal/discounts" element={<AdminDiscounts />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <SupportChatButton />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;