import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getUser, updateRole, updateStatus } from "../../services/userService";

const AccountDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [acc, setAcc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const fixedAdminEmail = "admin@gmail.com";
    const availableRoles = ["ADMIN", "SELLER", "MODERATOR", "MANAGER", "CUSTOMER"];

    const fetchUser = async () => {
        try {
            const res = await getUser(id);
            setAcc(res.data);
        } catch (err) {
            console.error(err);
            setError("User not found or failed to load");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, [id]);

    const handleRoleChange = async (e) => {
        e.preventDefault();
        const newRole = e.target.role.value;
        try {
            await updateRole(id, newRole);
            setMessage(`Updated role to ${newRole}`);
            fetchUser();
        } catch (err) {
            setError(err.response?.data || "Failed to update role");
        }
    };

    const handleToggleStatus = async () => {
        const action = acc.status === "ACTIVE" ? "Deactivate" : "Activate";
        if (!window.confirm(`${action} this account?`)) return;

        try {
            await updateStatus(id);
            setMessage(`Account status updated successfully.`);
            fetchUser();
        } catch (err) {
            setError(err.response?.data || "Failed to update status");
        }
    };

    if (loading) return <div className="p-4 text-center">Loading account detail...</div>;
    if (!acc) return <div className="p-4 text-center text-danger">{error}</div>;

    const isActive = acc.status === "ACTIVE";
    const isFixed = acc.email?.toLowerCase() === fixedAdminEmail.toLowerCase();

    // Format Date securely
    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleString("en-GB", {
            day: "2-digit", month: "2-digit", year: "numeric", 
            hour: "2-digit", minute: "2-digit"
        });
    };

    return (
        <div>
            <p className="breadcrumb">
                <Link to="/admin/users">← Back to list</Link>
            </p>

            {message && <div className="flash">{message}</div>}
            {error && <div className="flash flash-error">{error}</div>}

            <div className="page-head">
                <div>
                    <h1 className="title">Account detail</h1>
                    <p className="subtitle">Thông tin người dùng &amp; thao tác quản trị.</p>
                </div>
            </div>

            <div className="grid">
                {/* LEFT: INFO */}
                <section className="card">
                    <div className="card-head">
                        <h3 className="card-title">Thông tin tài khoản</h3>
                    </div>

                    <div className="card-body">
                        <dl className="dl">
                            <dt>ID</dt>
                            <dd className="mono">{acc.id || acc.accountId}</dd>

                            <dt>Email</dt>
                            <dd className="mono">{acc.email}</dd>

                            <dt>Full name</dt>
                            <dd>{acc.fullName || "—"}</dd>

                            <dt>Phone</dt>
                            <dd>{acc.phone || "—"}</dd>

                            <dt>Address</dt>
                            <dd>{acc.address || "—"}</dd>

                            <dt>Role</dt>
                            <dd>
                                <span className={`badge ${acc.role ? 'role' : 'muted'}`}>
                                    {acc.role || "N/A"}
                                </span>
                            </dd>

                            <dt>Status</dt>
                            <dd>
                                <span className={`badge ${isActive ? 'status-active' : 'status-deactivated'}`}>
                                    {acc.status || "N/A"}
                                </span>
                            </dd>

                            <dt>Verified</dt>
                            <dd>
                                {acc.emailVerified ? (
                                    <span className="badge verify">Verified</span>
                                ) : (
                                    <span className="muted">Not verified</span>
                                )}
                            </dd>

                            <dt>Created</dt>
                            <dd>{formatDate(acc.createdAt)}</dd>

                            <dt>Updated</dt>
                            <dd>{formatDate(acc.updatedAt)}</dd>
                        </dl>
                    </div>
                </section>

                {/* RIGHT: ACTIONS */}
                <aside className="card">
                    <div className="card-head">
                        <h3 className="card-title">Thao tác</h3>
                    </div>
                    
                    <div className="card-body">
                        <div>
                            <p className="muted" style={{ margin: "0 0 6px" }}>Đổi vai trò</p>
                            <form className="inline" style={{ flexWrap: "wrap" }} onSubmit={handleRoleChange}>
                                <select name="role" defaultValue={acc.role} disabled={isFixed} style={{ flex: 1 }}>
                                    {availableRoles.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                                <button className="btn primary" type="submit" disabled={isFixed}>Update</button>
                            </form>
                            <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "16px 0" }} />
                        </div>

                        <div className="actions-list">
                            <button className="btn ghost" onClick={fetchUser}>
                                Refresh
                            </button>

                            <button 
                                className={`btn ${isActive ? 'danger' : 'success'}`}
                                onClick={handleToggleStatus}
                                disabled={isFixed}
                            >
                                {isActive ? 'Deactivate account' : 'Activate account'}
                            </button>
                        </div>

                        {isFixed && (
                            <p className="muted mt-3" style={{ fontSize: "12px" }}>
                                Không thể thay đổi tài khoản ADMIN cố định.
                            </p>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default AccountDetail;