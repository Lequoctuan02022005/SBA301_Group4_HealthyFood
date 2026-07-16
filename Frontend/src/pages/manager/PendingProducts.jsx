import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { getPendingProducts } from '../../services/api.js';
import './PendingProductList.css';

const containerVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: 'easeOut',
    },
  },
};

function PendingProductList() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPendingProducts = async () => {
      setLoading(true);

      try {
        const response = await getPendingProducts();

        const productData = Array.isArray(response.data)
          ? response.data
          : response.data?.content || [];

        setProducts(productData);
      } catch (error) {
        console.error('Failed to load pending products:', error);
        toast.error('Failed to load pending products');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return products;
    }

    return products.filter((product) => {
      const productName = product.name?.toLowerCase() || '';
      const categoryName = product.category?.name?.toLowerCase() || '';
      const sellerEmail = product.seller?.email?.toLowerCase() || '';

      return (
        productName.includes(normalizedSearch) ||
        categoryName.includes(normalizedSearch) ||
        sellerEmail.includes(normalizedSearch)
      );
    });
  }, [products, searchTerm]);

  const handleViewDetail = (productId) => {
    navigate(`/api/manager/pending-product/${productId}`);
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) {
      return '0 VND';
    }

    return `${Number(price).toLocaleString('vi-VN')} VND`;
  };

  const getProductImageUrl = (image) => {
    if (!image) {
      return null;
    }

    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }

    return `http://localhost:8080/uploads/${image}`;
  };

  const SkeletonCard = () => (
    <div className="pending-product-skeleton-card">
      <div className="pending-product-skeleton-image" />

      <div className="pending-product-skeleton-content">
        <div className="pending-product-skeleton-line large" />
        <div className="pending-product-skeleton-line medium" />
        <div className="pending-product-skeleton-line small" />
      </div>
    </div>
  );

  return (
    <div className="pending-product-page">
      <motion.header
        className="pending-product-header"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1>Pending Product Review</h1>

          <p>
            Select a product to view its full information before approving or
            rejecting it.
          </p>
        </div>
      </motion.header>

      <motion.section
        className="pending-product-statistics"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <div className="pending-product-stat-card">
          <div className="pending-product-stat-icon">⏳</div>

          <div>
            <div className="pending-product-stat-value">
              {products.length}
            </div>

            <div className="pending-product-stat-label">
              Pending Review
            </div>
          </div>
        </div>
      </motion.section>

      <section className="pending-product-search-section">
        <div className="pending-product-search-box">
          <HiOutlineMagnifyingGlass />

          <input
            type="text"
            placeholder="Search by product, category, or seller..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </section>

      {loading ? (
        <div className="pending-product-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="pending-product-empty-state">
          <div className="pending-product-empty-icon">
            {searchTerm ? '🔍' : '🎉'}
          </div>

          <h2>
            {searchTerm
              ? 'No matching products found'
              : 'No pending products'}
          </h2>

          <p>
            {searchTerm
              ? 'Try searching with another product name, category, or seller.'
              : 'All submitted products have been reviewed.'}
          </p>
        </div>
      ) : (
        <motion.div
          className="pending-product-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredProducts.map((product) => {
            const imageUrl = getProductImageUrl(product.image);

            return (
              <motion.article
                key={product.id}
                className="pending-product-card"
                variants={itemVariants}
                whileHover={{
                  y: -5,
                }}
              >
                <div className="pending-product-image-container">
                  {imageUrl ? (
                    <img
                      className="pending-product-image"
                      src={imageUrl}
                      alt={product.name || 'Product'}
                      onError={(event) => {
                        event.currentTarget.style.display = 'none';

                        const placeholder =
                          event.currentTarget.nextElementSibling;

                        if (placeholder) {
                          placeholder.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}

                  <div
                    className="pending-product-image-placeholder"
                    style={{
                      display: imageUrl ? 'none' : 'flex',
                    }}
                  >
                    📷
                  </div>

                  <span className="pending-product-status">
                    {product.status || 'PENDING'}
                  </span>
                </div>

                <div className="pending-product-content">
                  <div className="pending-product-title-section">
                    <h2>{product.name || 'Unnamed product'}</h2>

                    <p>
                      {product.category?.name || 'Uncategorized'}
                    </p>
                  </div>

                  <div className="pending-product-information">
                    <div className="pending-product-information-item">
                      <span>Price</span>
                      <strong>{formatPrice(product.price)}</strong>
                    </div>

                    <div className="pending-product-information-item">
                      <span>Quantity</span>
                      <strong>{product.quantity ?? 0}</strong>
                    </div>

                    <div className="pending-product-information-item seller">
                      <span>Seller</span>
                      <strong>
                        {product.seller?.email || 'Unknown seller'}
                      </strong>
                    </div>
                  </div>

                  <p className="pending-product-description">
                    {product.description
                      ? `${product.description.substring(0, 120)}${
                          product.description.length > 120 ? '...' : ''
                        }`
                      : 'No description provided.'}
                  </p>

                  <button
                    type="button"
                    className="pending-product-view-button"
                    onClick={() => handleViewDetail(product.id)}
                  >
                    View Details
                  </button>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

export default PendingProductList;