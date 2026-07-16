import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineArrowLeft } from 'react-icons/hi2';
import { getManagerProductDetail, approveProduct, rejectProduct } from '../../services/api.js';
import './ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectComment, setRejectComment] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await getManagerProductDetail(id);
        setProduct(res.data);
      } catch (err) {
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleApprove = async () => {
    setActionInProgress(true);
    try {
      await approveProduct(id);
      toast.success('Product approved successfully!');
      navigate('/api/manager/pending-product');
    } catch (err) {
        console.log(err);
      toast.error('Failed to approve product');
      setActionInProgress(false);
    }
  };

  const handleReject = async () => {
    if (!rejectComment.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setActionInProgress(true);
    try {
      await rejectProduct(id, rejectComment);
      toast.success('Product rejected successfully!');
      setShowRejectModal(false);
      navigate('/api/manager/pending-product');
    } catch (err) {
        console.log(err);
      toast.error('Failed to reject product');
      setActionInProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="product-detail-page skeleton">
         <div className="skeleton-loader">Loading details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-page error">
        <h2>Product not found</h2>
        <button onClick={() => navigate('/api/manager/pending-product')}>Go Back</button>
      </div>
    );
  }

  return (
    <motion.div 
      className="product-detail-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/api/manager/pending-product')}>
          <HiOutlineArrowLeft /> Back to Pending List
        </button>
        <h1>Review Product: {product.name}</h1>
      </div>

      <div className="detail-content">
        <div className="detail-image-section">
          {product.image ? (
            <img src={`http://localhost:8080/uploads/${product.image}`} alt={product.name} />
          ) : (
            <div className="image-placeholder">No Image Available</div>
          )}
        </div>

        <div className="detail-info-section">
          <div className="info-group">
            <label>Product Name</label>
            <p>{product.name}</p>
          </div>
          
          <div className="info-grid">
            <div className="info-group">
              <label>Category</label>
              <p>{product.category?.name || 'Uncategorized'}</p>
            </div>
            <div className="info-group">
              <label>Price</label>
              <p>{product.price?.toLocaleString()} VND</p>
            </div>
            <div className="info-group">
              <label>Quantity</label>
              <p>{product.quantity ?? 0}</p>
            </div>
            <div className="info-group">
              <label>Seller Email</label>
              <p>{product.seller?.email || 'Unknown'}</p>
            </div>
          </div>

          <div className="info-group">
            <label>Ingredients</label>
            <p>{product.ingredient || 'None specified'}</p>
          </div>

          <div className="info-group">
            <label>Nutrition Information</label>
            <p>{product.nutritionInfo || 'None specified'}</p>
          </div>

          <div className="info-group full-width">
            <label>Description</label>
            <p className="description-text">{product.description || 'No description provided'}</p>
          </div>

          <div className="action-buttons">
            <button 
              className="btn-approve" 
              onClick={handleApprove} 
              disabled={actionInProgress}
            >
              <HiOutlineCheckCircle /> {actionInProgress ? 'Processing...' : 'Approve Product'}
            </button>
            <button 
              className="btn-reject" 
              onClick={() => setShowRejectModal(true)} 
              disabled={actionInProgress}
            >
              <HiOutlineXCircle /> {actionInProgress ? 'Processing...' : 'Reject Product'}
            </button>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
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
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Reject Product</h2>
                <p>Please provide a reason for rejecting {product.name}</p>
              </div>

              <textarea
                className="rejection-textarea"
                placeholder="Enter rejection reason here..."
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
                  disabled={actionInProgress}
                >
                  Cancel
                </button>
                <button
                  className="modal-btn reject"
                  onClick={handleReject}
                  disabled={actionInProgress}
                >
                  Confirm Reject
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default ProductDetail;
