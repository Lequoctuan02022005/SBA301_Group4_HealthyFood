import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUsers, updateRole, updateStatus } from "../../services/userService";

const AccountList = () => {
    const [accounts, setAccounts] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    
    // Filter State
    const [q, setQ] = useState("");
    const [status, setStatus] = useState("");
    const [sort, setSort] = useState("id,asc");
    const [size, setSize] = useState(10);
    const [page, setPage] = useState(0);
    
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const fixedAdminEmail = "admin@gmail.com";
    const availableRoles = ["ADMIN", "SELLER", "MODERATOR", "MANAGER", "CUSTOMER"];

    const fetchAccounts = async () => {
        setLoading(true);
        try {
            const res = await getUsers({ keyword: q, status, page, size, sort });
            setAccounts(res.data.content || []);
            setTotalPages(res.data.totalPages || 0);
            setTotalElements(res.data.totalElements || 0);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch accounts.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, [page]); // Re-fetch only when page changes natively via pager

    const handleApplyFilters = (e) => {
        e.preventDefault();
        setPage(0);
        fetchAccounts();
    };

    const handleReset = () => {
        setQ("");
        setStatus("");
        setSort("id,asc");
        setSize(10);
        setPage(0);
        setTimeout(() => fetchAccounts(), 0);
    };

    const handleRoleChange = async (e, id) => {
        e.preventDefault();
        const newRole = e.target.role.value;
        try {
            await updateRole(id, newRole);
            setMessage(`Updated role to ${newRole} for account ${id}`);
            fetchAccounts();
        } catch (err) {
            setError(err.response?.data || "Failed to update role");
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const action = currentStatus === "ACTIVE" ? "Deactivate" : "Reactivate";
        if (!window.confirm(`${action} this account?`)) return;

        try {
            await updateStatus(id);
            setMessage(`Account status updated successfully.`);
            fetchAccounts();
        } catch (err) {
            setError(err.response?.data || "Failed to update status");
        }
    };

    return (
        <div>
            <div className="page-head">
                <div>
                    <h1 className="title">Accounts</h1>
                    <p className="subtitle">Quản lý tài khoản</p>
                </div>
                <Link className="btn success" to="/admin/users/create">Create account</Link>
            </div>

            <div className="tabs">
                <Link className="tab" to="/admin/adminhome">Home</Link>
                <Link className="tab active" to="/admin/users">Accounts</Link>
            </div>

            {message && <div className="flash">{message}</div>}
            {error && <div className="flash flash-error">{error}</div>}

            <div className="card">
                <div className="card-head">
                    <h3 className="card-title">Account List</h3>

                    <form className="filters" onSubmit={handleApplyFilters}>
                        <input type="text" placeholder="Search email or name…" 
                               value={q} onChange={(e) => setQ(e.target.value)} />

                        <select value={sort} onChange={(e) => setSort(e.target.value)}>
                            <option value="id,asc">ID ↑</option>
                            <option value="id,desc">ID ↓</option>
                            <option value="email,asc">Email A–Z</option>
                            <option value="email,desc">Email Z–A</option>
                            <option value="fullName,asc">Name A–Z</option>
                            <option value="fullName,desc">Name Z–A</option>
                            <option value="createdAt,desc">Newest</option>
                            <option value="createdAt,asc">Oldest</option>
                        </select>

                        <select value={size} onChange={(e) => setSize(Number(e.target.value))}>
                            <option value={5}>5 / page</option>
                            <option value={10}>10 / page</option>
                            <option value={20}>20 / page</option>
                            <option value={50}>50 / page</option>
                        </select>

                        <select value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="">All</option>
                            <option value="ACTIVE">Active</option>
                            <option value="DEACTIVATED">Deactivated</option>
                            <option value="BANNED">Banned</option>
                        </select>

                        <button className="btn primary" type="submit">Apply</button>
                        <button className="btn" type="button" onClick={handleReset}>Reset</button>
                    </form>
                </div>

                {loading ? (
                    <div className="p-4 text-center">Loading accounts...</div>
                ) : accounts.length === 0 ? (
                    <div className="empty">No accounts found.</div>
                ) : (
                    <>
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{width: "60px"}}>ID</th>
                                        <th>Email</th>
                                        <th>Full name</th>
                                        <th>Status</th>
                                        <th>Role</th>
                                        <th>Change role</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {accounts.map(a => {
                                        const isActive = a.status === 'ACTIVE';
                                        const isFixed = a.email.toLowerCase() === fixedAdminEmail.toLowerCase();
                                        const aId = a.accountId || a.id;

                                        return (
                                            <tr key={aId}>
                                                <td className="small">{aId}</td>
                                                <td>{a.email}</td>
                                                <td>{a.fullName || "-"}</td>
                                                <td>
                                                    <span className={`badge ${isActive ? 'status-active' : 'status-deactivated'}`}>
                                                        {a.status || 'N/A'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${a.role ? 'role' : ''}`}>
                                                        {a.role || 'N/A'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <form className="inline" onSubmit={(e) => handleRoleChange(e, aId)}>
                                                        <select name="role" defaultValue={a.role} disabled={isFixed}>
                                                            {availableRoles.map(r => (
                                                                <option key={r} value={r}>{r}</option>
                                                            ))}
                                                        </select>
                                                        <button className="btn primary" type="submit" disabled={isFixed}>Update</button>
                                                    </form>
                                                </td>
                                                <td>
                                                    <div className="inline">
                                                        <Link className="btn ghost" to={`/admin/users/${aId}`}>View</Link>
                                                        <button 
                                                            className={`btn ${isActive ? 'danger' : 'success'}`} 
                                                            onClick={() => handleToggleStatus(aId, a.status)}
                                                            disabled={isFixed}
                                                        >
                                                            {isActive ? 'Deactivate' : 'Activate'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="pager">
                            <div className="subtitle">Showing page {page + 1} of {totalPages}</div>
                            <ul className="pagination">
                                <li>
                                    <button disabled={page === 0} onClick={() => setPage(page - 1)}>&laquo; Prev</button>
                                </li>
                                <li>
                                    <span style={{ cursor: "default" }}>Page {page + 1} / {totalPages || 1} • Total {totalElements}</span>
                                </li>
                                <li>
                                    <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next &raquo;</button>
                                </li>
                            </ul>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AccountList;