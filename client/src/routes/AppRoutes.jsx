import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/HomePage';
import ProductsPage from '../pages/ProductsPage';
import ProductDetailsPage from '../pages/ProductDetailsPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import OrderReceiptPage from '../pages/OrderReceiptPage';
import OrderHistoryPage from '../pages/OrderHistoryPage';
import SellerApplyPage from '../pages/SellerApplyPage';
import SellerDashboardPage from '../pages/SellerDashboardPage';
import SellerProductsPage from '../pages/SellerProductsPage';
import SellerOrdersPage from '../pages/SellerOrdersPage';
import SellerWalletPage from '../pages/SellerWalletPage';
import AdminApplicationsPage from '../pages/AdminApplicationsPage';
import AdminWithdrawalsPage from '../pages/AdminWithdrawalsPage';
import AdminHistoryPage from '../pages/AdminHistoryPage';
import AdminReportsPage from '../pages/AdminReportsPage';
import AdminProductsPage from '../pages/AdminProductsPage';
import StorePage from '../pages/StorePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import NotFoundPage from '../pages/NotFoundPage';
import { useAuth } from '../context/AuthContext';

function BuyerOnly({ children }) {
  const { user } = useAuth();
  if (user?.role === 'seller' || user?.role === 'admin') {
    return <Navigate to={user?.role === 'admin' ? '/admin/applications' : '/seller/dashboard'} replace />;
  }
  return children;
}

function HomeRedirect() {
  const { user } = useAuth();
  if (user?.role === 'admin') {
    return <Navigate to="/admin/applications" replace />;
  }
  if (user?.role === 'seller') {
    return <Navigate to="/seller/dashboard" replace />;
  }
  return <HomePage />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailsPage />} />
        <Route path="/cart" element={<BuyerOnly><CartPage /></BuyerOnly>} />
        <Route path="/checkout" element={<BuyerOnly><CheckoutPage /></BuyerOnly>} />
        <Route path="/orders" element={<BuyerOnly><OrderHistoryPage /></BuyerOnly>} />
        <Route path="/orders/:id" element={<BuyerOnly><OrderReceiptPage /></BuyerOnly>} />
        <Route path="/seller/apply" element={<SellerApplyPage />} />
        <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
        <Route path="/seller/products" element={<SellerProductsPage />} />
        <Route path="/seller/orders" element={<SellerOrdersPage />} />
        <Route path="/seller/wallet" element={<SellerWalletPage />} />
        <Route path="/stores/:id" element={<StorePage />} />
        <Route path="/admin/applications" element={<AdminApplicationsPage />} />
        <Route path="/admin/withdrawals" element={<AdminWithdrawalsPage />} />
        <Route path="/admin/history" element={<AdminHistoryPage />} />
        <Route path="/admin/reports" element={<AdminReportsPage />} />
        <Route path="/admin/products" element={<AdminProductsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
