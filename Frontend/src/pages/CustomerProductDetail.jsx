import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  HiOutlineArrowLeft,
  HiOutlineShoppingBag,
  HiOutlineSparkles,
  HiMinus,
  HiPlus,
  HiOutlineShoppingCart,
} from 'react-icons/hi2';
import { getProductById, addToCart } from '../services/api';
import CustomerHeader from '../components/CustomerHeader';
import CustomerFooter from '../components/CustomerFooter';
import './CustomerProductDetail.css';

const CustomerProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const fullName = user?.fullName || user?.email || 'Khách hàng';

  useEffect(() => {
    const fetchProductDetail = async () => {
      setLoading(true);
      try {
        const response = await getProductById(id);
        const data = response.data || response;
        setProduct(data);
      } catch (error) {
        console.error('Failed to load product details:', error);
        toast.error('Không thể tải chi tiết sản phẩm');
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetail();
  }, [id]);

  const handleDecrement = () => setQuantity((q) => Math.max(1, q - 1));
  const handleIncrement = () =>
    setQuantity((q) => Math.min(product?.quantity || 1, q + 1));

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Bạn cần đăng nhập để thêm vào giỏ hàng');
      return;
    }
    setAddingToCart(true);
    try {
      const cartData = {
        customer: { id: user.userId },
        product: { id: Number(id) },
        quantity,
      };
      await addToCart(cartData);
      toast.success(`Đã thêm ${quantity} "${product.name}" vào giỏ hàng!`);
    } catch (error) {
      const msg = error?.response?.data?.message || 'Không thể thêm vào giỏ hàng';
      toast.error(msg);
      console.error(error);
    } finally {
      setAddingToCart(false);
    }
  };

  const getProductImageUrl = (image) => {
    if (!image) return null;
    if (image.startsWith('http://') || image.startsWith('https://')) return image;
    return `http://localhost:8080/uploads/${image}`;
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return '0 VNĐ';
    return `${Number(price).toLocaleString('vi-VN')} VNĐ`;
  };

  return (
    <div className="customer-detail-container">
      <div className="glow-sphere glow-1"></div>
      <div className="glow-sphere glow-2"></div>

      <CustomerHeader fullName={fullName} />

      <main className="customer-detail-main">
        <div className="back-navigation">
          <button className="back-link-btn" onClick={() => navigate(-1)}>
            <HiOutlineArrowLeft /> Quay lại
          </button>
          <button className="go-cart-btn" onClick={() => navigate('/customer/cart')}>
            <HiOutlineShoppingCart /> Xem giỏ hàng
          </button>
        </div>

        {loading ? (
          <div className="loading-wrapper">
            <div className="loading-spinner"></div>
            <p>Đang tải chi tiết sản phẩm...</p>
          </div>
        ) : !product ? (
          <div className="error-wrapper">
            <h2>Không tìm thấy sản phẩm!</h2>
            <p>Sản phẩm này có thể không tồn tại hoặc đã bị ẩn.</p>
            <button className="btn-home" onClick={() => navigate('/customer-home')}>
              Quay lại Trang Chủ
            </button>
          </div>
        ) : (
          <motion.div
            className="product-detail-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="product-detail-layout">
              {/* Image Section */}
              <div className="product-image-section">
                {product.image ? (
                  <img
                    src={getProductImageUrl(product.image)}
                    alt={product.name}
                    className="detail-img"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const placeholder = e.currentTarget.nextElementSibling;
                      if (placeholder) placeholder.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="detail-img-placeholder"
                  style={{ display: product.image ? 'none' : 'flex' }}
                >
                  📷
                </div>
              </div>

              {/* Info Section */}
              <div className="product-info-section">
                <div className="category-tag">
                  <HiOutlineSparkles className="spark-icon" />
                  {product.category?.name || 'Thực phẩm lành mạnh'}
                </div>

                <h1 className="product-title">{product.name}</h1>

                <div className="price-tag">{formatPrice(product.price)}</div>

                <div className="stock-info">
                  <span>Trạng thái: </span>
                  <strong className={product.quantity > 0 ? 'text-success' : 'text-danger'}>
                    {product.quantity > 0
                      ? `Còn hàng (${product.quantity} sản phẩm)`
                      : 'Hết hàng'}
                  </strong>
                </div>

                <div className="seller-info-box">
                  <span className="seller-label">Người bán: </span>
                  <span className="seller-value">
                    {product.seller?.fullName || product.seller?.email || 'N/A'}
                  </span>
                </div>

                <div className="divider"></div>

                {/* Quantity Selector */}
                {product.quantity > 0 && (
                  <div className="quantity-selector-group">
                    <label className="qty-label">Số lượng</label>
                    <div className="qty-controls">
                      <button
                        className="qty-btn"
                        onClick={handleDecrement}
                        disabled={quantity <= 1}
                      >
                        <HiMinus />
                      </button>
                      <span className="qty-value">{quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={handleIncrement}
                        disabled={quantity >= product.quantity}
                      >
                        <HiPlus />
                      </button>
                    </div>
                    <span className="qty-max">Tối đa: {product.quantity}</span>
                  </div>
                )}

                <div className="price-summary">
                  <span className="price-summary-label">Tổng tiền:</span>
                  <span className="price-summary-value">
                    {formatPrice((product.price || 0) * quantity)}
                  </span>
                </div>

                <div className="action-row">
                  <button
                    className="add-to-cart-btn"
                    onClick={handleAddToCart}
                    disabled={addingToCart || !product.quantity || product.quantity <= 0}
                  >
                    <HiOutlineShoppingBag className="cart-icon" />
                    {addingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                  </button>
                  <button
                    className="view-cart-btn"
                    onClick={() => navigate('/customer/cart')}
                  >
                    <HiOutlineShoppingCart />
                    Giỏ hàng
                  </button>
                </div>

                <div className="divider"></div>

                <div className="info-tabs">
                  <div className="info-tab-item">
                    <h3>Mô tả sản phẩm</h3>
                    <p className="tab-text">
                      {product.description || 'Không có mô tả sản phẩm.'}
                    </p>
                  </div>
                  <div className="info-tab-item">
                    <h3>Thành phần</h3>
                    <p className="tab-text">
                      {product.ingredient || 'Thông tin thành phần đang được cập nhật.'}
                    </p>
                  </div>
                  <div className="info-tab-item">
                    <h3>Thông tin dinh dưỡng</h3>
                    <p className="tab-text">
                      {product.nutritionInfo || 'Thông tin dinh dưỡng đang được cập nhật.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      <CustomerFooter />
    </div>
  );
};

export default CustomerProductDetail;
