import React, { useEffect, useState } from "react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import Topnav from "../../components/Topnav";
import HistoryLink from "../../components/HistoryLink";
import {
  getRequest,
} from "../../services/apiServices";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function FundHistory() {
  const [datas, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [filterType, setFilterType] = useState(""); // deposit/withdrawal/transfer
  const [filterStatus, setFilterStatus] = useState(""); // completed/pending/failed
  
  // Apply filters
  const filteredData = datas.filter((d) => {
    const typeMatch = filterType ? d.type === filterType : true;
    const statusMatch = filterStatus ? d.status === filterStatus : true;
    return typeMatch && statusMatch;
  });

  const currentPageData = filteredData;
  
  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
    setPage(1);
  };

  const handleFilterStatusChange = (e) => {
    setFilterStatus(e.target.value);
    setPage(1);
  };

  const handleView = async (item) => {
    // Fetch full details if needed
    try {
      const res = await getRequest(`/histories/payment/${item.id}`);
      setSelectedItem(res.data?.results?.Data || item);
      setShowViewModal(true);
    } catch (err) {
      console.error("Failed to fetch payment details:", err);
      // Fallback to showing item from table if API fails
      setSelectedItem(item);
      setShowViewModal(true);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const fetchData = async (pageNum) => {
    setLoading(true);
    try {
      const res = await getRequest(
        `/histories/payment?page=${pageNum}&limit=${pageSize}`
      );
      setData(res.data?.results?.Data?.data || []);
      setTotalPages(res.data.results.Data.last_page);
    } catch (err) {
      console.error("Failed to fetch fund history:", err);
      toast.error("Failed to load fund history");
    } finally {
      setLoading(false);
    }
  };

  // Get badge color based on type
  const getTypeBadgeColor = (type) => {
    switch(type) {
      case 'deposit':
        return 'bg-label-success';
      case 'withdrawal':
        return 'bg-label-danger';
      case 'transfer':
        return 'bg-label-info';
      default:
        return 'bg-label-secondary';
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
                  <span className="text-muted fw-light">Home /History</span> /
                  Fund History
                </h4>

                <div className="row">
                  <div className="col-lg-12 mb-4 order-0">
                    <HistoryLink />
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Filter</h5>

                        <div className="card-header-actions d-flex gap-2">
                          <select
                            className="form-select"
                            value={filterType}
                            onChange={handleFilterTypeChange}
                            style={{ width: '200px' }}
                          >
                            <option value="">All Types</option>
                            <option value="deposit">Deposit</option>
                            <option value="withdrawal">Withdrawal</option>
                            <option value="transfer">Transfer</option>
                          </select>

                          <select
                            className="form-select"
                            value={filterStatus}
                            onChange={handleFilterStatusChange}
                            style={{ width: '200px' }}
                          >
                            <option value="">All Status</option>
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
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
                                  <th>Method</th>
                                  <th>Amount</th>
                                  <th>Status</th>
                                  <th>Date</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {currentPageData.length === 0 ? (
                                  <tr>
                                    <td
                                      colSpan="9"
                                      className="text-center py-4">
                                      No records found for this filter
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
                                            data.user?.name ||
                                            "Unknown User"}
                                        </a>
                                        <br />
                                        <small className="text-muted">
                                          {data.user?.email || ""}
                                        </small>
                                      </td>
                                      <td>
                                        <span
                                          className={`badge ${getTypeBadgeColor(data.type)}`}>
                                          {data.type}
                                        </span>
                                      </td>
                                      <td>
                                        {data.method ? data.method.replace('_', ' ') : '-'}
                                      </td>
                                      <td>
                                        {new Intl.NumberFormat("en-NG", {
                                          style: "currency",
                                          currency: "NGN",
                                        }).format(data.amount)}
                                      </td>
                                      <td>
                                        <span
                                          className={`badge ${
                                            data.status === "completed"
                                              ? "bg-label-success"
                                              : data.status === "pending"
                                              ? "bg-label-warning"
                                              : data.status === "processing"
                                              ? "bg-label-info"
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
                <h5 className="modal-title">Transaction Details</h5>
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
                        <strong>User:</strong> {selectedItem.user?.username || selectedItem.user?.name}
                        <br />
                        <small className="text-muted">{selectedItem.user?.email}</small>
                      </li>
                      <li className="list-group-item">
                        <strong>Type:</strong>{" "}
                        <span className={`badge ${getTypeBadgeColor(selectedItem.type)}`}>
                          {selectedItem.type}
                        </span>
                      </li>
                      <li className="list-group-item">
                        <strong>Method:</strong> {selectedItem.method ? selectedItem.method.replace('_', ' ') : 'N/A'}
                      </li>
                      <li className="list-group-item">
                        <strong>Amount:</strong>{" "}
                        <span className="text-success fw-bold">
                          {new Intl.NumberFormat("en-NG", {
                            style: "currency",
                            currency: "NGN",
                            minimumFractionDigits: 0,
                          }).format(selectedItem.amount)}
                        </span>
                      </li>
                      {selectedItem.balance_before && (
                        <li className="list-group-item">
                          <strong>Balance Before:</strong>{" "}
                          {new Intl.NumberFormat("en-NG", {
                            style: "currency",
                            currency: "NGN",
                            minimumFractionDigits: 0,
                          }).format(selectedItem.balance_before)}
                        </li>
                      )}
                      {selectedItem.balance_after && (
                        <li className="list-group-item">
                          <strong>Balance After:</strong>{" "}
                          {new Intl.NumberFormat("en-NG", {
                            style: "currency",
                            currency: "NGN",
                            minimumFractionDigits: 0,
                          }).format(selectedItem.balance_after)}
                        </li>
                      )}
                      {selectedItem.bank_name && (
                        <>
                          <li className="list-group-item">
                            <strong>Bank Name:</strong> {selectedItem.bank_name}
                          </li>
                          <li className="list-group-item">
                            <strong>Account Number:</strong> {selectedItem.account_number || 'N/A'}
                          </li>
                        </>
                      )}
                      <li className="list-group-item">
                        <strong>Status:</strong>{" "}
                        <span
                          className={`badge ${
                            selectedItem.status === "completed"
                              ? "bg-label-success"
                              : selectedItem.status === "pending"
                              ? "bg-label-warning"
                              : selectedItem.status === "processing"
                              ? "bg-label-info"
                              : "bg-label-danger"
                          }`}>
                          {selectedItem.status === "completed"
                            ? "Completed"
                            : selectedItem.status === "pending"
                            ? "Pending"
                            : selectedItem.status === "processing"
                            ? "Processing"
                            : "Failed"}
                        </span>
                      </li>
                      <li className="list-group-item">
                        <strong>Date:</strong>{" "}
                        {new Date(selectedItem.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </li>
                      {selectedItem.description && (
                        <li className="list-group-item">
                          <strong>Description:</strong>
                          <br />
                          <span className="text-muted">{selectedItem.description}</span>
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
      </div>
    </>
  );
}