import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  HiOutlineArrowLeft,
  HiOutlineClipboardDocumentList,
  HiOutlineCreditCard,
  HiOutlineXCircle,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineShoppingBag,
  HiOutlineArrowPathRoundedSquare,
} from 'react-icons/hi2';
import { getOrdersByCustomer, cancelOrder, checkoutOrder } from '../services/api';
import CustomerHeader from '../components/CustomerHeader';
import CustomerFooter from '../components/CustomerFooter';
import './CustomerOrderList.css';

const STATUS_CONFIG = {
  PENDING: { label: 'Chờ thanh toán', className: 'status-pending' },
  PAID: { label: 'Đã thanh toán', className: 'status-paid' },
  CANCELLED: { label: 'Đã hủy', className: 'status-cancelled' },
  PROCESSING: { label: 'Đang xử lý', className: 'status-processing' },
  DELIVERED: { label: 'Đã giao hàng', className: 'status-delivered' },
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatPrice = (price) => {
  if (price === null || price === undefined) return '0 VNĐ';
  return `${Number(price).toLocaleString('vi-VN')} VNĐ`;
};

const CustomerOrderList = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [checkingOut, setCheckingOut] = useState(null);
  const [cancelling, setCancelling] = useState(null);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const fullName = user?.fullName || user?.email || 'Khách hàng';
  const customerId = user?.userId;

  const fetchOrders = useCallback(async () => {
    if (!customerId) {
      setError('Không xác định được tài khoản. Vui lòng đăng nhập lại.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await getOrdersByCustomer(customerId);
      const data = Array.isArray(response.data) ? response.data : [];
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại.');
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const toggleExpand = (orderId) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const handleCheckout = async (order) => {
    setCheckingOut(order.id);
    try {
      const response = await checkoutOrder(order.id);
      const paymentUrl = response.data;
      if (paymentUrl && typeof paymentUrl === 'string' && paymentUrl.startsWith('http')) {
        toast.info('Đang chuyển đến trang thanh toán...');
        window.location.href = paymentUrl;
      } else {
        toast.error('URL thanh toán không hợp lệ. Vui lòng thử lại.');
        console.error('Invalid payment URL:', paymentUrl);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Không thể khởi tạo thanh toán. Vui lòng thử lại.';
      toast.error(msg);
      console.error('Checkout error:', err);
    } finally {
      setCheckingOut(null);
    }
  };

  const handleCancel = async (order) => {
    setCancelling(order.id);
    try {
      await cancelOrder(order.id);
      toast.success(`Đã hủy đơn hàng #${order.id}`);
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: 'CANCELLED' } : o))
      );
    } catch (err) {
      const msg = err?.response?.data?.message || 'Không thể hủy đơn hàng';
      toast.error(msg);
      console.error('Cancel error:', err);
    } finally {
      setCancelling(null);
    }
  };

  const getProductImageUrl = (image) => {
    if (!image) return null;
    if (image.startsWith('http://') || image.startsWith('https://')) return image;
    return `http://localhost:8080/uploads/${image}`;
  };

  return (
    <div className="order-list-container">
      <div className="glow-sphere glow-1" />
      <div className="glow-sphere glow-2" />

      <CustomerHeader fullName={fullName} />

      <main className="order-list-main">
        <div className="order-page-header">
          <button className="back-link-btn" onClick={() => navigate(-1)}>
            <HiOutlineArrowLeft /> Quay lại
          </button>
          <h1 className="order-page-title">
            <HiOutlineClipboardDocumentList />
            Đơn hàng của tôi
          </h1>
          <button className="refresh-btn" onClick={fetchOrders} title="Tải lại">
            <HiOutlineArrowPathRoundedSquare />
          </button>
        </div>

        {loading ? (
          <div className="loading-wrapper">
            <div className="loading-spinner" />
            <p>Đang tải danh sách đơn hàng...</p>
          </div>
        ) : error ? (
          <div className="error-wrapper">
            <div className="empty-icon">⚠️</div>
            <h2>Có lỗi xảy ra</h2>
            <p>{error}</p>
            <button className="btn-shop" onClick={fetchOrders}>Thử lại</button>
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            className="empty-orders"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="empty-icon">📋</div>
            <h2>Chưa có đơn hàng nào</h2>
            <p>Hãy chọn sản phẩm và đặt hàng để bắt đầu!</p>
            <button className="btn-shop" onClick={() => navigate('/customer-home')}>
              Khám phá sản phẩm
            </button>
          </motion.div>
        ) : (
          <div className="orders-list">
            <div className="orders-count">
              Tổng cộng <strong>{orders.length}</strong> đơn hàng
            </div>
            {orders.map((order, index) => {
              const statusInfo = STATUS_CONFIG[order.status] || {
                label: order.status || 'Không xác định',
                className: 'status-default',
              };
              const isExpanded = expandedOrders.has(order.id);
              const isPending = order.status === 'PENDING';
              const details = order.orderDetails || [];

              return (
                <motion.div
                  key={order.id}
                  className="order-card"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {/* Header: ID, date, status */}
                  <div className="order-card-header">
                    <div className="order-meta">
                      <span className="order-id">Đơn #{order.id}</span>
                      <span className="order-date">{formatDate(order.createdAt)}</span>
                    </div>
                    <span className={`status-badge ${statusInfo.className}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Summary + Actions */}
                  <div className="order-summary-row">
                    <div className="order-summary-info">
                      <div className="summary-stat">
                        <span className="stat-label">Số sản phẩm</span>
                        <span className="stat-value">{details.length} loại</span>
                      </div>
                      <div className="summary-stat">
                        <span className="stat-label">Tổng cộng</span>
                        <span className="stat-value total-price">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </div>
                    </div>

                    <div className="order-actions">
                      {isPending && (
                        <>
                          <button
                            className="btn-checkout"
                            onClick={() => handleCheckout(order)}
                            disabled={checkingOut === order.id}
                          >
                            <HiOutlineCreditCard />
                            {checkingOut === order.id ? 'Đang xử lý...' : 'Thanh toán'}
                          </button>
                          <button
                            className="btn-cancel-order"
                            onClick={() => handleCancel(order)}
                            disabled={cancelling === order.id}
                          >
                            <HiOutlineXCircle />
                            {cancelling === order.id ? 'Đang hủy...' : 'Hủy đơn'}
                          </button>
                        </>
                      )}
                      {details.length > 0 && (
                        <button
                          className="btn-expand"
                          onClick={() => toggleExpand(order.id)}
                        >
                          {isExpanded ? <HiOutlineChevronUp /> : <HiOutlineChevronDown />}
                          {isExpanded ? 'Thu gọn' : 'Xem chi tiết'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expandable product list */}
                  <AnimatePresence>
                    {isExpanded && details.length > 0 && (
                      <motion.div
                        className="order-details-panel"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="order-details-divider" />
                        <div className="order-items-list">
                          <h4 className="items-heading">
                            <HiOutlineShoppingBag /> Sản phẩm trong đơn
                          </h4>
                          {details.map((detail) => {
                            const imgUrl = getProductImageUrl(detail.product?.image);
                            return (
                              <div key={detail.id} className="order-item-row">
                                <div className="order-item-img-wrap">
                                  {imgUrl ? (
                                    <img
                                      src={imgUrl}
                                      alt={detail.product?.name}
                                      className="order-item-img"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  <div
                                    className="order-item-img-placeholder"
                                    style={{ display: imgUrl ? 'none' : 'flex' }}
                                  >
                                    🥗
                                  </div>
                                </div>
                                <div className="order-item-info">
                                  <span
                                    className="order-item-name"
                                    onClick={() =>
                                      navigate(`/customer/product/${detail.product?.id}`)
                                    }
                                  >
                                    {detail.product?.name || 'Sản phẩm'}
                                  </span>
                                  <span className="order-item-qty">
                                    Số lượng: {detail.quantity}
                                  </span>
                                </div>
                                <div className="order-item-price">
                                  {formatPrice(
                                    Number(detail.price || 0) * Number(detail.quantity || 1)
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          <div className="order-total-row">
                            <span>Tổng đơn hàng:</span>
                            <strong className="total-price">{formatPrice(order.totalAmount)}</strong>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      <CustomerFooter />
    </div>
  );
};

export default CustomerOrderList;
