import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/Layout';
import ProductList from './pages/ProductList';
import UploadProduct from './pages/UploadProduct';
import Subscription from './pages/Subscription';
import Login from './pages/Login';
import Register from './pages/Register';
import PaymentResult from './pages/PaymentResult';
import ForgotPassword from './pages/ForgotPassword';
import CustomerHome from './pages/CustomerHome';
import CustomerProductDetail from './pages/CustomerProductDetail';
import CustomerCart from './pages/CustomerCart';
import CustomerOrderList from './pages/CustomerOrderList';
import AdminLayout from "./pages/admin/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";
import AccountList from "./pages/admin/AccountList";
import AccountDetail from "./pages/admin/AccountDetail";
import CreateAccount from "./pages/admin/CreateAccount";
import ReportList from "./pages/admin/ReportList";
import ReportDetail from "./pages/admin/ReportDetail";
import ManagerDashboard from './pages/manager/ManagerDashboard.jsx';
import PendingProducts from './pages/manager/PendingProducts.jsx';
import ProductDetail from './pages/manager/ProductDetail.jsx';
import CategoryManagement from './pages/manager/CategoryManagement.jsx';
// import ManagerDashboard from './pages/ManagerDashboard';
// import PendingProducts from './pages/PendingProducts';
// import ProductDetail from './pages/ProductDetail';
import AIChatbox from './components/AIChatbox';


const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const location = useLocation();

  let user = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error("Failed to parse user data", e);
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    // Nếu không có quyền, tự chuyển hướng về trang phù hợp với role của họ
    if (user) {
      if (user.role === 'ADMIN') return <Navigate to="/admin/adminhome" replace />;
      if (user.role === 'CUSTOMER') return <Navigate to="/customer-home" replace />;
      if (user.role === 'MANAGER' || user.role === 'NUTRIENT') return <Navigate to="/api/manager" replace />;
      if (user.role === 'SELLER') {
        if (user.hasActiveSubscription) {
          return <Navigate to="/products" replace />;
        } else {
          return <Navigate to="/subscription" replace />;
        }
      }
      return <Navigate to="/products" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // Nếu là seller nhưng chưa mua gói dịch vụ hoạt động, bắt buộc chuyển sang /subscription
  if (user && user.role === 'SELLER' && !user.hasActiveSubscription && location.pathname !== '/subscription' && location.pathname !== '/payment-result') {
    return <Navigate to="/subscription" replace />;
  }

  return children;
};

const RootRedirect = () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  let user = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error("Failed to parse user data", e);
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'ADMIN') {
    return <Navigate to="/admin/adminhome" replace />;
  }

  if (user.role === 'CUSTOMER') {
    return <Navigate to="/customer-home" replace />;
  }

  if (user.role === 'MANAGER' || user.role === 'NUTRIENT') {
    return <Navigate to="/api/manager" replace />;
  }

  if (user.role === 'SELLER') {
    if (user.hasActiveSubscription) {
      return <Navigate to="/products" replace />;
    } else {
      return <Navigate to="/subscription" replace />;
    }
  }

  return <Navigate to="/products" replace />;
};

function App() {
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <Routes>
        {/* Root Redirector */}
        <Route path="/" element={<RootRedirect />} />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/payment-result" element={<PaymentResult />} />

        {/* Customer Route */}
        <Route 
          path="/customer-home" 
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <CustomerHome />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/customer/product/:id"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <CustomerProductDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/cart"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <CustomerCart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/orders"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <CustomerOrderList />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes with custom AdminLayout */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="adminhome" element={<AdminHome />} />
          <Route path="users" element={<AccountList />} />
          <Route path="users/create" element={<CreateAccount />} />
          <Route path="users/:id" element={<AccountDetail />} />
          <Route path="reports" element={<ReportList />} />
          <Route path="reports/:id" element={<ReportDetail />} />
        </Route>

        {/* Seller Routes */}
        <Route 
          element={
            <ProtectedRoute allowedRoles={['SELLER']}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="products" element={<ProductList />} />
          <Route path="products/edit/:id" element={<UploadProduct />} />
          <Route path="upload" element={<UploadProduct />} />
          <Route path="subscription" element={<Subscription />} />
        </Route>

        {/* Manager & Nutrient Routes */}
        <Route 
          element={
            <ProtectedRoute allowedRoles={['MANAGER', 'NUTRIENT']}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="api/manager" element={<ManagerDashboard />} />
          <Route path="api/manager/categories" element={<CategoryManagement />} />
          <Route path="api/manager/pending-product" element={<PendingProducts />} />
          <Route path="api/manager/pending-product/:id" element={<ProductDetail />} />
        </Route>
      </Routes>
      <AIChatbox />
    </Router>
  );
}

export default App;
