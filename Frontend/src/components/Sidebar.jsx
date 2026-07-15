import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HiOutlineSquares2X2,
  HiOutlineCloudArrowUp,
  HiOutlineCreditCard,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineShoppingBag,
} from 'react-icons/hi2';
import './Sidebar.css';

const navItems = [
  { path: '/products', icon: HiOutlineSquares2X2, label: 'Các sản phẩm' },
  { path: '/upload', icon: HiOutlineCloudArrowUp, label: 'Tải lên sản phẩm' },
  { path: '/subscription', icon: HiOutlineCreditCard, label: 'Đăng ký' },
];

const Sidebar = ({ isCollapsed, onToggle }) => {
  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <HiOutlineShoppingBag className="sidebar-logo-icon" />
        <span className="sidebar-brand">Seller Dashboard</span>
      </div>

      <p className="sidebar-subtitle">Bảng điều khiển người bán</p>

      <div className="sidebar-divider" />

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
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
