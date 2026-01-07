import React, { useEffect, useState } from "react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import Topnav from "../../components/Topnav";
import HistoryLink from "../../components/HistoryLink";
import {
  getRequest,
  postRequest,
} from "../../services/apiServices";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function GiftUserHistory() {
  const [datas, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [filterStatus, setFilterStatus] = useState(""); // Filter by status
  
  // Apply filter
  const filteredData = datas.filter((d) =>
    filterStatus ? d.status === filterStatus : true
  );

  const currentPageData = filteredData;
  
  console.log('🎯 Current state:', {
    datasLength: datas.length,
    filteredDataLength: filteredData.length,
    currentPageDataLength: currentPageData.length,
    filterStatus,
    firstItem: datas[0]
  });
  
  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
    setPage(1);
  };

  const handleView = async (item) => {
    // Fetch full details if needed
    try {
      const res = await getRequest(`/histories/giftuser/${item.id}`);
      setSelectedItem(res.data?.results?.Data || item);
      setShowViewModal(true);
    } catch (err) {
      console.error("Failed to fetch gift details:", err);
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
      console.log('🔍 Fetching Gift User History...'); // Debug log
      const res = await getRequest(
        `/histories/giftuser?page=${pageNum}&limit=${pageSize}`
      );
      console.log('✅ API Response:', res.data); // Debug log
      
      // Data is directly in results.Data as an array
      const dataArray = res.data?.results?.Data || [];
      
      console.log('📊 Extracted data:', dataArray); // Debug: show extracted data
      console.log('📊 First item:', dataArray[0]); // Debug: show first item structure
      
      setData(dataArray);
      setTotalPages(1); // Set to 1 for now, update if backend adds pagination
    } catch (err) {
      console.error("❌ Failed to fetch gift user history:", err);
      console.error("❌ Error details:", err.response); // More details
      toast.error("Failed to load gift user history");
    } finally {
      setLoading(false);
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
                  Gift Users
                </h4>

                <div className="row">
                  <div className="col-lg-12 mb-4 order-0">
                    <HistoryLink />
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Filter</h5>

                        <div className="card-header-actions col-4">
                          <select
                            className="form-select"
                            value={filterStatus}
                            onChange={handleFilterChange}
                          >
                            <option value="">All Status</option>
                            <option value="successful">Successful</option>
                            <option value="pending">Pending</option>
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
                                  <th>Sender</th>
                                  <th>Receiver</th>
                                  <th>Description</th>
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
                                        {data.sender ? (
                                          <>
                                            <a href={`mailto:${data.sender?.email || ""}`}>
                                              {data.sender?.username || data.sender?.name || "Unknown"}
                                            </a>
                                            <br />
                                            <small className="text-muted">
                                              {data.sender?.email || ""}
                                            </small>
                                          </>
                                        ) : (
                                          <span className="text-muted">Not available</span>
                                        )}
                                      </td>
                                      <td>
                                        {data.receiver ? (
                                          <>
                                            <a href={`mailto:${data.receiver?.email || ""}`}>
                                              {data.receiver?.username || data.receiver?.name || "Unknown"}
                                            </a>
                                            <br />
                                            <small className="text-muted">
                                              {data.receiver?.email || ""}
                                            </small>
                                          </>
                                        ) : (
                                          <span className="text-muted">Not available</span>
                                        )}
                                      </td>
                                      <td>
                                        <small>{data.description || 'N/A'}</small>
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
                                            data.status === "successful"
                                              ? "bg-label-success"
                                              : data.status === "pending"
                                              ? "bg-label-warning"
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
                <h5 className="modal-title">Gift Transaction Details</h5>
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
                      {selectedItem.sender ? (
                        <li className="list-group-item">
                          <strong>Sender:</strong> {selectedItem.sender?.username || selectedItem.sender?.name}
                          <br />
                          <small className="text-muted">{selectedItem.sender?.email}</small>
                        </li>
                      ) : null}
                      {selectedItem.receiver ? (
                        <li className="list-group-item">
                          <strong>Receiver:</strong> {selectedItem.receiver?.username || selectedItem.receiver?.name}
                          <br />
                          <small className="text-muted">{selectedItem.receiver?.email}</small>
                        </li>
                      ) : null}
                      <li className="list-group-item">
                        <strong>Description:</strong>
                        <br />
                        <span className="text-muted">{selectedItem.description}</span>
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
                      <li className="list-group-item">
                        <strong>Channel:</strong> {selectedItem.channel}
                      </li>
                      <li className="list-group-item">
                        <strong>Bank:</strong> {selectedItem.bank}
                      </li>
                      <li className="list-group-item">
                        <strong>Currency:</strong> {selectedItem.currency}
                      </li>
                      {selectedItem.message && (
                        <li className="list-group-item">
                          <strong>Message:</strong>
                          <br />
                          <em className="text-muted">"{selectedItem.message}"</em>
                        </li>
                      )}
                      <li className="list-group-item">
                        <strong>Status:</strong>{" "}
                        <span
                          className={`badge ${
                            selectedItem.status === "successful"
                              ? "bg-label-success"
                              : selectedItem.status === "pending"
                              ? "bg-label-warning"
                              : "bg-label-danger"
                          }`}>
                          {selectedItem.status === "successful"
                            ? "Successful"
                            : selectedItem.status === "pending"
                            ? "Pending"
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