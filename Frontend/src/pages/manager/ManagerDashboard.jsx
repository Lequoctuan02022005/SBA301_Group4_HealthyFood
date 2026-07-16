import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HiOutlineClock, HiOutlineDocumentCheck, HiOutlineUsers } from 'react-icons/hi2';
import './ManagerDashboard.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

function ManagerDashboard() {
  const navigate = useNavigate();

  return (
    <div className="manager-dashboard">
      <motion.div
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Manager Dashboard</h1>
        <p>Welcome back! Here is an overview of your management tasks.</p>
      </motion.div>

      <motion.div
        className="dashboard-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="dashboard-card"
          variants={itemVariants}
          onClick={() => navigate('/api/manager/pending-product')}
          whileHover={{ y: -5, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="card-icon pending">
            <HiOutlineClock />
          </div>
          <div className="card-content">
            <h3>Pending Products</h3>
            <p>Review and approve newly submitted products from sellers.</p>
          </div>
        </motion.div>

        {/* Placeholders for future features */}
        <motion.div
          className="dashboard-card disabled"
          variants={itemVariants}
        >
          <div className="card-icon approved">
            <HiOutlineDocumentCheck />
          </div>
          <div className="card-content">
            <h3>Approved Products</h3>
            <p>View all currently active and approved products on the platform.</p>
          </div>
        </motion.div>

        <motion.div
          className="dashboard-card disabled"
          variants={itemVariants}
        >
          <div className="card-icon users">
            <HiOutlineUsers />
          </div>
          <div className="card-content">
            <h3>Category Management</h3>
            <p>Manage category in system.</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default ManagerDashboard;
