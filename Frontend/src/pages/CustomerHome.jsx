import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineSparkles,
  HiOutlineShoppingBag,
  HiOutlineMagnifyingGlass,
  HiOutlineShoppingCart,
} from 'react-icons/hi2';
import './CustomerHome.css';
import CustomerHeader from '../components/CustomerHeader';
import CustomerFooter from '../components/CustomerFooter';

const CustomerHome = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const fullName = user?.fullName || user?.email || 'Khách hàng';

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      setFiltered(products);
    } else {
      setFiltered(
        products.filter(
          (p) =>
            p.name?.toLowerCase().includes(term) ||
            p.description?.toLowerCase().includes(term)
        )
      );
    }
  }, [search, products]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/products');
      if (!response.ok) throw new Error('Cannot load products');
      const data = await response.json();
      setProducts(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getProductImageUrl = (image) => {
    if (!image) return null;
    if (image.startsWith('http://') || image.startsWith('https://')) return image;
    return `http://localhost:8080/uploads/${image}`;
  };

  return (
    <div className="customer-home-container">
      <div className="glow-sphere glow-1"></div>
      <div className="glow-sphere glow-2"></div>

      <CustomerHeader fullName={fullName} />

      <main className="customer-main">

        <motion.div
          className="welcome-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="welcome-badge">
            <HiOutlineSparkles className="badge-icon" />
            Khách hàng
          </div>

          <h1>Chào mừng quay trở lại, {fullName}!</h1>

          <p>Hôm nay bạn muốn tìm kiếm thực phẩm lành mạnh nào?</p>

          <div className="welcome-search">
            <HiOutlineMagnifyingGlass className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </motion.div>

        <section className="products-section">
          <div className="section-header">
            <h2 className="section-title">
              <HiOutlineShoppingBag className="section-icon" />
              Danh sách sản phẩm
              <span className="product-count">{filtered.length} sản phẩm</span>
            </h2>
            <button className="cart-nav-btn" onClick={() => navigate('/customer/cart')}>
              <HiOutlineShoppingCart />
              Giỏ hàng
            </button>
          </div>

          {loading ? (
            <div className="products-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="product-card skeleton-card">
                  <div className="skeleton-img" />
                  <div className="skeleton-body">
                    <div className="skeleton-line lg" />
                    <div className="skeleton-line md" />
                    <div className="skeleton-line sm" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>Không tìm thấy sản phẩm</h3>
              <p>Thử tìm kiếm với từ khóa khác</p>
            </div>
          ) : (
            <div className="products-grid">
              {filtered.map((product, index) => {
                const imgUrl = getProductImageUrl(product.image);
                return (
                  <motion.div
                    key={product.id}
                    className="product-card"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    whileHover={{ y: -6 }}
                    onClick={() => navigate(`/customer/product/${product.id}`)}
                  >
                    <div className="product-image-wrapper">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={product.name}
                          className="product-image"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="product-img-placeholder"
                        style={{ display: imgUrl ? 'none' : 'flex' }}
                      >
                        🥗
                      </div>
                      {product.category?.name && (
                        <span className="product-category-badge">
                          {product.category.name}
                        </span>
                      )}
                    </div>

                    <div className="product-body">
                      <h3 className="product-name">{product.name}</h3>

                      <p className="product-description">
                        {product.description || 'Không có mô tả'}
                      </p>

                      <div className="product-footer">
                        <span className="product-price">
                          {Number(product.price).toLocaleString('vi-VN')} VNĐ
                        </span>
                        <button
                          className="buy-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/customer/product/${product.id}`);
                          }}
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <CustomerFooter />
    </div>
  );
};

export default CustomerHome;