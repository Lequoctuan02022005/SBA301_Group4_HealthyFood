import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import "./admin.css";

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Determine the active tab based on the current path
    const isHome = location.pathname === "/admin/adminhome";
    const isAccounts = location.pathname.startsWith("/admin/users");

    const handleLogout = (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="admin-body">
            {/* Header mini riêng cho Admin */}
            <div className="admin-header sticky-top shadow-sm">
                <div className="container-fluid py-3 d-flex justify-content-between align-items-center px-4">
                    {/* Brand */}
                    <Link className="brand-logo fw-bold d-flex align-items-center gap-2 text-decoration-none" to="/admin/adminhome">
                        <i className="bi bi-speedometer2"></i>
                        <span>Admin</span>
                    </Link>

                    {/* Actions */}
                    <div className="d-flex align-items-center gap-2">
                        <span 
                            onClick={handleLogout} 
                            className="nav-link text-danger fw-semibold" 
                            style={{ cursor: "pointer" }}
                        >
                            Logout
                        </span>
                    </div>
                </div>
            </div>

            <main className="admin-content">
                <div className="wrap">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
