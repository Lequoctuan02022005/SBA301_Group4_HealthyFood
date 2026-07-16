import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineArrowRightOnRectangle, HiOutlineShoppingBag, HiOutlineSparkles, HiOutlineTag } from 'react-icons/hi2';
import './CustomerHome.css';

const CustomerHome = () => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const fullName = user?.fullName || user?.email || 'Khách hàng';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const categories = [
    { name: 'Organic Foods', emoji: '🥦', desc: 'Thực phẩm hữu cơ tự nhiên' },
    { name: 'Protein & Supplements', emoji: '💪', desc: 'Đạm & Thực phẩm bổ sung' },
    { name: 'Fresh Fruits', emoji: '🍎', desc: 'Trái cây tươi ngon mỗi ngày' },
    { name: 'Healthy Snacks', emoji: '🥜', desc: 'Đồ ăn vặt dinh dưỡng' }
  ];

  return (
    <div className="customer-home-container">
      {/* Background glow effects */}
      <div className="glow-sphere glow-1"></div>
      <div className="glow-sphere glow-2"></div>

      {/* Header */}
      <header className="customer-header">
        <div className="header-logo">
          <span className="logo-emoji">🍏</span>
          <span className="logo-text">Healthy Food</span>
        </div>
        <div className="header-user-actions">
          <span className="user-welcome">Chào, <strong className="text-violet">{fullName}</strong></span>
          <button className="logout-btn" onClick={handleLogout}>
            <HiOutlineArrowRightOnRectangle /> Đăng xuất
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="customer-main">
        <motion.div 
          className="welcome-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="welcome-badge">
            <HiOutlineSparkles className="badge-icon" /> Khách hàng
          </div>
          <h1>Chào mừng quay trở lại, {fullName}!</h1>
          <p>Hôm nay bạn muốn tìm kiếm thực phẩm lành mạnh nào cho bản thân?</p>
          <div className="welcome-search">
            <input type="text" placeholder="Tìm kiếm món ăn, thực phẩm bổ sung..." />
            <button className="search-btn">Tìm kiếm</button>
          </div>
        </motion.div>

        {/* Categories Section */}
        <section className="categories-section">
          <h2 className="section-title">
            <HiOutlineTag className="section-icon" /> Danh mục nổi bật
          </h2>
          <div className="categories-grid">
            {categories.map((cat, idx) => (
              <motion.div 
                key={idx} 
                className="category-card"
                whileHover={{ y: -5, scale: 1.03 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
              >
                <span className="cat-emoji">{cat.emoji}</span>
                <h3>{cat.name}</h3>
                <p>{cat.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Info Box */}
        <section className="info-section">
          <div className="info-box">
            <h3>💡 Gợi ý dành cho bạn</h3>
            <p>
              Trang web này hiện đang được hoàn thiện. Các chức năng đặt hàng, xem giỏ hàng và thanh toán dành cho Khách hàng sẽ sớm ra mắt!
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="customer-footer">
        <p>&copy; 2026 Healthy Food. Được xây dựng cho sức khoẻ của bạn.</p>
      </footer>
    </div>
  );
};

export default CustomerHome;
