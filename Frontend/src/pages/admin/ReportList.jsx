import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getReports, updateReportStatus } from "../../services/reportService";

function ReportList() {
    const [reports, setReports] = useState([]);
    const [statusFilter, setStatusFilter] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        setLoading(true);
        try {
            const res = await getReports();
            setReports(res.data.content || []);
        } catch (error) {
            console.error("Failed to fetch reports", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        if (!window.confirm(`Are you sure you want to change status to ${status}?`)) return;
        
        try {
            await updateReportStatus(id, status, "");
            loadReports();
        } catch (error) {
            console.error(error);
            alert("Failed to update status.");
        }
    };

    const filteredReports = reports.filter(r => 
        statusFilter === "" || r.status === statusFilter
    );

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Report Management</h2>
            </div>
            
            <div className="row mb-3">
                <div className="col-md-3">
                    <select
                        className="form-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="PENDING">PENDING</option>
                        <option value="APPROVED">APPROVED</option>
                        <option value="REJECTED">REJECTED</option>
                    </select>
                </div>
            </div>

            <table className="table table-bordered table-hover">
                <thead className="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Product ID</th>
                        <th>Customer ID</th>
                        <th>Seller ID</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan="7" className="text-center">Loading...</td></tr>
                    ) : filteredReports.length === 0 ? (
                        <tr><td colSpan="7" className="text-center">No reports found.</td></tr>
                    ) : (
                        filteredReports.map(report => (
                            <tr key={report.id}>
                                <td>{report.id}</td>
                                <td>{report.product?.id}</td>
                                <td>{report.customer?.id}</td>
                                <td>{report.seller?.id}</td>
                                <td>{report.reason}</td>
                                <td>
                                    <span className={`badge bg-${
                                        report.status === "PENDING" ? "warning text-dark" : 
                                        report.status === "APPROVED" ? "success" : "danger"
                                    }`}>
                                        {report.status}
                                    </span>
                                </td>
                                <td>
                                    <Link to={`/admin/reports/${report.id}`} className="btn btn-primary btn-sm me-2">
                                        Detail
                                    </Link>
                                    {report.status === "PENDING" && (
                                        <>
                                            <button 
                                                className="btn btn-success btn-sm me-2"
                                                onClick={() => handleUpdateStatus(report.id, "APPROVED")}
                                            >
                                                Approve
                                            </button>
                                            <button 
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleUpdateStatus(report.id, "REJECTED")}
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default ReportList;
