import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineArrowRightOnRectangle,
  HiOutlineShoppingCart,
  HiOutlineClipboardDocumentList,
} from 'react-icons/hi2';

import './CustomerHeader.css';

const CustomerHeader = ({ fullName }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="customer-header">
      <div className="header-logo" onClick={() => navigate('/customer-home')}>
        <span className="logo-emoji">🍏</span>
        <span className="logo-text">Healthy Food</span>
      </div>

      <nav className="customer-nav">
        <button onClick={() => navigate('/customer-home')}>Trang chủ</button>
      </nav>

      <div className="header-user-actions">
        <span className="user-welcome">
          Chào, <strong className="text-violet">{fullName}</strong>
        </span>

        <button
          className="orders-btn"
          onClick={() => navigate('/customer/orders')}
          title="Đơn hàng"
        >
          <HiOutlineClipboardDocumentList />
          Đơn hàng
        </button>

        <button
          className="cart-btn"
          onClick={() => navigate('/customer/cart')}
          title="Giỏ hàng"
        >
          <HiOutlineShoppingCart />
          Giỏ hàng
        </button>

        <button className="logout-btn" onClick={handleLogout}>
          <HiOutlineArrowRightOnRectangle />
          Đăng xuất
        </button>
      </div>
    </header>
  );
};

export default CustomerHeader;