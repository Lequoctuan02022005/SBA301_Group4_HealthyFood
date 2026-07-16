import api from "./api";

export const getKpis = () => {
    return api.get("/admin/users/kpis");
};

export const getUsers = (params) => {
    // params can contain: keyword, status, page, size, sort
    return api.get("/admin/users", { params });
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
export const createUser = (userData) => {
    return api.post("/admin/users", userData);
}
