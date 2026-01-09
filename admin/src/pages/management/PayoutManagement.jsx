import React, { useEffect, useState } from "react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import Topnav from "../../components/Topnav";
import ManagementNavLinks from "../../components/ManagementNavLinks";
import {
  getRequest,
  postRequest,
} from "../../services/apiServices";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function PayoutManagement() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const [showViewModal, setShowViewModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [rejectReason, setRejectReason] = useState("");
  const [approveNote, setApproveNote] = useState("");

  const [filterStatus, setFilterStatus] = useState("");

  // Apply filter
  const filteredData = payouts.filter((p) =>
    filterStatus ? p.status === filterStatus : true
  );

  const currentPageData = filteredData;

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
    setPage(1);
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const fetchData = async (pageNum) => {
    setLoading(true);
    try {
      const res = await getRequest(
        `/payouts?page=${pageNum}&limit=${pageSize}`
      );
      const dataArray = res.data?.results?.Data?.data || res.data?.results?.Data || [];
      const lastPage = res.data?.results?.Data?.last_page || res.data?.results?.last_page || 1;
      
      setPayouts(dataArray);
      setTotalPages(lastPage);
    } catch (err) {
      console.error("Failed to fetch payouts:", err);
      toast.error("Failed to load payout requests");
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (item) => {
    try {
      const res = await getRequest(`/payouts/${item.id}`);
      setSelectedItem(res.data?.results?.Data || item);
      setShowViewModal(true);
    } catch (err) {
      console.error("Failed to fetch payout details:", err);
      setSelectedItem(item);
      setShowViewModal(true);
    }
  };

  const handleApprove = (item) => {
    setSelectedItem(item);
    setApproveNote("");
    setShowApproveModal(true);
  };

  const handleReject = (item) => {
    setSelectedItem(item);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const handleSubmitApprove = async (e) => {
    e.preventDefault();

    try {
      await postRequest(`/payouts/${selectedItem.id}/approve`, {
        admin_note: approveNote
      });
      toast.success("Payout approved successfully");
      setShowApproveModal(false);
      fetchData(page);
    } catch (err) {
      console.error("Failed to approve payout:", err);
      toast.error(err.response?.data?.message || "Failed to approve payout");
    }
  };

  const handleSubmitReject = async (e) => {
    e.preventDefault();

    if (!rejectReason) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      await postRequest(`/payouts/${selectedItem.id}/reject`, {
        rejection_reason: rejectReason
      });
      toast.success("Payout rejected");
      setShowRejectModal(false);
      fetchData(page);
    } catch (err) {
      console.error("Failed to reject payout:", err);
      toast.error(err.response?.data?.message || "Failed to reject payout");
    }
  };

  return (
    <>
      <div className="layout-wrapper layout-content-navbar">
        <div className="layout-container">
          {/* Menu */}
          <Navbar />
          {/* / Menu */}

          {/* Layout container */}
          <div className="layout-page">
            {/* Navbar */}
            <Topnav />
            {/* / Navbar */}

            {/* Content wrapper */}
            <div className="content-wrapper">
              {/* Content */}

              <div className="container-xxl flex-grow-1 container-p-y">
                <h4 className="fw-bold py-3 mb-4">
                  <span className="text-muted fw-light">Home / Management</span> /
                  Payout Requests
                </h4>

                <ManagementNavLinks />

                <div className="row">
                  <div className="col-lg-12 mb-4 order-0">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Filter</h5>

                        <div className="card-header-actions">
                          <select
                            className="form-select"
                            value={filterStatus}
                            onChange={handleFilterChange}
                            style={{ width: '200px' }}
                          >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="rejected">Rejected</option>
                            <option value="failed">Failed</option>
                          </select>
                        </div>
                      </div>
                      <div className="d-flex align-items-end row">
                        <div className="table-responsive text-nowrap">
                          {loading ? (
                            <div className="text-center p-4">
                              <div
                                className="spinner-border text-primary"
                                role="status"
                                style={{ width: "3rem", height: "3rem" }}>
                                <span className="visually-hidden">
                                  Loading...
                                </span>
                              </div>
                            </div>
                          ) : (
                            <table className="table">
                              <thead>
                                <tr>
                                  <th width="50">#</th>
                                  <th>Ref</th>
                                  <th>User</th>
                                  <th>Amount</th>
                                  <th>Bank Details</th>
                                  <th>Status</th>
                                  <th>Requested Date</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {currentPageData.length === 0 ? (
                                  <tr>
                                    <td
                                      colSpan="8"
                                      className="text-center py-4">
                                      No payout requests found
                                    </td>
                                  </tr>
                                ) : (
                                  currentPageData.map((data, index) => (
                                    <tr key={data.id || index}>
                                      <td>
                                        {(page - 1) * pageSize + index + 1}
                                      </td>
                                      <td>{data.reference}</td>
                                      <td>
                                        <a
                                          href={`mailto:${
                                            data.user?.email || ""
                                          }`}>
                                          {data.user?.username ||
                                            data.user?.firstName ||
                                            "Unknown User"}
                                        </a>
                                        <br />
                                        <small className="text-muted">
                                          {data.user?.email || ""}
                                        </small>
                                      </td>
                                      <td>
                                        <strong>
                                          {new Intl.NumberFormat("en-NG", {
                                            style: "currency",
                                            currency: "NGN",
                                          }).format(data.amount)}
                                        </strong>
                                      </td>
                                      <td>
                                        <strong>{data.bank_name}</strong>
                                        <br />
                                        <small className="text-muted">
                                          {data.account_number}
                                        </small>
                                        <br />
                                        <small className="text-muted">
                                          {data.account_name}
                                        </small>
                                      </td>
                                      <td>
                                        <span
                                          className={`badge ${
                                            data.status === "completed"
                                              ? "bg-label-success"
                                              : data.status === "pending"
                                              ? "bg-label-warning"
                                              : data.status === "approved"
                                              ? "bg-label-info"
                                              : data.status === "processing"
                                              ? "bg-label-primary"
                                              : "bg-label-danger"
                                          }`}>
                                          {data.status}
                                        </span>
                                      </td>
                                      <td>
                                        {new Date(
                                          data.created_at
                                        ).toLocaleDateString("en-US", {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                        })}
                                      </td>
                                      <td>
                                        <div className="dropdown">
                                          <button
                                            type="button"
                                            className="btn p-0 dropdown-toggle hide-arrow"
                                            data-bs-toggle="dropdown">
                                            <i className="bx bx-dots-vertical-rounded"></i>
                                          </button>
                                          <div className="dropdown-menu">
                                            <button
                                              className="dropdown-item"
                                              onClick={() =>
                                                handleView(data)
                                              }>
                                              <i className="bx bx-show me-1"></i>{" "}
                                              View Details
                                            </button>
                                            {data.status === "pending" && (
                                              <>
                                                <button
                                                  className="dropdown-item text-success"
                                                  onClick={() =>
                                                    handleApprove(data)
                                                  }>
                                                  <i className="bx bx-check me-1"></i>{" "}
                                                  Approve
                                                </button>
                                                <button
                                                  className="dropdown-item text-danger"
                                                  onClick={() =>
                                                    handleReject(data)
                                                  }>
                                                  <i className="bx bx-x me-1"></i>{" "}
                                                  Reject
                                                </button>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          )}
                        </div>
                        <ToastContainer
                          position="top-center"
                          autoClose={3000}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* / Content */}

              {/* Pagination */}
              <nav className="mt-3">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => setPage(page - 1)}>
                      Previous
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <li
                      key={i}
                      className={`page-item ${page === i + 1 ? "active" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setPage(i + 1)}>
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  <li
                    className={`page-item ${
                      page === totalPages ? "disabled" : ""
                    }`}>
                    <button
                      className="page-link"
                      onClick={() => setPage(page + 1)}>
                      Next
                    </button>
                  </li>
                </ul>
              </nav>

              {/* Footer */}
              <Footer />
              {/* / Footer */}

              <div className="content-backdrop fade"></div>
            </div>
            {/* Content wrapper */}
          </div>
          {/* / Layout page */}
        </div>

        {/* View Modal */}
        <div
          key={selectedItem?.id}
          className={`modal fade ${showViewModal ? "show d-block" : ""}`}
          tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Payout Request Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body">
                {selectedItem ? (
                  <>
                    <ul className="list-group">
                      <li className="list-group-item">
                        <strong>Reference:</strong> {selectedItem.reference}
                      </li>
                      <li className="list-group-item">
                        <strong>User:</strong>{" "}
                        {selectedItem.user?.firstName && selectedItem.user?.lastName
                          ? `${selectedItem.user.firstName} ${selectedItem.user.lastName}`
                          : selectedItem.user?.username || "Unknown"}
                        <br />
                        <small className="text-muted">{selectedItem.user?.email}</small>
                      </li>
                      <li className="list-group-item">
                        <strong>Amount:</strong>{" "}
                        <span className="text-success fw-bold fs-5">
                          {new Intl.NumberFormat("en-NG", {
                            style: "currency",
                            currency: "NGN",
                          }).format(selectedItem.amount)}
                        </span>
                      </li>
                      <li className="list-group-item">
                        <strong>Bank Name:</strong> {selectedItem.bank_name}
                      </li>
                      <li className="list-group-item">
                        <strong>Account Number:</strong> {selectedItem.account_number}
                      </li>
                      <li className="list-group-item">
                        <strong>Account Name:</strong> {selectedItem.account_name}
                      </li>
                      <li className="list-group-item">
                        <strong>Status:</strong>{" "}
                        <span
                          className={`badge ${
                            selectedItem.status === "completed"
                              ? "bg-label-success"
                              : selectedItem.status === "pending"
                              ? "bg-label-warning"
                              : selectedItem.status === "approved"
                              ? "bg-label-info"
                              : selectedItem.status === "processing"
                              ? "bg-label-primary"
                              : "bg-label-danger"
                          }`}>
                          {selectedItem.status}
                        </span>
                      </li>
                      <li className="list-group-item">
                        <strong>Requested Date:</strong>{" "}
                        {new Date(selectedItem.created_at).toLocaleString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </li>
                      {selectedItem.approved_at && (
                        <li className="list-group-item">
                          <strong>Approved At:</strong>{" "}
                          {new Date(selectedItem.approved_at).toLocaleString()}
                        </li>
                      )}
                      {selectedItem.completed_at && (
                        <li className="list-group-item">
                          <strong>Completed At:</strong>{" "}
                          {new Date(selectedItem.completed_at).toLocaleString()}
                        </li>
                      )}
                      {selectedItem.admin_note && (
                        <li className="list-group-item">
                          <strong>Admin Note:</strong>
                          <br />
                          <span className="text-muted">{selectedItem.admin_note}</span>
                        </li>
                      )}
                      {selectedItem.rejection_reason && (
                        <li className="list-group-item">
                          <strong>Rejection Reason:</strong>
                          <br />
                          <span className="text-danger">{selectedItem.rejection_reason}</span>
                        </li>
                      )}
                    </ul>
                  </>
                ) : (
                  <p>No details available</p>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowViewModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Approve Modal */}
        <div
          className={`modal fade ${showApproveModal ? "show d-block" : ""}`}
          tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Approve Payout Request</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowApproveModal(false)}></button>
              </div>
              <form onSubmit={handleSubmitApprove}>
                <div className="modal-body">
                  {selectedItem && (
                    <div className="alert alert-info">
                      <strong>User:</strong> {selectedItem.user?.username || selectedItem.user?.firstName}
                      <br />
                      <strong>Amount:</strong>{" "}
                      {new Intl.NumberFormat("en-NG", {
                        style: "currency",
                        currency: "NGN",
                      }).format(selectedItem.amount)}
                      <br />
                      <strong>Bank:</strong> {selectedItem.bank_name}
                      <br />
                      <strong>Account:</strong> {selectedItem.account_number} - {selectedItem.account_name}
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Admin Note (Optional)</label>
                    <textarea
                      className="form-control"
                      value={approveNote}
                      onChange={(e) => setApproveNote(e.target.value)}
                      rows="3"
                      placeholder="Add any notes about this approval..."
                    />
                  </div>

                  <div className="alert alert-warning">
                    <i className="bx bx-info-circle me-2"></i>
                    Are you sure you want to approve this payout request?
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowApproveModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success">
                    <i className="bx bx-check me-1"></i> Approve Payout
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Reject Modal */}
        <div
          className={`modal fade ${showRejectModal ? "show d-block" : ""}`}
          tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reject Payout Request</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRejectModal(false)}></button>
              </div>
              <form onSubmit={handleSubmitReject}>
                <div className="modal-body">
                  {selectedItem && (
                    <div className="alert alert-info">
                      <strong>User:</strong> {selectedItem.user?.username || selectedItem.user?.firstName}
                      <br />
                      <strong>Amount:</strong>{" "}
                      {new Intl.NumberFormat("en-NG", {
                        style: "currency",
                        currency: "NGN",
                      }).format(selectedItem.amount)}
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">
                      Rejection Reason <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows="4"
                      placeholder="Explain why this payout is being rejected..."
                      required
                    />
                  </div>

                  <div className="alert alert-danger">
                    <i className="bx bx-error me-2"></i>
                    This action will reject the payout and notify the user.
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowRejectModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-danger">
                    <i className="bx bx-x me-1"></i> Reject Payout
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}