import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  HiOutlineArrowLeft,
  HiOutlineTrash,
  HiMinus,
  HiPlus,
  HiOutlineShoppingBag,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';
import { getCartItems, updateCartItem, deleteCartItem, createOrder } from '../services/api';
import CustomerHeader from '../components/CustomerHeader';
import CustomerFooter from '../components/CustomerFooter';
import './CustomerCart.css';

const CustomerCart = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set()); // Set of cart item IDs
  const [placingOrder, setPlacingOrder] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const fullName = user?.fullName || user?.email || 'Khách hàng';

  const getProductImageUrl = (image) => {
    if (!image) return null;
    if (image.startsWith('http://') || image.startsWith('https://')) return image;
    return `http://localhost:8080/uploads/${image}`;
  };

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getCartItems();
      const data = Array.isArray(response.data) ? response.data : [];
      // Only show items belonging to current user
      const myItems = user
        ? data.filter((item) => item.customer?.id === user.userId)
        : data;
      setCartItems(myItems);
    } catch (error) {
      console.error('Failed to load cart:', error);
      toast.error('Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Toggle select one item
  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selected.size === cartItems.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(cartItems.map((item) => item.id)));
    }
  };

  // Update quantity
  const handleUpdateQty = async (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    if (newQty > (item.product?.quantity || 1)) {
      toast.warning('Vượt quá số lượng tồn kho');
      return;
    }
    try {
      await updateCartItem(item.id, { quantity: newQty });
      setCartItems((prev) =>
        prev.map((c) => (c.id === item.id ? { ...c, quantity: newQty } : c))
      );
    } catch (error) {
      toast.error('Không thể cập nhật số lượng');
    }
  };

  // Remove one item
  const handleRemove = async (id) => {
    try {
      await deleteCartItem(id);
      setCartItems((prev) => prev.filter((c) => c.id !== id));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (error) {
      toast.error('Không thể xóa sản phẩm');
    }
  };

  // Computed values
  const selectedItems = cartItems.filter((item) => selected.has(item.id));
  const totalAmount = selectedItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );
  const totalItems = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  // Place order
  const handlePlaceOrder = async () => {
    if (selectedItems.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một sản phẩm để đặt hàng');
      return;
    }
    setConfirmModal(true);
  };

  const confirmPlaceOrder = async () => {
    setConfirmModal(false);
    setPlacingOrder(true);
    try {
      const orderData = {
        customer: { id: user.userId },
        totalAmount,
        totalItems,
        status: 'PENDING',
        orderDetails: selectedItems.map((item) => ({
          product: { id: item.product.id },
          quantity: item.quantity,
          price: item.product.price,
        })),
      };
      await createOrder(orderData);

      // Xóa các sản phẩm đã đặt khỏi giỏ hàng trên database
      for (const item of selectedItems) {
        try {
          await deleteCartItem(item.id);
        } catch (e) {
          console.error("Failed to delete cart item from database:", item.id, e);
        }
      }

      toast.success('Đặt hàng thành công! Đơn hàng đang được xử lý.');

      // Remove ordered items from cart UI
      const orderedIds = new Set(selectedItems.map((i) => i.id));
      setCartItems((prev) => prev.filter((c) => !orderedIds.has(c.id)));
      setSelected(new Set());

      // Redirect to order list
      setTimeout(() => navigate('/customer/orders'), 1200);
    } catch (error) {
      const msg = error?.response?.data?.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.';
      toast.error(msg);
      console.error(error);
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="customer-cart-container">
      <div className="glow-sphere glow-1"></div>
      <div className="glow-sphere glow-2"></div>

      <CustomerHeader fullName={fullName} />

      <main className="customer-cart-main">
        <div className="cart-page-header">
          <button className="back-link-btn" onClick={() => navigate(-1)}>
            <HiOutlineArrowLeft /> Tiếp tục mua sắm
          </button>
          <h1 className="cart-title">
            <HiOutlineShoppingBag />
            Giỏ hàng của bạn
          </h1>
        </div>

        {loading ? (
          <div className="loading-wrapper">
            <div className="loading-spinner"></div>
            <p>Đang tải giỏ hàng...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <motion.div
            className="empty-cart"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="empty-cart-icon">🛒</div>
            <h2>Giỏ hàng trống</h2>
            <p>Hãy thêm sản phẩm vào giỏ hàng để bắt đầu mua sắm!</p>
            <button className="btn-shop" onClick={() => navigate('/customer-home')}>
              Khám phá sản phẩm
            </button>
          </motion.div>
        ) : (
          <div className="cart-layout">
            {/* Left — Cart Items */}
            <div className="cart-items-panel">
              {/* Select All */}
              <div className="cart-select-all-row">
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={selected.size === cartItems.length && cartItems.length > 0}
                    onChange={toggleSelectAll}
                  />
                  <span>Chọn tất cả ({cartItems.length} sản phẩm)</span>
                </label>
                {selected.size > 0 && (
                  <span className="selected-count-badge">
                    Đã chọn: {selected.size}
                  </span>
                )}
              </div>

              <AnimatePresence>
                {cartItems.map((item) => {
                  const imgUrl = getProductImageUrl(item.product?.image);
                  const isChecked = selected.has(item.id);
                  return (
                    <motion.div
                      key={item.id}
                      className={`cart-item-card ${isChecked ? 'selected' : ''}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.25 }}
                    >
                      <input
                        type="checkbox"
                        className="item-checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelect(item.id)}
                      />

                      <div className="item-image-wrap">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={item.product?.name}
                            className="item-img"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className="item-img-placeholder"
                          style={{ display: imgUrl ? 'none' : 'flex' }}
                        >
                          🥗
                        </div>
                      </div>

                      <div className="item-info">
                        <h3
                          className="item-name"
                          onClick={() =>
                            navigate(`/customer/product/${item.product?.id}`)
                          }
                        >
                          {item.product?.name || 'Sản phẩm'}
                        </h3>
                        <p className="item-category">
                          {item.product?.category?.name || ''}
                        </p>
                        <div className="item-price-unit">
                          {Number(item.product?.price || 0).toLocaleString('vi-VN')} VNĐ / sản phẩm
                        </div>
                      </div>

                      <div className="item-qty-group">
                        <button
                          className="qty-btn"
                          onClick={() => handleUpdateQty(item, -1)}
                          disabled={item.quantity <= 1}
                        >
                          <HiMinus />
                        </button>
                        <span className="qty-val">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => handleUpdateQty(item, 1)}
                          disabled={item.quantity >= (item.product?.quantity || 1)}
                        >
                          <HiPlus />
                        </button>
                      </div>

                      <div className="item-subtotal">
                        {Number(
                          (item.product?.price || 0) * item.quantity
                        ).toLocaleString('vi-VN')}{' '}
                        VNĐ
                      </div>

                      <button
                        className="item-remove-btn"
                        onClick={() => handleRemove(item.id)}
                        title="Xóa sản phẩm"
                      >
                        <HiOutlineTrash />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Right — Order Summary */}
            <div className="order-summary-panel">
              <h2 className="summary-title">Tóm tắt đơn hàng</h2>

              <div className="summary-row">
                <span>Sản phẩm đã chọn</span>
                <strong>{selectedItems.length} loại ({totalItems} cái)</strong>
              </div>

              <div className="summary-divider" />

              <div className="summary-total-row">
                <span>Tổng cộng</span>
                <strong className="total-price">
                  {Number(totalAmount).toLocaleString('vi-VN')} VNĐ
                </strong>
              </div>

              {selectedItems.length > 0 && (
                <div className="selected-items-preview">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="preview-item">
                      <span className="preview-name">{item.product?.name}</span>
                      <span className="preview-qty">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                className="place-order-btn"
                onClick={handlePlaceOrder}
                disabled={placingOrder || selectedItems.length === 0}
              >
                {placingOrder ? (
                  'Đang đặt hàng...'
                ) : (
                  <>
                    <HiOutlineCheckCircle />
                    Đặt hàng ({selectedItems.length} sản phẩm)
                  </>
                )}
              </button>

              {selectedItems.length === 0 && (
                <p className="summary-hint">
                  Hãy chọn sản phẩm để tiến hành đặt hàng
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmModal(false)}
          >
            <motion.div
              className="confirm-modal"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="confirm-icon">🛍️</div>
              <h2>Xác nhận đặt hàng</h2>
              <p>
                Bạn đang đặt <strong>{selectedItems.length} sản phẩm</strong> với
                tổng giá trị{' '}
                <strong>{Number(totalAmount).toLocaleString('vi-VN')} VNĐ</strong>
              </p>
              <div className="confirm-actions">
                <button
                  className="btn-cancel-modal"
                  onClick={() => setConfirmModal(false)}
                >
                  Hủy
                </button>
                <button className="btn-confirm-modal" onClick={confirmPlaceOrder}>
                  Xác nhận đặt hàng
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CustomerFooter />
    </div>
  );
};

export default CustomerCart;
