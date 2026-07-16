import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/Layout';
import ProductList from './pages/ProductList';
import UploadProduct from './pages/UploadProduct';
import Subscription from './pages/Subscription';
import ManagerDashboard from './pages/ManagerDashboard';
import PendingProducts from './pages/PendingProducts';
import ProductDetail from './pages/ProductDetail';

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
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/products" replace />} />
          <Route path="products" element={<ProductList />} />
          <Route path="upload" element={<UploadProduct />} />
          <Route path="subscription" element={<Subscription />} />
          <Route path="api/manager" element={<ManagerDashboard />} />
          <Route path="api/manager/pending-product" element={<PendingProducts />} />
          <Route path="api/manager/pending-product/:id" element={<ProductDetail />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
