import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineTrash,
  HiOutlinePencilSquare,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlinePlus,
  HiOutlineFunnel,
  HiOutlineMagnifyingGlass,
} from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { getProducts, deleteProduct, updateProduct } from '../services/api';
import './ProductList.css';

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

const FILTER_OPTIONS = [
  'ALL',
  'PUBLISHED',
  'PENDING_NUTRIENT',
  'PENDING_MANAGER',
  'REJECTED',
  'HIDDEN',
];

const STATUS_STYLE_MAP = {
  PUBLISHED: 'published',
  PENDING_NUTRIENT: 'pending',
  PENDING_MANAGER: 'pending',
  REJECTED: 'rejected',
  HIDDEN: 'hidden',
};

const STATUS_LABEL_MAP = {
  PUBLISHED: 'Published',
  PENDING_NUTRIENT: 'Pending Nutrient',
  PENDING_MANAGER: 'Pending Manager',
  REJECTED: 'Rejected',
  HIDDEN: 'Hidden',
};

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = () => {
    setLoading(true);
    getProducts()
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ---------- derived data ---------- */
  const filteredProducts = products.filter((product) => {
    const matchesFilter =
      activeFilter === 'ALL' || product.status === activeFilter;
    const matchesSearch = product.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalCount = products.length;
  const publishedCount = products.filter(
    (p) => p.status === 'PUBLISHED'
  ).length;
  const pendingCount = products.filter(
    (p) => p.status === 'PENDING_NUTRIENT' || p.status === 'PENDING_MANAGER'
  ).length;
  const rejectedCount = products.filter(
    (p) => p.status === 'REJECTED'
  ).length;

  /* ---------- handlers ---------- */
  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(selectedProduct.id);
      setProducts(products.filter((p) => p.id !== selectedProduct.id));
      toast.success('Product deleted successfully!');
      setShowDeleteModal(false);
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const handleToggleHide = async (product) => {
    try {
      const newStatus = product.status === 'HIDDEN' ? 'PUBLISHED' : 'HIDDEN';
      const updatedProduct = { ...product, status: newStatus };
      await updateProduct(product.id, updatedProduct);
      setProducts(products.map((p) => p.id === product.id ? { ...p, status: newStatus } : p));
      toast.success(newStatus === 'HIDDEN' ? 'Sản phẩm đã được ẩn thành công!' : 'Sản phẩm đã được hiển thị lại!');
    } catch (err) {
      toast.error('Không thể cập nhật trạng thái sản phẩm');
    }
  };

  /* ---------- sub-components ---------- */
  const SkeletonCard = () => (
    <div className="skeleton-card">
      <div className="skeleton-image" />
      <div className="skeleton-body">
        <div className="skeleton-line" />
        <div className="skeleton-line short" />
        <div className="skeleton-line medium" />
      </div>
    </div>
  );

  return (
    <div className="product-list-page">
      {/* ============ STATS ============ */}
      <motion.div
        className="stats-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="stat-card" variants={itemVariants}>
          <div className="stat-icon violet">📦</div>
          <div>
            <div className="stat-value">{totalCount}</div>
            <div className="stat-label">Total Products</div>
          </div>
        </motion.div>

        <motion.div className="stat-card" variants={itemVariants}>
          <div className="stat-icon emerald">✓</div>
          <div>
            <div className="stat-value">{publishedCount}</div>
            <div className="stat-label">Published</div>
          </div>
        </motion.div>

        <motion.div className="stat-card" variants={itemVariants}>
          <div className="stat-icon amber">⏳</div>
          <div>
            <div className="stat-value">{pendingCount}</div>
            <div className="stat-label">Pending</div>
          </div>
        </motion.div>

        <motion.div className="stat-card" variants={itemVariants}>
          <div className="stat-icon rose">✕</div>
          <div>
            <div className="stat-value">{rejectedCount}</div>
            <div className="stat-label">Rejected</div>
          </div>
        </motion.div>
      </motion.div>

      {/* ============ FILTER BAR ============ */}
      <div className="filter-bar">
        <div className="search-box">
          <HiOutlineMagnifyingGlass className="search-icon" />
          <input
            type="text"
            placeholder="Search products…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-pills">
          {FILTER_OPTIONS.map((filter) => (
            <button
              key={filter}
              className={`filter-pill ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <Link to="/upload" className="add-btn">
          <HiOutlinePlus />
          Add Product
        </Link>
      </div>

      {/* ============ PRODUCTS GRID ============ */}
      {loading ? (
        <div className="products-grid">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <HiOutlineFunnel />
          </div>
          <h3>No products found</h3>
          <p>Try adjusting your search or filter to find what you're looking for.</p>
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
                className="product-card"
                variants={itemVariants}
                layout
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.25 }}
              >
                {product.image ? (
                  <img
                    className="product-image"
                    src={`http://localhost:8080/uploads/${product.image}`}
                    alt={product.name}
                  />
                ) : (
                  <div className="product-image-placeholder">📷</div>
                )}

                <div className="product-body">
                  <div className="product-name">{product.name}</div>
                  <div className="product-category">
                    {product.category?.name || 'Uncategorized'}
                  </div>

                  <div className="product-meta">
                    <span className="product-price">
                      {product.price?.toLocaleString()} VND
                    </span>
                    <span className="product-qty">
                      Qty: {product.quantity ?? 0}
                    </span>
                  </div>

                  <span
                    className={`product-status ${STATUS_STYLE_MAP[product.status] || ''}`}
                  >
                    {STATUS_LABEL_MAP[product.status] || product.status}
                  </span>

                  <div className="product-actions">
                    <Link
                      to={`/products/edit/${product.id}`}
                      className="action-btn"
                    >
                      <HiOutlinePencilSquare /> Edit
                    </Link>
                    <button className="action-btn" onClick={() => handleToggleHide(product)}>
                      {product.status === 'HIDDEN' ? (
                        <>
                          <HiOutlineEye /> Show
                        </>
                      ) : (
                        <>
                          <HiOutlineEyeSlash /> Hide
                        </>
                      )}
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => openDeleteModal(product)}
                    >
                      <HiOutlineTrash /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ============ DELETE MODAL ============ */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-title">Are you sure?</div>
              <p className="modal-text">
                You are about to delete{' '}
                <strong style={{ color: '#f1f5f9' }}>
                  {selectedProduct?.name}
                </strong>
                . This action cannot be undone.
              </p>
              <div className="modal-actions">
                <button
                  className="modal-btn cancel"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button className="modal-btn confirm" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProductList;
