import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineUser, HiOutlinePhone, HiOutlineEye, HiOutlineEyeSlash, HiOutlineArrowRight } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { register } from '../services/api';
import './Register.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('CUSTOMER');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (emailStr) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailStr);
  };

  const validatePhone = (phoneStr) => {
    // Định dạng số điện thoại Việt Nam chuẩn (di động)
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    return phoneRegex.test(phoneStr);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !fullName || !phone) {
      toast.error('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    if (fullName.trim().length < 2) {
      toast.error('Họ và tên phải có tối thiểu 2 ký tự!');
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Email không đúng định dạng!');
      return;
    }

    if (!validatePhone(phone)) {
      toast.error('Số điện thoại không đúng định dạng Việt Nam!');
      return;
    }

    if (password.length < 6) {
      toast.error('Mật khẩu phải có tối thiểu 6 ký tự!');
      return;
    }

    setLoading(true);
    try {
      const res = await register({ email, password, fullName, phone, role });
      const { token, userId, role: userRole, fullName: name, hasActiveSubscription } = res.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ userId, email, role: userRole, fullName: name, hasActiveSubscription }));
      
      toast.success('Đăng ký tài khoản thành công!');
      if (userRole === 'ADMIN') {
        navigate('/admin/adminhome');
      } else if (userRole === 'CUSTOMER') {
        navigate('/customer-home');
      } else if (userRole === 'MANAGER' || userRole === 'NUTRIENT') {
        navigate('/api/manager');
      } else {
        navigate('/subscription');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Đăng ký thất bại. Vui lòng kiểm tra lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="glow-sphere glow-1"></div>
      <div className="glow-sphere glow-2"></div>

      <motion.div 
        className="register-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="register-header">
          <div className="brand-logo">🍏</div>
          <h2>Tạo Tài Khoản</h2>
          <p>Tham gia vào hệ thống Healthy Food</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="fullName">Họ và Tên</label>
            <div className="input-wrapper">
              <HiOutlineUser className="input-icon" />
              <input
                id="fullName"
                type="text"
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
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
              <label htmlFor="phone">Số điện thoại</label>
              <div className="input-wrapper">
                <HiOutlinePhone className="input-icon" />
                <input
                  id="phone"
                  type="tel"
                  placeholder="0912345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <div className="input-wrapper">
              <HiOutlineLockClosed className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Tối thiểu 6 ký tự"
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

          <div className="form-group">
            <label>Vai trò của bạn</label>
            <div className="role-selector">
              <button
                type="button"
                className={`role-btn ${role === 'CUSTOMER' ? 'active' : ''}`}
                onClick={() => setRole('CUSTOMER')}
              >
                🛒 Khách Hàng (Customer)
              </button>
              <button
                type="button"
                className={`role-btn ${role === 'SELLER' ? 'active' : ''}`}
                onClick={() => setRole('SELLER')}
              >
                🏪 Người Bán (Seller)
              </button>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Đang đăng ký...' : (
              <>
                Đăng Ký Tài Khoản <HiOutlineArrowRight className="btn-arrow" />
              </>
            )}
          </button>
        </form>

        <div className="register-footer">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
