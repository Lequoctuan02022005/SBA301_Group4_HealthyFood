import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineMagnifyingGlass,
  HiOutlineArrowLeft,
} from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import {
  getManagerCategories,
  createManagerCategory,
  updateManagerCategory,
  deleteManagerCategory,
} from '../../services/api';
import './CategoryManagement.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
};

function CategoryManagement() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('PRODUCT');
  const [status, setStatus] = useState('ACTIVATE');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await getManagerCategories();
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setType('PRODUCT');
    setStatus('ACTIVATE');
    setModalOpen(true);
  };

  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setName(category.name || '');
    setDescription(category.description || '');
    setType(category.type || 'PRODUCT');
    setStatus(category.status || 'ACTIVATE');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.warning('Tên danh mục không được trống');
      return;
    }

    const payload = { name, description, type, status };

    try {
      if (editingCategory) {
        await updateManagerCategory(editingCategory.id, payload);
        toast.success(`Đã cập nhật danh mục "${name}"`);
      } else {
        await createManagerCategory(payload);
        toast.success(`Đã tạo mới danh mục "${name}"`);
      }
      setModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error(error);
      toast.error('Lưu danh mục thất bại. Vui lòng thử lại.');
    }
  };

  const handleDelete = async (id, catName) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${catName}"?`)) {
      try {
        await deleteManagerCategory(id);
        toast.success(`Đã xóa danh mục "${catName}"`);
        fetchCategories();
      } catch (error) {
        console.error(error);
        toast.error('Không thể xóa danh mục. Có thể có sản phẩm đang sử dụng danh mục này.');
      }
    }
  };

  const filteredCategories = useMemo(() => {
    return categories.filter((c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
    );
  }, [categories, search]);

  return (
    <div className="category-management">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/api/manager')}>
          <HiOutlineArrowLeft /> Dashboard
        </button>
        <h1>Category Management</h1>
        <p>Manage all product & target dietary categories in the system.</p>
      </div>

      <div className="action-bar">
        <div className="search-wrap">
          <HiOutlineMagnifyingGlass className="search-icon" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn-add" onClick={handleOpenAdd}>
          <HiOutlinePlus /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading categories...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h3>No categories found</h3>
          <p>Try refining your search or add a new category to get started.</p>
        </div>
      ) : (
        <motion.div
          className="table-wrap"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <table className="category-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <motion.tr key={category.id} variants={itemVariants}>
                  <td>#{category.id}</td>
                  <td>
                    <strong>{category.name}</strong>
                  </td>
                  <td className="col-desc">{category.description || '-'}</td>
                  <td>
                    <span className={`type-badge ${category.type?.toLowerCase()}`}>
                      {category.type}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${category.status?.toLowerCase()}`}>
                      {category.status}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="action-btn edit"
                        onClick={() => handleOpenEdit(category)}
                        title="Edit Category"
                      >
                        <HiOutlinePencilSquare />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(category.id, category.name)}
                        title="Delete Category"
                      >
                        <HiOutlineTrash />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Modal Form */}
      <AnimatePresence>
        {modalOpen && (
          <div className="modal-overlay" onClick={() => setModalOpen(false)}>
            <motion.div
              className="modal-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2>{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter category name"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter category description"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Type</label>
                    <select value={type} onChange={(e) => setType(e.target.value)}>
                      <option value="PRODUCT">PRODUCT</option>
                      <option value="TARGET">TARGET</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="PENDING">PENDING</option>
                      <option value="ACTIVATE">ACTIVATE</option>
                      <option value="DEACTIVATE">DEACTIVATE</option>
                    </select>
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit">
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CategoryManagement;
