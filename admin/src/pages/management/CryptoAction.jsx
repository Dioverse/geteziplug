import React, { useEffect, useState } from "react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import Topnav from "../../components/Topnav";
import {
  getRequest,
  postRequest,
} from "../../services/apiServices";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CryptoAction() {
  const [transactions, setTransactions] = useState([]);
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
  const [approveAmount, setApproveAmount] = useState("");

  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");

  // Apply filters
  const filteredData = transactions.filter((t) => {
    const statusMatch = filterStatus ? t.status === filterStatus : true;
    const typeMatch = filterType ? t.transaction_type === filterType : true;
    return statusMatch && typeMatch;
  });

  const currentPageData = filteredData;

  const handleFilterStatusChange = (e) => {
    setFilterStatus(e.target.value);
    setPage(1);
  };

  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
    setPage(1);
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const fetchData = async (pageNum) => {
    setLoading(true);
    try {
      const res = await getRequest(
        `/histories/crypto?page=${pageNum}&limit=${pageSize}`
      );
      const dataArray = res.data?.results?.Data?.data || res.data?.results?.Data || [];
      const lastPage = res.data?.results?.Data?.last_page || res.data?.results?.last_page || 1;
      
      setTransactions(dataArray);
      setTotalPages(lastPage);
    } catch (err) {
      console.error("Failed to fetch crypto transactions:", err);
      toast.error("Failed to load crypto transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (item) => {
    try {
      const res = await getRequest(`/histories/crypto/${item.id}`);
      setSelectedItem(res.data?.results?.Data || item);
      setShowViewModal(true);
    } catch (err) {
      console.error("Failed to fetch transaction details:", err);
      setSelectedItem(item);
      setShowViewModal(true);
    }
  };

  const handleApprove = (item) => {
    setSelectedItem(item);
    setApproveNote("");
    setApproveAmount(item.amount_usd || item.amount);
    setShowApproveModal(true);
  };

  const handleReject = (item) => {
    setSelectedItem(item);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const handleSubmitApprove = async (e) => {
    e.preventDefault();

    if (!approveAmount) {
      toast.error("Please enter the approved amount");
      return;
    }

    try {
      await postRequest(`/histories/crypto/${selectedItem.id}/approve`, {
        approved_amount: approveAmount,
        admin_note: approveNote
      });
      toast.success("Transaction approved successfully");
      setShowApproveModal(false);
      fetchData(page);
    } catch (err) {
      console.error("Failed to approve transaction:", err);
      toast.error(err.response?.data?.message || "Failed to approve transaction");
    }
  };

  const handleSubmitReject = async (e) => {
    e.preventDefault();

    if (!rejectReason) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      await postRequest(`/histories/crypto/${selectedItem.id}/reject`, {
        rejection_reason: rejectReason
      });
      toast.success("Transaction rejected");
      setShowRejectModal(false);
      fetchData(page);
    } catch (err) {
      console.error("Failed to reject transaction:", err);
      toast.error(err.response?.data?.message || "Failed to reject transaction");
    }
  };

  const getCryptoIcon = (crypto) => {
    const icons = {
      BTC: "₿",
      ETH: "Ξ",
      USDT: "₮",
      USDC: "$"
    };
    return icons[crypto?.toUpperCase()] || "₿";
  };

  const getCryptoBadgeColor = (crypto) => {
    const colors = {
      BTC: "bg-label-warning",
      ETH: "bg-label-primary",
      USDT: "bg-label-success",
      USDC: "bg-label-info"
    };
    return colors[crypto?.toUpperCase()] || "bg-label-secondary";
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
                  Crypto Transactions
                </h4>

                <div className="row">
                  <div className="col-lg-12 mb-4 order-0">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Filter</h5>

                        <div className="card-header-actions d-flex gap-2">
                          <select
                            className="form-select"
                            value={filterType}
                            onChange={handleFilterTypeChange}
                            style={{ width: '180px' }}
                          >
                            <option value="">All Types</option>
                            <option value="buy">Buy</option>
                            <option value="sell">Sell</option>
                          </select>
                          <select
                            className="form-select"
                            value={filterStatus}
                            onChange={handleFilterStatusChange}
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
                                  <th>Type</th>
                                  <th>Crypto</th>
                                  <th>Amount (USD)</th>
                                  <th>Amount (NGN)</th>
                                  <th>Rate</th>
                                  <th>Status</th>
                                  <th>Date</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {currentPageData.length === 0 ? (
                                  <tr>
                                    <td
                                      colSpan="11"
                                      className="text-center py-4">
                                      No crypto transactions found
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
                                          {data.user?.firstName && data.user?.lastName
                                            ? `${data.user.firstName} ${data.user.lastName}`
                                            : data.user?.username ||
                                              "Unknown User"}
                                        </a>
                                        <br />
                                        <small className="text-muted">
                                          {data.user?.email || ""}
                                        </small>
                                      </td>
                                      <td>
                                        <span
                                          className={`badge ${
                                            data.transaction_type === "buy"
                                              ? "bg-label-success"
                                              : "bg-label-danger"
                                          }`}>
                                          {data.transaction_type === "buy" ? "BUY" : "SELL"}
                                        </span>
                                      </td>
                                      <td>
                                        <span className={`badge ${getCryptoBadgeColor(data.crypto_type)}`}>
                                          {getCryptoIcon(data.crypto_type)} {data.crypto_type?.toUpperCase()}
                                        </span>
                                      </td>
                                      <td>
                                        <strong className="text-primary">
                                          ${parseFloat(data.amount_usd || 0).toFixed(2)}
                                        </strong>
                                      </td>
                                      <td>
                                        <strong>
                                          {new Intl.NumberFormat("en-NG", {
                                            style: "currency",
                                            currency: "NGN",
                                          }).format(data.amount_ngn || 0)}
                                        </strong>
                                      </td>
                                      <td>
                                        <small className="text-muted">
                                          ₦{parseFloat(data.rate || 0).toFixed(2)}
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
                                          month: "short",
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
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Crypto Transaction Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body">
                {selectedItem ? (
                  <>
                    <div className="mb-3">
                      <h4>
                        <span className={`badge ${getCryptoBadgeColor(selectedItem.crypto_type)} me-2`}>
                          {getCryptoIcon(selectedItem.crypto_type)} {selectedItem.crypto_type?.toUpperCase()}
                        </span>
                        <span
                          className={`badge ${
                            selectedItem.transaction_type === "buy"
                              ? "bg-label-success"
                              : "bg-label-danger"
                          }`}>
                          {selectedItem.transaction_type?.toUpperCase()}
                        </span>
                      </h4>
                    </div>

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
                        <strong>Amount (USD):</strong>{" "}
                        <span className="text-primary fw-bold fs-5">
                          ${parseFloat(selectedItem.amount_usd || 0).toFixed(2)}
                        </span>
                      </li>
                      <li className="list-group-item">
                        <strong>Amount (NGN):</strong>{" "}
                        <span className="text-success fw-bold fs-5">
                          {new Intl.NumberFormat("en-NG", {
                            style: "currency",
                            currency: "NGN",
                          }).format(selectedItem.amount_ngn || 0)}
                        </span>
                      </li>
                      <li className="list-group-item">
                        <strong>Exchange Rate:</strong> ₦{parseFloat(selectedItem.rate || 0).toFixed(2)} per $1
                      </li>
                      {selectedItem.wallet_address && (
                        <li className="list-group-item">
                          <strong>Wallet Address:</strong>
                          <br />
                          <code className="text-break">{selectedItem.wallet_address}</code>
                        </li>
                      )}
                      {selectedItem.transaction_hash && (
                        <li className="list-group-item">
                          <strong>Transaction Hash:</strong>
                          <br />
                          <code className="text-break">{selectedItem.transaction_hash}</code>
                        </li>
                      )}
                      {selectedItem.proof_image && (
                        <li className="list-group-item">
                          <strong>Proof of Payment:</strong>
                          <br />
                          <img
                            src={selectedItem.proof_image}
                            alt="Proof"
                            className="img-fluid mt-2"
                            style={{ maxHeight: '300px' }}
                          />
                        </li>
                      )}
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
                        <strong>Created:</strong>{" "}
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
                <h5 className="modal-title">Approve Crypto Transaction</h5>
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
                      <strong>Type:</strong> {selectedItem.transaction_type?.toUpperCase()}
                      <br />
                      <strong>Crypto:</strong> {selectedItem.crypto_type?.toUpperCase()}
                      <br />
                      <strong>Amount:</strong> ${parseFloat(selectedItem.amount_usd || 0).toFixed(2)} (
                      {new Intl.NumberFormat("en-NG", {
                        style: "currency",
                        currency: "NGN",
                      }).format(selectedItem.amount_ngn || 0)})
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">
                      Approved Amount (USD) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      value={approveAmount}
                      onChange={(e) => setApproveAmount(e.target.value)}
                      step="0.01"
                      placeholder="Enter approved amount in USD"
                      required
                    />
                    <small className="text-muted">
                      You can adjust the amount if needed
                    </small>
                  </div>

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
                    Are you sure you want to approve this transaction?
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
                    <i className="bx bx-check me-1"></i> Approve Transaction
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
                <h5 className="modal-title">Reject Crypto Transaction</h5>
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
                      <strong>Amount:</strong> ${parseFloat(selectedItem.amount_usd || 0).toFixed(2)}
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
                      placeholder="Explain why this transaction is being rejected..."
                      required
                    />
                  </div>

                  <div className="alert alert-danger">
                    <i className="bx bx-error me-2"></i>
                    This action will reject the transaction and notify the user.
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
                    <i className="bx bx-x me-1"></i> Reject Transaction
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