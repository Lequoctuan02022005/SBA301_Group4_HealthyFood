import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeSlash, HiOutlineArrowRight } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { resetPassword } from '../services/api';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Helper validation functions
  const validateEmail = (emailStr) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailStr);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !newPassword || !confirmPassword) {
      toast.error('Vui lòng điền đầy đủ các thông tin!');
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Email không đúng định dạng!');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có tối thiểu 6 ký tự!');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không trùng khớp!');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ email, newPassword });
      toast.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Có lỗi xảy ra. Vui lòng kiểm tra lại email!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <div className="glow-sphere glow-1"></div>
      <div className="glow-sphere glow-2"></div>

      <motion.div 
        className="forgot-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="forgot-header">
          <div className="brand-logo">🔑</div>
          <h2>Quên Mật Khẩu</h2>
          <p>Đặt lại mật khẩu mới cho tài khoản của bạn</p>
        </div>

        <form onSubmit={handleSubmit} className="forgot-form">
          <div className="form-group">
            <label htmlFor="email">Email tài khoản</label>
            <div className="input-wrapper">
              <HiOutlineEnvelope className="input-icon" />
              <input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">Mật khẩu mới</label>
            <div className="input-wrapper">
              <HiOutlineLockClosed className="input-icon" />
              <input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Tối thiểu 6 ký tự"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
            <div className="input-wrapper">
              <HiOutlineLockClosed className="input-icon" />
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Đang thực hiện...' : (
              <>
                Đặt Lại Mật Khẩu <HiOutlineArrowRight className="btn-arrow" />
              </>
            )}
          </button>
        </form>

        <div className="forgot-footer">
          Nhớ mật khẩu? <Link to="/login">Đăng nhập</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
