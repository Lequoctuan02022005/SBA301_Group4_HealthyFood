import React from "react";

function ConfirmModal({ show, title, message, onConfirm, onCancel }) {
    if (!show) return null;

    return (
        <>
            <div className="modal-backdrop fade show"></div>
            <div className="modal fade show d-block" tabIndex="-1" role="dialog">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content shadow">
                        <div className="modal-header bg-danger text-white">
                            <h5 className="modal-title">{title}</h5>
                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                onClick={onCancel}
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body">
                            <p className="mb-0 fs-5">{message}</p>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary px-4"
                                onClick={onCancel}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger px-4"
                                onClick={onConfirm}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ConfirmModal;
