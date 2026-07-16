import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getReportById, updateReportStatus } from "../../services/reportService";

function ReportDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [managerComment, setManagerComment] = useState("");

    useEffect(() => {
        loadReport();
    }, [id]);

    const loadReport = async () => {
        setLoading(true);
        try {
            const res = await getReportById(id);
            setReport(res.data);
            setManagerComment(res.data.managerComment || "");
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (status) => {
        if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this report?`)) return;
        
        try {
            await updateReportStatus(id, status, managerComment);
            alert(`Report ${status.toLowerCase()} successfully.`);
            navigate("/admin/reports");
        } catch (error) {
            console.error(error);
            alert("Failed to update status.");
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!report) return <div>Report not found</div>;

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Report Detail #{report.id}</h2>
                <Link to="/admin/reports" className="btn btn-secondary">
                    Back to List
                </Link>
            </div>

            <div className="card shadow-sm mb-4">
                <div className="card-header bg-dark text-white">
                    General Information
                </div>
                <div className="card-body">
                    <p><strong>Status:</strong> <span className="badge bg-primary">{report.status}</span></p>
                    <p><strong>Reason:</strong> {report.reason}</p>
                    <p><strong>Description:</strong> {report.description}</p>
                    <p><strong>Is Request Refund:</strong> {report.isRequestRefund ? "Yes" : "No"}</p>
                    <p><strong>Product ID:</strong> {report.product?.id} - {report.product?.name}</p>
                    <p><strong>Customer ID:</strong> {report.customer?.id} - {report.customer?.email}</p>
                    <p><strong>Seller ID:</strong> {report.seller?.id} - {report.seller?.email}</p>
                    <p><strong>Resolved At:</strong> {report.resolvedAt ? new Date(report.resolvedAt).toLocaleString() : "N/A"}</p>
                </div>
            </div>

            <div className="card shadow-sm mb-4">
                <div className="card-header bg-dark text-white">
                    Manager Review
                </div>
                <div className="card-body">
                    <div className="mb-3">
                        <label className="form-label">Manager Comment:</label>
                        <textarea 
                            className="form-control" 
                            rows="3" 
                            value={managerComment}
                            onChange={(e) => setManagerComment(e.target.value)}
                            disabled={report.status !== "PENDING"}
                        ></textarea>
                    </div>
                    {report.status === "PENDING" && (
                        <div>
                            <button 
                                className="btn btn-success me-2"
                                onClick={() => handleUpdateStatus("APPROVED")}
                            >
                                Approve Report
                            </button>
                            <button 
                                className="btn btn-danger"
                                onClick={() => handleUpdateStatus("REJECTED")}
                            >
                                Reject Report
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ReportDetail;
