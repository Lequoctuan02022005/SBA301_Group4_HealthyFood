import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeSlash, HiOutlineArrowRight } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { login } from '../services/api';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (emailStr) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailStr);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Email không đúng định dạng!');
      return;
    }

    if (password.length < 6) {
      toast.error('Mật khẩu phải có tối thiểu 6 ký tự!');
      return;
    }

    setLoading(true);
    try {
      const res = await login({ email, password });
      const { token, userId, role, fullName, hasActiveSubscription } = res.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ userId, email, role, fullName, hasActiveSubscription }));
      
      toast.success(`Chào mừng ${fullName || email} quay trở lại!`);
      
      // Chuyển hướng dựa trên role
      if (role === 'ADMIN') {
        navigate('/admin/adminhome');
      } else if (role === 'CUSTOMER') {
        navigate('/customer-home');
      } else if (role === 'MANAGER' || role === 'NUTRIENT') {
        navigate('/api/manager');
      } else {
        if (hasActiveSubscription) {
          navigate('/products');
        } else {
          navigate('/subscription');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Background glow effects */}
      <div className="glow-sphere glow-1"></div>
      <div className="glow-sphere glow-2"></div>

      <motion.div 
        className="login-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="login-header">
          <div className="brand-logo">🍏</div>
          <h2>Chào Mừng Trở Lại</h2>
          <p>Đăng nhập vào hệ thống Healthy Food</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
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
            <div className="label-row">
              <label htmlFor="password">Mật khẩu</label>
              <Link to="/forgot-password" className="forgot-link">Quên mật khẩu?</Link>
            </div>
            <div className="input-wrapper">
              <HiOutlineLockClosed className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Đang xác thực...' : (
              <>
                Đăng Nhập <HiOutlineArrowRight className="btn-arrow" />
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
