import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HiOutlineBell, HiOutlineMagnifyingGlass, HiOutlineArrowRightOnRectangle } from 'react-icons/hi2';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const fullName = user?.fullName || user?.email || 'User';
  const role = user?.role || 'CUSTOMER';

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/products':
        return 'Product Management';
      case '/upload':
        return 'Upload New Product';
      case '/subscription':
        return 'Your Subscription';
      case '/payment-result':
        return 'Payment Confirmation';
      default:
        return 'Dashboard';
    }
  };

  const pageTitle = getPageTitle();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">{pageTitle}</h1>
        <span className="header-breadcrumb">{role === 'SELLER' ? 'Seller Dashboard' : 'Customer Area'} / {pageTitle}</span>
      </div>

      <div className="header-right">
        <div className="header-search">
          <HiOutlineMagnifyingGlass className="header-search-icon" />
          <input
            type="text"
            className="header-search-input"
            placeholder="Search..."
          />
        </div>

        <button className="header-bell" aria-label="Notifications">
          <HiOutlineBell />
          <span className="header-bell-badge" />
        </button>

        <div className="avatar-container" style={{ position: 'relative' }}>
          <div 
            className="header-avatar"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            title={`Hi, ${fullName}`}
          >
            <span>{fullName.charAt(0).toUpperCase()}</span>
          </div>

          {dropdownOpen && (
            <div className="avatar-dropdown">
              <div className="dropdown-user-info">
                <strong>{fullName}</strong>
                <span>{role}</span>
              </div>
              <div className="dropdown-divider" />
              <button className="dropdown-logout-btn" onClick={handleLogout}>
                <HiOutlineArrowRightOnRectangle /> Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
