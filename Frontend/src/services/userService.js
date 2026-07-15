import api from "../api/axios";

export const getUsers = () => {
    return api.get("/admin/users");
};

export const getUser = (id) => {
    return api.get(`/admin/users/${id}`);
};

export const updateRole = (id, role) => {
    return api.put(`/admin/users/${id}/role?role=${role}`);
};

export const updateStatus = (id) => {
    return api.put(`/admin/users/${id}/status`);
};