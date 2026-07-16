import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  HiOutlineSquares2X2,
  HiOutlineCloudArrowUp,
  HiOutlineCreditCard,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineShoppingBag,
  HiOutlineShieldCheck,
  HiOutlineClock,
} from 'react-icons/hi2';
import './Sidebar.css';

const sellerNavItems = [
  { path: '/products', icon: HiOutlineSquares2X2, label: 'Các sản phẩm' },
  { path: '/upload', icon: HiOutlineCloudArrowUp, label: 'Tải lên sản phẩm' },
  { path: '/subscription', icon: HiOutlineCreditCard, label: 'Đăng ký' },
];

const managerNavItems = [
  { path: '/api/manager', icon: HiOutlineSquares2X2, label: 'Manager Dashboard', end: true },
  { path: '/api/manager/pending-product', icon: HiOutlineClock, label: 'Pending Products' },
];

const Sidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const isManager = location.pathname.startsWith('/api/manager');

  const navItems = isManager ? managerNavItems : sellerNavItems;

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        {isManager ? (
          <HiOutlineShieldCheck className="sidebar-logo-icon" />
        ) : (
          <HiOutlineShoppingBag className="sidebar-logo-icon" />
        )}
        <span className="sidebar-brand">
          {isManager ? 'System Manager' : 'Seller Dashboard'}
        </span>
      </div>

      <p className="sidebar-subtitle">
        {isManager ? 'Quản lý hệ thống' : 'Bảng điều khiển người bán'}
      </p>

      <div className="sidebar-divider" />

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map(({ path, icon: Icon, label, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon className="sidebar-link-icon" />
            <span className="sidebar-link-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <button
        className="sidebar-toggle"
        onClick={onToggle}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <HiOutlineChevronRight className="sidebar-toggle-icon" />
        ) : (
          <HiOutlineChevronLeft className="sidebar-toggle-icon" />
        )}
      </button>
    </aside>
  );
};

export default Sidebar;
