import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineCloudArrowUp,
  HiOutlinePhoto,
  HiOutlineXMark,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../services/api';
import './UploadProduct.css';

const categories = [
  { id: 1, name: 'Organic Foods' },
  { id: 2, name: 'Protein & Supplements' },
  { id: 3, name: 'Fresh Fruits & Vegetables' },
  { id: 4, name: 'Healthy Snacks' },
  { id: 5, name: 'Beverages' },
  { id: 6, name: 'Dairy & Alternatives' },
];

const UploadProduct = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ingredient: '',
    nutritionInfo: '',
    price: '',
    quantity: '',
    categoryId: '',
    sellerId: '2',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  /* ─── Image handlers ─── */
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const processFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Image size must be less than 5MB.');
      setErrors((prev) => ({ ...prev, image: 'Image size must be less than 5MB.' }));
      return;
    }
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, image: undefined }));
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* ─── Form helpers ─── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  /* ─── Real-time validation on blur ─── */
  const handleBlur = (e) => {
    const { name, value } = e.target;
    const fieldError = validateField(name, value);
    if (fieldError) {
      setErrors((prev) => ({ ...prev, [name]: fieldError }));
    }
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value || value.trim().length < 3)
          return 'Product name must be at least 3 characters.';
        if (value.trim().length > 100)
          return 'Product name must be less than 100 characters.';
        return null;
      case 'price':
        if (!value || Number(value) <= 0)
          return 'Price must be greater than 0.';
        if (Number(value) > 100000000)
          return 'Price cannot exceed 100,000,000 VND.';
        return null;
      case 'quantity':
        if (value === '' || Number(value) < 0)
          return 'Quantity must be 0 or more.';
        if (Number(value) > 99999)
          return 'Quantity cannot exceed 99,999.';
        if (!Number.isInteger(Number(value)))
          return 'Quantity must be a whole number.';
        return null;
      case 'categoryId':
        if (!value) return 'Please select a category.';
        return null;
      case 'description':
        if (value && value.length > 2000)
          return 'Description must be less than 2000 characters.';
        return null;
      default:
        return null;
    }
  };

  const validate = () => {
    const errs = {};

    // Image
    if (!image) errs.image = 'Product image is required.';

    // Name
    const nameErr = validateField('name', formData.name);
    if (nameErr) errs.name = nameErr;

    // Price
    const priceErr = validateField('price', formData.price);
    if (priceErr) errs.price = priceErr;

    // Quantity
    const quantityErr = validateField('quantity', formData.quantity);
    if (quantityErr) errs.quantity = quantityErr;

    // Category
    const categoryErr = validateField('categoryId', formData.categoryId);
    if (categoryErr) errs.categoryId = categoryErr;

    // Description (optional but has max length)
    const descErr = validateField('description', formData.description);
    if (descErr) errs.description = descErr;

    return errs;
  };

  /* ─── Submit ─── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Show toast with error count
      const errorCount = Object.keys(validationErrors).length;
      toast.error(`Please fix ${errorCount} error${errorCount > 1 ? 's' : ''} before submitting.`);
      // Scroll to first error
      const firstErrorField = document.querySelector('.form-input.error, .form-textarea.error, .form-select.error, .upload-zone.has-error');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    setLoading(true);
    try {
      const data = new FormData();
      data.append('image', image);
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('ingredient', formData.ingredient);
      data.append('nutritionInfo', formData.nutritionInfo);
      data.append('price', formData.price);
      data.append('quantity', formData.quantity);
      data.append('categoryId', formData.categoryId);
      data.append('sellerId', formData.sellerId);
      await createProduct(data);
      setShowSuccess(true);
      toast.success('Product uploaded successfully!');
      setTimeout(() => navigate('/products'), 2000);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to upload product. Please try again.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  /* ─── Derived values for preview ─── */
  const selectedCategory = categories.find(
    (c) => String(c.id) === String(formData.categoryId)
  );
  const formattedPrice = formData.price
    ? Number(formData.price).toLocaleString('vi-VN')
    : '0';

  /* ─── Render ─── */
  return (
    <motion.div
      className="upload-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Page header */}
      <div className="upload-header">
        <h1 className="upload-title">Create New Product</h1>
        <p className="upload-subtitle">
          Fill in the details below to list a new healthy product.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="upload-layout">
        {/* ════════════════ LEFT — Form ════════════════ */}
        <div className="upload-form-col">
          {/* Image upload zone */}
          <div className="form-section">
            <h3 className="section-title">
              <HiOutlinePhoto /> Product Image
            </h3>

            <div
              className={`upload-zone${dragOver ? ' drag-over' : ''}${
                errors.image ? ' has-error' : ''
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleImageDrop}
            >
              {imagePreview ? (
                <div className="image-preview-container">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="image-preview"
                  />
                  <button
                    type="button"
                    className="image-remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage();
                    }}
                  >
                    <HiOutlineXMark />
                  </button>
                </div>
              ) : (
                <>
                  <div className="upload-zone-icon">
                    <HiOutlineCloudArrowUp />
                  </div>
                  <p className="upload-zone-text">
                    Drag &amp; drop your image here
                  </p>
                  <p className="upload-zone-text">or click to browse</p>
                  <p className="upload-zone-hint">
                    PNG, JPG or WEBP — max 5 MB
                  </p>
                </>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
            </div>
            {errors.image && <p className="form-error">{errors.image}</p>}
          </div>

          {/* Product details */}
          <div className="form-section">
            <h3 className="section-title">Product Details</h3>

            <div className="form-group">
              <label className="form-label">Product Name <span className="required">*</span></label>
              <input
                type="text"
                name="name"
                className={`form-input${errors.name ? ' error' : ''}`}
                placeholder="Enter product name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={100}
              />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className={`form-textarea${errors.description ? ' error' : ''}`}
                placeholder="Describe your product..."
                rows={4}
                value={formData.description}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={2000}
              />
              {formData.description && (
                <span className="char-count">{formData.description.length}/2000</span>
              )}
              {errors.description && <p className="form-error">{errors.description}</p>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Price (VND) <span className="required">*</span></label>
                <input
                  type="number"
                  name="price"
                  className={`form-input${errors.price ? ' error' : ''}`}
                  placeholder="0"
                  min="1"
                  max="100000000"
                  value={formData.price}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.price && <p className="form-error">{errors.price}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Quantity <span className="required">*</span></label>
                <input
                  type="number"
                  name="quantity"
                  className={`form-input${errors.quantity ? ' error' : ''}`}
                  placeholder="0"
                  min="0"
                  max="99999"
                  step="1"
                  value={formData.quantity}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.quantity && (
                  <p className="form-error">{errors.quantity}</p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Category <span className="required">*</span></label>
              <select
                name="categoryId"
                className={`form-select${errors.categoryId ? ' error' : ''}`}
                value={formData.categoryId}
                onBlur={handleBlur}
                onChange={handleChange}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="form-error">{errors.categoryId}</p>
              )}
            </div>
          </div>

          {/* Nutrition info */}
          <div className="form-section">
            <h3 className="section-title">Nutrition Information</h3>

            <div className="form-group">
              <label className="form-label">Ingredients</label>
              <textarea
                name="ingredient"
                className="form-textarea"
                placeholder="List ingredients..."
                rows={3}
                value={formData.ingredient}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nutrition Info</label>
              <textarea
                name="nutritionInfo"
                className="form-textarea"
                placeholder="Nutritional information..."
                rows={3}
                value={formData.nutritionInfo}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Submit */}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? <span className="spinner" /> : <HiOutlineCloudArrowUp />}
            <span>{loading ? 'Uploading...' : 'Upload Product'}</span>
          </button>
        </div>

        {/* ════════════════ RIGHT — Live Preview ════════════════ */}
        <div className="preview-section">
          <div className="preview-card">
            <div className="preview-header">Live Preview</div>

            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Product preview"
                className="preview-image"
              />
            ) : (
              <div className="preview-image-placeholder">
                <HiOutlinePhoto />
              </div>
            )}

            <div className="preview-body">
              <p className="preview-name">
                {formData.name || 'Product Name'}
              </p>
              <p className="preview-category">
                {selectedCategory ? selectedCategory.name : 'Category'}
              </p>
              <p className="preview-price">{formattedPrice} VND</p>

              {formData.quantity && (
                <p className="preview-qty">
                  Stock: <span>{formData.quantity}</span>
                </p>
              )}

              <span className="preview-badge pending">PENDING</span>

              {formData.description && (
                <p className="preview-desc">{formData.description}</p>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* ════════════════ Success Overlay ════════════════ */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="success-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="success-icon"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            >
              <HiOutlineCheckCircle />
            </motion.div>
            <p className="success-title">Product Uploaded Successfully!</p>
            <p className="success-subtitle">Redirecting to products...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UploadProduct;
