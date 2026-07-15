import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/Layout';
import ProductList from './pages/ProductList';
import UploadProduct from './pages/UploadProduct';
import Subscription from './pages/Subscription';

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";
import AccountList from "./pages/admin/AccountList";
import AccountDetail from "./pages/admin/AccountDetail";
import CreateAccount from "./pages/admin/CreateAccount";
import ReportList from "./pages/admin/ReportList";
import ReportDetail from "./pages/admin/ReportDetail";

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
        </Route>
      </Routes>
    </Router>
  );
    return (
        <BrowserRouter>
            <Routes>
                {/* Redirect root to adminhome */}
                <Route path="/" element={<Navigate to="/admin/adminhome" />} />

                {/* Admin Routes with custom AdminLayout */}
                <Route path="/admin" element={<AdminLayout />}>
                    <Route path="adminhome" element={<AdminHome />} />
                    <Route path="users" element={<AccountList />} />
                    <Route path="users/create" element={<CreateAccount />} />
                    <Route path="users/:id" element={<AccountDetail />} />
                    <Route path="reports" element={<ReportList />} />
                    <Route path="reports/:id" element={<ReportDetail />} />
                </Route>

            </Routes>
        </BrowserRouter>
    );
}

export default App;
