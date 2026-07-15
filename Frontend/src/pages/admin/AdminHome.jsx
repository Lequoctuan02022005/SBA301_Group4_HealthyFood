import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getKpis, getUsers } from "../../services/userService";

const AdminHome = () => {
    const [kpis, setKpis] = useState({ totalUsers: 0, totalSellers: 0, totalCustomers: 0 });
    const [recentUsers, setRecentUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const kpiRes = await getKpis();
                setKpis(kpiRes.data);

                // Fetch latest 5 users, sorted by createdAt desc
                const usersRes = await getUsers({ size: 5, sort: "createdAt,desc" });
                setRecentUsers(usersRes.data.content || []);
            } catch (err) {
                console.error(err);
                setError("Failed to fetch dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="p-4 text-center">Loading dashboard...</div>;

    return (
        <div>
            {/* Page head */}
            <div className="page-head">
                <div>
                    <h1 className="title">Admin Home</h1>
                    <p className="subtitle">Tổng quan &amp; hoạt động gần đây</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <Link className="tab active" to="/admin/adminhome">Home</Link>
                <Link className="tab" to="/admin/users">Accounts</Link>
            </div>

            {error && <div className="flash flash-error">{error}</div>}

            {/* KPIs */}
            <div className="kpis">
                <div className="kpi">
                    <div className="label">Total Users</div>
                    <div className="value">{kpis.totalUsers}</div>
                </div>
                <div className="kpi">
                    <div className="label">Total Sellers</div>
                    <div className="value">{kpis.totalSellers}</div>
                </div>
                <div className="kpi">
                    <div className="label">Total Customers</div>
                    <div className="value">{kpis.totalCustomers}</div>
                </div>
            </div>

            {/* Latest registrations */}
            <div className="section mt-4">
                <div className="card">
                    <div className="card-head">
                        <h3 className="card-title">User đăng ký mới nhất</h3>
                        <Link className="btn" to="/admin/users">Xem tất cả</Link>
                    </div>

                    {recentUsers.length === 0 ? (
                        <div className="empty">Chưa có dữ liệu</div>
                    ) : (
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: '90px' }}>ID</th>
                                        <th>Email</th>
                                        <th>Full name</th>
                                        <th style={{ width: '140px' }}>Role</th>
                                        <th style={{ width: '140px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentUsers.map(u => (
                                        <tr key={u.accountId || u.id}>
                                            <td className="small">{u.accountId || u.id}</td>
                                            <td>{u.email}</td>
                                            <td>{u.fullName || "-"}</td>
                                            <td>
                                                <span className={`badge ${u.role ? 'role' : ''}`}>
                                                    {u.role || "N/A"}
                                                </span>
                                            </td>
                                            <td>
                                                <Link className="btn view" to={`/admin/users/${u.accountId || u.id}`}>View</Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminHome;
