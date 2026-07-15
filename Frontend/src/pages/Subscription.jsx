import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineCheck,
  HiOutlineStar,
  HiOutlineBolt,
  HiOutlineRocketLaunch,
  HiOutlineSparkles,
  HiOutlineTrophy,
} from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { getSubscriptions, createSubscriptionPayment } from '../services/api';
import './Subscription.css';

const mockPackages = [
  {
    id: 1,
    name: '1 Month',
    price: 199000,
    durationDays: 30,
    description: 'Try it out for a month',
  },
  {
    id: 2,
    name: '3 Months',
    price: 499000,
    durationDays: 90,
    description: 'Great value for starters',
  },
  {
    id: 3,
    name: '6 Months',
    price: 899000,
    durationDays: 180,
    description: 'Best for growing sellers',
  },
  {
    id: 4,
    name: '1 Year',
    price: 1499000,
    durationDays: 365,
    description: 'Maximum savings & benefits',
  },
];

const planFeatures = {
  0: [
    'Up to 20 products',
    'Basic analytics',
    'Email support',
    'Standard listing',
  ],
  1: [
    'Up to 50 products',
    'Advanced analytics',
    'Priority email support',
    'Featured listing',
    'Promotion tools',
  ],
  2: [
    'Up to 150 products',
    'Premium analytics',
    'Priority support 24/7',
    'Featured listing',
    'Promotion tools',
    'Custom storefront',
  ],
  3: [
    'Unlimited products',
    'Premium analytics & AI insights',
    '24/7 dedicated support',
    'Premium listing',
    'Advanced promotions',
    'Custom branding',
    'API access',
    'Multi-store management',
  ],
};

const tierConfig = [
  { icon: HiOutlineStar, tierClass: 'tier-1', label: 'Basic' },
  { icon: HiOutlineBolt, tierClass: 'tier-2', label: 'Standard' },
  { icon: HiOutlineRocketLaunch, tierClass: 'tier-3', label: 'Premium' },
  { icon: HiOutlineTrophy, tierClass: 'tier-4', label: 'Ultimate' },
];

const tierColors = ['#06b6d4', '#8b5cf6', '#f59e0b', '#f43f5e'];

const Subscription = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const res = await getSubscriptions();
        const data = res?.data;
        if (data && Array.isArray(data) && data.length > 0) {
          setPackages(data);
        } else {
          setPackages(mockPackages);
        }
      } catch (err) {
        console.warn('Failed to fetch subscriptions, using mock data:', err);
        setPackages(mockPackages);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const handlePurchase = async (pkg) => {
    setPurchasing(true);
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.userId || 2; // Mặc định là 2 nếu chưa đăng nhập

      const res = await createSubscriptionPayment(userId, pkg.id);
      if (res.data && res.data.paymentUrl) {
        toast.info('Đang chuyển hướng tới cổng thanh toán VNPay...');
        window.location.href = res.data.paymentUrl;
      } else {
        throw new Error('Payment URL not found');
      }
    } catch (err) {
      toast.error('Không thể tạo yêu cầu thanh toán. Vui lòng thử lại!');
      console.error(err);
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <motion.div
      className="subscription-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* ── Page Header ── */}
      <div className="subscription-header">
        <motion.div
          className="subscription-header-icon"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        >
          <HiOutlineSparkles />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Your Subscription
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          Choose the plan that fits your business needs
        </motion.p>
      </div>

      {/* ── Pricing Grid ── */}
      <div className="pricing-grid">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div className="pricing-skeleton" key={i} />
            ))
          : packages.map((pkg, index) => {
              const tier = tierConfig[index] || tierConfig[0];
              const TierIcon = tier.icon;
              const features = planFeatures[index] || planFeatures[0];
              const color = tierColors[index] || tierColors[0];

              return (
                <motion.div
                  key={pkg.id}
                  className={`pricing-card ${tier.tierClass}`}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.12 * index + 0.3 }}
                  whileHover={{ scale: 1.06, y: -6 }}
                >
                  {/* Card header */}
                  <div className="pricing-card-header">
                    <div className={`pricing-icon ${tier.tierClass}`}>
                      <TierIcon />
                    </div>
                    <h3 className="pricing-name">{pkg.name}</h3>
                    <p className="pricing-desc">{pkg.description}</p>
                  </div>

                  {/* Price */}
                  <div className="pricing-amount">
                    <div className="pricing-price">
                      {pkg.price.toLocaleString('vi-VN')}
                      <span> VND</span>
                    </div>
                    <div className="pricing-duration">{pkg.durationDays} days</div>
                  </div>

                  {/* Features */}
                  <ul className="pricing-features">
                    {features.map((feature, fi) => (
                      <li key={fi}>
                        <HiOutlineCheck className="check-icon" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    className={`pricing-btn ${tier.tierClass}-btn`}
                    onClick={() => handlePurchase(pkg)}
                    disabled={purchasing}
                    style={{
                      '--btn-color': color,
                    }}
                  >
                    {purchasing ? 'Processing...' : 'Subscribe Now'}
                  </button>
                </motion.div>
              );
            })}
      </div>

      {/* ── Footer ── */}
      <motion.div
        className="pricing-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        All plans include: Secure payments <span>•</span> Real-time notifications{' '}
        <span>•</span> Mobile responsive
      </motion.div>
    </motion.div>
  );
};

export default Subscription;
