import api from "./api";

export const getReports = (params) => {
    return api.get("/admin/reports", { params });
};

export const getReportById = (id) => {
    return api.get(`/admin/reports/${id}`);
};

export const updateReportStatus = (id, status, managerComment) => {
    return api.put(`/admin/reports/${id}/status`, null, {
        params: { status, managerComment }
    });
};
