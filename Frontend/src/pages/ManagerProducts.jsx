import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineEyeSlash,
  HiOutlineArrowTrendingUp,
  HiOutlineMagnifyingGlass,
} from 'react-icons/hi2';
import { toast } from 'react-toastify';
import {
  getPendingProducts,
  getManagerProductDetail,
  approveProduct,
  rejectProduct,
  publishProduct,
  hideProduct,
} from '../services/api';
import ProductDetailModal from '../components/ProductDetailModal';
import './ManagerProducts.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

function ManagerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showHideModal, setShowHideModal] = useState(false);
  const [rejectComment, setRejectComment] = useState('');
  const [hideComment, setHideComment] = useState('');

  const fetchProducts = () => {
    setLoading(true);
    getPendingProducts()
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load pending products');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products based on search
  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const totalPending = products.length;

  // Handlers
  const handleViewDetail = async (product) => {
    try {
      const res = await getManagerProductDetail(product.id);
      setSelectedProduct(res.data);
      setShowDetailModal(true);
    } catch (err) {
      toast.error('Failed to load product details');
    }
  };

  const handleApprove = async (productId) => {
    setActionInProgress(productId);
    try {
      const res = await approveProduct(productId);
      setProducts(products.map((p) => (p.id === productId ? res.data : p)));
      toast.success('Product approved successfully!');
    } catch (err) {
      toast.error('Failed to approve product');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async () => {
    if (!rejectComment.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setActionInProgress(selectedProduct?.id);
    try {
      const res = await rejectProduct(selectedProduct.id, rejectComment);
      setProducts(
        products.map((p) => (p.id === selectedProduct.id ? res.data : p))
      );
      toast.success('Product rejected successfully!');
      setShowRejectModal(false);
      setRejectComment('');
      setShowDetailModal(false);
    } catch (err) {
      toast.error('Failed to reject product');
    } finally {
      setActionInProgress(null);
    }
  };

  const handlePublish = async (productId) => {
    setActionInProgress(productId);
    try {
      const res = await publishProduct(productId);
      setProducts(products.map((p) => (p.id === productId ? res.data : p)));
      toast.success('Product published successfully!');
    } catch (err) {
      toast.error('Failed to publish product');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleHide = async () => {
    if (!hideComment.trim()) {
      toast.error('Please provide a reason for hiding');
      return;
    }

    setActionInProgress(selectedProduct?.id);
    try {
      const res = await hideProduct(selectedProduct.id, hideComment);
      setProducts(
        products.map((p) => (p.id === selectedProduct.id ? res.data : p))
      );
      toast.success('Product hidden successfully!');
      setShowHideModal(false);
      setHideComment('');
      setShowDetailModal(false);
    } catch (err) {
      toast.error('Failed to hide product');
    } finally {
      setActionInProgress(null);
    }
  };

  const SkeletonCard = () => (
    <div className="skeleton-card">
      <div className="skeleton-image" />
      <div className="skeleton-body">
        <div className="skeleton-line" />
        <div className="skeleton-line short" />
      </div>
    </div>
  );

  return (
    <div className="manager-products-page">
      {/* HEADER */}
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1>Product Review</h1>
          <p>Review and approve pending products</p>
        </div>
      </motion.div>

      {/* STATS */}
      <motion.div
        className="stats-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="stat-card" variants={itemVariants}>
          <div className="stat-icon amber">⏳</div>
          <div>
            <div className="stat-value">{totalPending}</div>
            <div className="stat-label">Pending Review</div>
          </div>
        </motion.div>
      </motion.div>

      {/* SEARCH BAR */}
      <div className="search-section">
        <div className="search-box">
          <HiOutlineMagnifyingGlass className="search-icon" />
          <input
            type="text"
            placeholder="Search products by name…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* PRODUCTS LIST */}
      {loading ? (
        <div className="products-grid">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎉</div>
          <h3>No pending products</h3>
          <p>All products have been reviewed. Great job!</p>
        </div>
      ) : (
        <motion.div
          className="products-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                className="product-review-card"
                variants={itemVariants}
                layout
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.25 }}
              >
                {/* Product Image */}
                {product.image ? (
                  <img
                    className="product-image"
                    src={`http://localhost:8080/uploads/${product.image}`}
                    alt={product.name}
                  />
                ) : (
                  <div className="product-image-placeholder">📷</div>
                )}

                {/* Product Info */}
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-category">
                    {product.category?.name || 'Uncategorized'}
                  </p>

                  <div className="product-details">
                    <span className="detail-item">
                      <strong>Price:</strong> {product.price?.toLocaleString()} VND
                    </span>
                    <span className="detail-item">
                      <strong>Qty:</strong> {product.quantity ?? 0}
                    </span>
                    <span className="detail-item">
                      <strong>Seller:</strong> {product.seller?.email || 'Unknown'}
                    </span>
                  </div>

                  <p className="product-description">
                    {product.description?.substring(0, 100)}
                    {product.description?.length > 100 ? '...' : ''}
                  </p>
                </div>

                {/* Actions */}
                <div className="product-actions">
                  <button
                    className="action-btn view"
                    onClick={() => handleViewDetail(product)}
                  >
                    View Details
                  </button>
                  <motion.button
                    className="action-btn approve"
                    onClick={() => handleApprove(product.id)}
                    disabled={actionInProgress === product.id}
                    whileTap={{ scale: 0.95 }}
                  >
                    {actionInProgress === product.id ? (
                      <span>Processing...</span>
                    ) : (
                      <>
                        <HiOutlineCheckCircle /> Approve
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    className="action-btn reject"
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowRejectModal(true);
                    }}
                    disabled={actionInProgress === product.id}
                    whileTap={{ scale: 0.95 }}
                  >
                    {actionInProgress === product.id ? (
                      <span>Processing...</span>
                    ) : (
                      <>
                        <HiOutlineXCircle /> Reject
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* PRODUCT DETAIL MODAL */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedProduct(null);
        }}
        onApprove={() => handleApprove(selectedProduct.id)}
        onReject={() => setShowRejectModal(true)}
        onPublish={() => handlePublish(selectedProduct.id)}
        onHide={() => setShowHideModal(true)}
        isProcessing={actionInProgress === selectedProduct?.id}
      />

      {/* REJECT MODAL */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              className="modal-content action-modal"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Reject Product</h2>
                <p>Please provide a reason for rejection</p>
              </div>

              <textarea
                className="rejection-textarea"
                placeholder="Enter rejection reason..."
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                rows={4}
              />

              <div className="modal-actions">
                <button
                  className="modal-btn cancel"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectComment('');
                  }}
                >
                  Cancel
                </button>
                <button
                  className="modal-btn reject"
                  onClick={handleReject}
                  disabled={actionInProgress}
                >
                  Reject Product
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HIDE MODAL */}
      <AnimatePresence>
        {showHideModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHideModal(false)}
          >
            <motion.div
              className="modal-content action-modal"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Hide Product</h2>
                <p>Please provide a reason for hiding this product</p>
              </div>

              <textarea
                className="rejection-textarea"
                placeholder="Enter reason for hiding..."
                value={hideComment}
                onChange={(e) => setHideComment(e.target.value)}
                rows={4}
              />

              <div className="modal-actions">
                <button
                  className="modal-btn cancel"
                  onClick={() => {
                    setShowHideModal(false);
                    setHideComment('');
                  }}
                >
                  Cancel
                </button>
                <button
                  className="modal-btn hide"
                  onClick={handleHide}
                  disabled={actionInProgress}
                >
                  Hide Product
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ManagerProducts;
