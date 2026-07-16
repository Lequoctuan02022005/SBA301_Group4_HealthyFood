import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineArrowLeft } from 'react-icons/hi2';
import { getMe } from '../services/api';
import './PaymentResult.css';

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [transactionId, setTransactionId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    const payStatus = searchParams.get('status');
    const txnId = searchParams.get('transactionId');
    const err = searchParams.get('error');

    if (payStatus === 'success') {
      setStatus('success');
      const refreshUser = async () => {
        try {
          const res = await getMe();
          const { userId, email, role, fullName, hasActiveSubscription } = res.data;
          localStorage.setItem('user', JSON.stringify({ userId, email, role, fullName, hasActiveSubscription }));
        } catch (e) {
          console.error("Failed to refresh user status", e);
        }
      };
      refreshUser();
    } else {
      setStatus('fail');
    }

    if (txnId) setTransactionId(txnId);

    if (err === 'checksum') {
      setErrorMsg('Xác thực chữ ký số giao dịch thất bại (Checksum error).');
    } else if (err === 'not_found') {
      setErrorMsg('Không tìm thấy thông tin giao dịch trong hệ thống.');
    } else {
      setErrorMsg('Giao dịch thanh toán không thành công hoặc bị hủy.');
    }
  }, [searchParams]);

  return (
    <div className="payment-result-container">
      <div className="glow-sphere glow-1"></div>
      <div className="glow-sphere glow-2"></div>

      <motion.div 
        className="payment-result-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {status === 'success' ? (
          <div className="result-content success">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.1 }}
            >
              <HiOutlineCheckCircle className="result-icon success-icon" />
            </motion.div>
            <h2>Thanh Toán Thành Công!</h2>
            <p className="result-desc">
              Cảm ơn bạn! Đơn hàng / Gói dịch vụ của bạn đã được kích hoạt thành công trên hệ thống.
            </p>
            {transactionId && (
              <div className="transaction-details">
                <span>Mã giao dịch: </span>
                <strong>#{transactionId}</strong>
              </div>
            )}
            <button className="home-btn success-btn" onClick={() => navigate(user?.role === 'CUSTOMER' ? '/customer/orders' : '/products')}>
              {user?.role === 'CUSTOMER' ? 'Xem đơn hàng của bạn' : 'Quay lại Bảng điều khiển'}
            </button>
          </div>
        ) : (
          <div className="result-content fail">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.1 }}
            >
              <HiOutlineXCircle className="result-icon fail-icon" />
            </motion.div>
            <h2>Thanh Toán Thất Bại</h2>
            <p className="result-desc">{errorMsg}</p>
            {transactionId && (
              <div className="transaction-details">
                <span>Mã giao dịch: </span>
                <strong>#{transactionId}</strong>
              </div>
            )}
            <div className="btn-group">
              {user?.role === 'CUSTOMER' ? (
                <button className="home-btn fail-btn" onClick={() => navigate('/customer/orders')}>
                  Xem đơn hàng của bạn
                </button>
              ) : (
                <button className="home-btn fail-btn" onClick={() => navigate('/subscription')}>
                  Thử lại thanh toán
                </button>
              )}
              <button className="back-link" onClick={() => navigate(user?.role === 'CUSTOMER' ? '/customer-home' : '/products')}>
                <HiOutlineArrowLeft /> Về Trang chủ
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentResult;
