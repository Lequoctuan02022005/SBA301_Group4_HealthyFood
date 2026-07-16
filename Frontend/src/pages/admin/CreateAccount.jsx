import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUser } from "../../services/userService";

const CreateAccount = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        password: "",
        role: "CUSTOMER"
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        
        // Basic frontend validation matching backend
        if (!formData.fullName || !formData.email || !formData.phone || !formData.address || !formData.password) {
            setError("Vui lòng nhập đầy đủ thông tin!");
            return;
        }
        
        if (!formData.email.includes("@")) {
            setError("Email không hợp lệ! Vui lòng nhập đúng định dạng.");
            return;
        }

        setLoading(true);
        try {
            await createUser(formData);
            // Redirect with success state
            navigate("/admin/users", { state: { message: "Account created successfully" } });
        } catch (err) {
            console.error(err);
            // Server throws 400 with string message from ExceptionHandler
            setError(err.response?.data || "Failed to create account. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4" style={{ maxWidth: "600px" }}>
            <h2 className="mb-4">Tạo tài khoản mới</h2>

            {/* Hiển thị lỗi */}
            {error && <p className="text-danger fw-bold">{error}</p>}

            <div className="card p-4 shadow-sm border-0" style={{ borderRadius: "14px" }}>
                <form onSubmit={handleSubmit}>
                    {/* Full name */}
                    <label className="form-label fw-bold">Tên đăng nhập</label>
                    <input 
                        name="fullName" 
                        placeholder="Nhập tên" 
                        className="form-control mb-3"
                        value={formData.fullName}
                        onChange={handleChange}
                    />

                    {/* Email */}
                    <label className="form-label fw-bold">Email</label>
                    <input 
                        name="email" 
                        type="email" 
                        placeholder="example@gmail.com" 
                        className="form-control mb-3"
                        value={formData.email}
                        onChange={handleChange}
                    />

                    {/* Phone */}
                    <label className="form-label fw-bold">Số điện thoại</label>
                    <input 
                        name="phone" 
                        placeholder="0xxxxxxxxx" 
                        className="form-control mb-3"
                        value={formData.phone}
                        onChange={handleChange}
                    />

                    {/* Address */}
                    <label className="form-label fw-bold">Địa chỉ</label>
                    <input 
                        name="address" 
                        placeholder="Nhập địa chỉ" 
                        className="form-control mb-3"
                        value={formData.address}
                        onChange={handleChange}
                    />

                    {/* Password */}
                    <label className="form-label fw-bold">Mật khẩu</label>
                    <input 
                        name="password" 
                        type="password" 
                        placeholder="Nhập mật khẩu" 
                        className="form-control mb-3"
                        value={formData.password}
                        onChange={handleChange}
                    />

                    {/* Role */}
                    <label className="form-label fw-bold">Vai trò</label>
                    <select 
                        name="role" 
                        className="form-select mb-4"
                        value={formData.role}
                        onChange={handleChange}
                    >
                        <option value="ADMIN">ADMIN</option>
                        <option value="SELLER">SELLER</option>
                        <option value="MODERATOR">MODERATOR</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="CUSTOMER">CUSTOMER</option>
                    </select>

                    {/* Buttons */}
                    <button type="submit" className="btn btn-primary w-100 mb-2" disabled={loading}>
                        {loading ? "Đang xử lý..." : "Tạo tài khoản"}
                    </button>
                    <Link className="btn btn-secondary w-100" to="/admin/users">Hủy</Link>
                </form>
            </div>
        </div>
    );
};

export default CreateAccount;
