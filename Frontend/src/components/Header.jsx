import React from 'react';
import { useLocation } from 'react-router-dom';
import { HiOutlineBell, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import './Header.css';

const Header = () => {
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/products':
        return 'Product Management';
      case '/upload':
        return 'Upload New Product';
      case '/subscription':
        return 'Your Subscription';
      default:
        return 'Dashboard';
    }
  };

  const pageTitle = getPageTitle();

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">{pageTitle}</h1>
        <span className="header-breadcrumb">Seller Dashboard / {pageTitle}</span>
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

        <div className="header-avatar">
          <span>S</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
