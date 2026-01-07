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

export default function AirtimeSwapHistory() {
  const [datas, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [filterStatus, setFilterStatus] = useState(""); // completed/pending/rejected
  
  // Apply filters
  const filteredData = datas.filter((d) => {
    const statusMatch = filterStatus ? d.status === filterStatus : true;
    return statusMatch;
  });

  const currentPageData = filteredData;
  
  const handleFilterStatusChange = (e) => {
    setFilterStatus(e.target.value);
    setPage(1);
  };

  const handleView = async (item) => {
    // Fetch full details if needed
    try {
      const res = await getRequest(`/histories/airtime-swap/${item.id}`);
      setSelectedItem(res.data?.results?.Data || item);
      setShowViewModal(true);
    } catch (err) {
      console.error("Failed to fetch swap details:", err);
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
      console.log('🔍 Fetching Airtime Swap History...'); // Debug log
      const res = await getRequest(
        `/histories/airtime-swap?page=${pageNum}&limit=${pageSize}`
      );
      console.log('✅ API Response:', res.data); // Debug log
      
      // Data is in results.Data.transactions array
      const dataArray = res.data?.results?.Data?.transactions || [];
      
      console.log('📊 Extracted data:', dataArray); // Debug: show extracted data
      console.log('📊 First item:', dataArray[0]); // Debug: show first item structure
      
      setData(dataArray);
      setTotalPages(1); // Set to 1 for now, update if backend adds pagination
    } catch (err) {
      console.error("❌ Failed to fetch airtime swap history:", err);
      console.error("❌ Error details:", err.response); // More details
      toast.error("Failed to load airtime swap history");
    } finally {
      setLoading(false);
    }
  };

  // Get network badge color
  const getNetworkColor = (network) => {
    switch(network?.toUpperCase()) {
      case 'MTN':
        return 'bg-label-warning'; // Yellow for MTN
      case 'AIRTEL':
        return 'bg-label-danger'; // Red for Airtel
      case 'GLO':
        return 'bg-label-success'; // Green for Glo
      case '9MOBILE':
        return 'bg-label-info'; // Blue for 9mobile
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
                  Airtime Swap
                </h4>

                <div className="row">
                  <div className="col-lg-12 mb-4 order-0">
                    <HistoryLink />
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Filter</h5>

                        <div className="card-header-actions">
                          <select
                            className="form-select"
                            value={filterStatus}
                            onChange={handleFilterStatusChange}
                            style={{ width: '200px' }}
                          >
                            <option value="">All Status</option>
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                            <option value="rejected">Rejected</option>
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
                                  <th>Phone</th>
                                  <th>Airtime</th>
                                  <th>Cash Value</th>
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
                                      colSpan="10"
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
                                      <td>{data.transaction_id}</td>
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
                                      <td>{data.phone_number || '-'}</td>
                                      <td className="text-primary fw-semibold">
                                        {new Intl.NumberFormat("en-NG", {
                                          style: "currency",
                                          currency: "NGN",
                                        }).format(data.airtime_amount)}
                                      </td>
                                      <td className="text-success fw-semibold">
                                        {new Intl.NumberFormat("en-NG", {
                                          style: "currency",
                                          currency: "NGN",
                                        }).format(data.cash_amount)}
                                      </td>
                                      <td>
                                        {data.conversion_rate ? `${parseFloat(data.conversion_rate).toFixed(1)}%` : '-'}
                                      </td>
                                      <td>
                                        <span
                                          className={`badge ${
                                            data.status === "completed"
                                              ? "bg-label-success"
                                              : data.status === "pending"
                                              ? "bg-label-warning"
                                              : data.status === "rejected"
                                              ? "bg-label-danger"
                                              : "bg-label-secondary"
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
                <h5 className="modal-title">Airtime Swap Details</h5>
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
                        <strong>Reference:</strong> {selectedItem.transaction_id}
                      </li>
                      <li className="list-group-item">
                        <strong>User:</strong> {selectedItem.user?.username || selectedItem.user?.firstName || selectedItem.user?.name}
                        <br />
                        <small className="text-muted">{selectedItem.user?.email}</small>
                      </li>
                      {selectedItem.network_id && (
                        <li className="list-group-item">
                          <strong>Network ID:</strong> {selectedItem.network_id}
                        </li>
                      )}
                      {selectedItem.bank_name && (
                        <li className="list-group-item">
                          <strong>Bank:</strong> {selectedItem.bank_name}
                        </li>
                      )}
                      {selectedItem.account_number && (
                        <li className="list-group-item">
                          <strong>Account Number:</strong> {selectedItem.account_number}
                        </li>
                      )}
                      {selectedItem.account_name && (
                        <li className="list-group-item">
                          <strong>Account Name:</strong> {selectedItem.account_name}
                        </li>
                      )}
                      <li className="list-group-item">
                        <strong>Phone Number:</strong> {selectedItem.phone_number || 'N/A'}
                      </li>
                      <li className="list-group-item">
                        <strong>Airtime Amount:</strong>{" "}
                        <span className="text-primary fw-bold fs-5">
                          {new Intl.NumberFormat("en-NG", {
                            style: "currency",
                            currency: "NGN",
                            minimumFractionDigits: 0,
                          }).format(selectedItem.airtime_amount)}
                        </span>
                      </li>
                      <li className="list-group-item">
                        <strong>Cash Amount:</strong>{" "}
                        <span className="text-success fw-bold fs-5">
                          {new Intl.NumberFormat("en-NG", {
                            style: "currency",
                            currency: "NGN",
                            minimumFractionDigits: 0,
                          }).format(selectedItem.cash_amount)}
                        </span>
                      </li>
                      <li className="list-group-item">
                        <strong>Conversion Rate:</strong>{" "}
                        <span className="badge bg-label-primary fs-6">
                          {selectedItem.conversion_rate ? `${parseFloat(selectedItem.conversion_rate).toFixed(1)}%` : 'N/A'}
                        </span>
                      </li>
                      <li className="list-group-item">
                        <strong>Status:</strong>{" "}
                        <span
                          className={`badge ${
                            selectedItem.status === "completed"
                              ? "bg-label-success"
                              : selectedItem.status === "pending"
                              ? "bg-label-warning"
                              : "bg-label-danger"
                          }`}>
                          {selectedItem.status === "completed"
                            ? "Completed"
                            : selectedItem.status === "pending"
                            ? "Pending"
                            : selectedItem.status === "rejected"
                            ? "Rejected"
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
                      {selectedItem.admin_note && (
                        <li className="list-group-item">
                          <strong>Admin Notes:</strong>
                          <br />
                          <span className="text-muted">{selectedItem.admin_note}</span>
                        </li>
                      )}
                      {selectedItem.approved_by && (
                        <li className="list-group-item">
                          <strong>Approved By:</strong> {selectedItem.approved_by}
                          <br />
                          <small className="text-muted">
                            Approved at: {new Date(selectedItem.approved_at).toLocaleString()}
                          </small>
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