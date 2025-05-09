import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { DeliveryProvider } from './context/DeliveryContext';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "./components/Layout";
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Pages
import Index from "./pages/Index";
import ProductPage from "./pages/ProductPage";
import CategoryPage from "./pages/CategoryPage";
import CategoriesPage from "./pages/CategoriesPage";
import PcBuilderPage from "./pages/PcBuilderPage";
import CartPage from "./pages/CartPage";
import NotFound from "./pages/NotFound";
import CheckoutPage from '@/pages/CheckoutPage';
import OrderConfirmationPage from '@/pages/OrderConfirmationPage';
import DeliveryPage from '@/pages/DeliveryPage';
import OrdersPage from '@/pages/OrdersPage';
import OrderHistoryPage from '@/pages/OrderHistoryPage';
import AdminDashboard from '@/pages/AdminDashboard';
import ProductsPage from '@/pages/ProductsPage';
import AboutUs from '@/pages/AboutUs';

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <DeliveryProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Router>
                <Routes>
                  <Route element={<Layout />}>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/product/:id" element={<ProductPage />} />
                    <Route path="/categories" element={<CategoriesPage />} />
                    <Route path="/category/:slug" element={<CategoryPage />} />
                    <Route path="/pc-builder" element={<PcBuilderPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/delivery" element={<DeliveryPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/order-history" element={<OrderHistoryPage />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/about" element={<AboutUs />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </Router>
            </TooltipProvider>
          </DeliveryProvider>
        </CartProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
};

export default App;
