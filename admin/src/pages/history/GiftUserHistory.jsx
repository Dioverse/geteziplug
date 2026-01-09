import React, { useEffect, useState } from "react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import Topnav from "../../components/Topnav";
import HistoryLink from "../../components/HistoryLink";
import { getRequest } from "../../services/apiServices";
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

  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = datas.filter((d) => {
    const statusMatch = filterStatus ? d.status === filterStatus : true;
    const searchMatch = searchTerm
      ? d.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.sender?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.sender?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.receiver?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.receiver?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.description?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return statusMatch && searchMatch;
  });

  const totalFilteredPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const currentPageData = filteredData.slice(startIndex, startIndex + pageSize);

  const clearFilters = () => {
    setFilterStatus("");
    setSearchTerm("");
    setPage(1);
  };

  const handleView = async (item) => {
    try {
      const res = await getRequest(`/histories/giftuser/${item.id}`);
      setSelectedItem(res.data?.results?.Data || item);
      setShowViewModal(true);
    } catch (err) {
      console.error("Failed to fetch gift details:", err);
      setSelectedItem(item);
      setShowViewModal(true);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getRequest(`/histories/giftuser`);
      const dataArray = res.data?.results?.Data || [];
      setData(dataArray);
      setTotalPages(Math.ceil(dataArray.length / pageSize));
    } catch (err) {
      console.error("Failed to fetch gift user history:", err);
      toast.error("Failed to load gift user history");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "successful":
        return "bg-success";
      case "pending":
        return "bg-warning";
      case "failed":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  const renderPageButtons = () => {
    if (totalFilteredPages <= 7) {
      return Array.from({ length: totalFilteredPages }, (_, i) => (
        <li key={i + 1} className={`page-item ${page === i + 1 ? "active" : ""}`}>
          <button className="page-link" onClick={() => setPage(i + 1)}>
            {i + 1}
          </button>
        </li>
      ));
    }

    const buttons = [];
    if (page > 3) {
      buttons.push(
        <li key={1} className="page-item">
          <button className="page-link" onClick={() => setPage(1)}>1</button>
        </li>
      );
      if (page > 4) {
        buttons.push(
          <li key="dots-start" className="page-item disabled">
            <span className="page-link">...</span>
          </li>
        );
      }
    }

    for (let i = Math.max(1, page - 2); i <= Math.min(totalFilteredPages, page + 2); i++) {
      buttons.push(
        <li key={i} className={`page-item ${page === i ? "active" : ""}`}>
          <button className="page-link" onClick={() => setPage(i)}>{i}</button>
        </li>
      );
    }

    if (page < totalFilteredPages - 2) {
      if (page < totalFilteredPages - 3) {
        buttons.push(
          <li key="dots-end" className="page-item disabled">
            <span className="page-link">...</span>
          </li>
        );
      }
      buttons.push(
        <li key={totalFilteredPages} className="page-item">
          <button className="page-link" onClick={() => setPage(totalFilteredPages)}>
            {totalFilteredPages}
          </button>
        </li>
      );
    }

    return buttons;
  };

  return (
    <>
      <div className="layout-wrapper layout-content-navbar">
        <div className="layout-container">
          <Navbar />
          <div className="layout-page">
            <Topnav />
            <div className="content-wrapper">
              <div className="container-xxl flex-grow-1 container-p-y">
                <h4 className="fw-bold py-3 mb-4">
                  <span className="text-muted fw-light">Home / History</span> / Gift Users
                </h4>

                <div className="row">
                  <div className="col-lg-12 mb-4 order-0">
                    <HistoryLink />

                    {/* Modern Filter Card */}
                    <div className="card border-0 shadow-sm mb-4">
                      <div className="card-body p-4">
                        <div className="row g-3">
                          {/* Search Bar */}
                          <div className="col-12 col-md-6">
                            <label className="form-label small fw-semibold text-muted mb-2">
                              <i className="bx bx-search me-1"></i>Search
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Reference, sender, receiver, description..."
                              value={searchTerm}
                              onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1);
                              }}
                            />
                          </div>

                          {/* Status Filter */}
                          <div className="col-12 col-md-4">
                            <label className="form-label small fw-semibold text-muted mb-2">
                              <i className="bx bx-check-circle me-1"></i>Status
                            </label>
                            <select
                              className="form-select"
                              value={filterStatus}
                              onChange={(e) => {
                                setFilterStatus(e.target.value);
                                setPage(1);
                              }}
                            >
                              <option value="">All Status</option>
                              <option value="successful">Successful</option>
                              <option value="pending">Pending</option>
                              <option value="failed">Failed</option>
                            </select>
                          </div>

                          {/* Clear Button */}
                          <div className="col-12 col-md-2 d-flex align-items-end">
                            <button className="btn btn-outline-secondary w-100" onClick={clearFilters}>
                              <i className="bx bx-reset me-1"></i>Clear
                            </button>
                          </div>
                        </div>

                        {/* Active Filters Display */}
                        {(filterStatus || searchTerm) && (
                          <div className="mt-3 d-flex flex-wrap gap-2 align-items-center">
                            <span className="text-muted small">Active filters:</span>
                            {filterStatus && (
                              <span className="badge bg-info">
                                Status: {filterStatus}
                                <i
                                  className="bx bx-x ms-1"
                                  onClick={() => setFilterStatus("")}
                                  style={{ cursor: "pointer" }}
                                ></i>
                              </span>
                            )}
                            {searchTerm && (
                              <span className="badge bg-success">
                                Search: "{searchTerm}"
                                <i
                                  className="bx bx-x ms-1"
                                  onClick={() => setSearchTerm("")}
                                  style={{ cursor: "pointer" }}
                                ></i>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Results Summary */}
                    {!loading && (
                      <div className="mb-3 d-flex justify-content-between align-items-center">
                        <span className="text-muted">
                          Showing {currentPageData.length > 0 ? startIndex + 1 : 0} to{" "}
                          {Math.min(startIndex + pageSize, filteredData.length)} of {filteredData.length} results
                        </span>
                        {filteredData.length !== datas.length && (
                          <span className="text-muted small">
                            (Filtered from {datas.length} total records)
                          </span>
                        )}
                      </div>
                    )}

                    {/* Desktop Table View */}
                    <div className="card border-0 shadow-sm d-none d-lg-block">
                      <div className="table-responsive">
                        {loading ? (
                          <div className="text-center p-5">
                            <div
                              className="spinner-border text-primary"
                              role="status"
                              style={{ width: "3rem", height: "3rem" }}
                            >
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-3 text-muted">Loading gift transactions...</p>
                          </div>
                        ) : (
                          <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                              <tr>
                                <th className="px-4 py-3">#</th>
                                <th className="py-3">Reference</th>
                                <th className="py-3">Sender</th>
                                <th className="py-3">Receiver</th>
                                <th className="py-3">Description</th>
                                <th className="py-3">Amount</th>
                                <th className="py-3">Status</th>
                                <th className="py-3">Date</th>
                                <th className="py-3">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {currentPageData.length === 0 ? (
                                <tr>
                                  <td colSpan="9" className="text-center py-5">
                                    <i className="bx bx-search-alt-2 display-4 text-muted"></i>
                                    <p className="text-muted mt-3">No transactions found</p>
                                    {(filterStatus || searchTerm) && (
                                      <button
                                        className="btn btn-sm btn-outline-primary mt-2"
                                        onClick={clearFilters}
                                      >
                                        Clear Filters
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ) : (
                                currentPageData.map((data, index) => (
                                  <tr key={data.id || index}>
                                    <td className="px-4">
                                      <span className="text-muted">{startIndex + index + 1}</span>
                                    </td>
                                    <td>
                                      <code className="text-primary">{data.reference}</code>
                                    </td>
                                    <td>
                                      {data.sender ? (
                                        <div>
                                          <div className="fw-semibold">
                                            {data.sender?.username || data.sender?.name || "Unknown"}
                                          </div>
                                          <small className="text-muted">{data.sender?.email || ""}</small>
                                        </div>
                                      ) : (
                                        <span className="text-muted">Not available</span>
                                      )}
                                    </td>
                                    <td>
                                      {data.receiver ? (
                                        <div>
                                          <div className="fw-semibold">
                                            {data.receiver?.username || data.receiver?.name || "Unknown"}
                                          </div>
                                          <small className="text-muted">{data.receiver?.email || ""}</small>
                                        </div>
                                      ) : (
                                        <span className="text-muted">Not available</span>
                                      )}
                                    </td>
                                    <td>
                                      <small className="text-muted">{data.description || "N/A"}</small>
                                    </td>
                                    <td>
                                      <span className="fw-bold">
                                        {new Intl.NumberFormat("en-NG", {
                                          style: "currency",
                                          currency: "NGN",
                                        }).format(data.amount)}
                                      </span>
                                    </td>
                                    <td>
                                      <span className={`badge ${getStatusBadgeColor(data.status)} text-white`}>
                                        {data.status}
                                      </span>
                                    </td>
                                    <td>
                                      <small>
                                        {new Date(data.created_at).toLocaleDateString("en-US", {
                                          year: "numeric",
                                          month: "short",
                                          day: "numeric",
                                        })}
                                      </small>
                                    </td>
                                    <td>
                                      <button
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => handleView(data)}
                                      >
                                        <i className="bx bx-show"></i>
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>

                    {/* Mobile Card View */}
                    <div className="d-lg-none">
                      {loading ? (
                        <div className="text-center p-5">
                          <div
                            className="spinner-border text-primary"
                            role="status"
                            style={{ width: "3rem", height: "3rem" }}
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mt-3 text-muted">Loading gift transactions...</p>
                        </div>
                      ) : currentPageData.length === 0 ? (
                        <div className="card border-0 shadow-sm">
                          <div className="card-body text-center py-5">
                            <i className="bx bx-search-alt-2 display-4 text-muted"></i>
                            <p className="text-muted mt-3">No transactions found</p>
                            {(filterStatus || searchTerm) && (
                              <button
                                className="btn btn-sm btn-outline-primary mt-2"
                                onClick={clearFilters}
                              >
                                Clear Filters
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="d-flex flex-column gap-3">
                          {currentPageData.map((data, index) => (
                            <div
                              key={data.id || index}
                              className="card border-0 shadow-sm"
                              onClick={() => handleView(data)}
                              style={{ cursor: "pointer" }}
                            >
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                  <div className="flex-grow-1">
                                    <code className="text-primary small">{data.reference}</code>
                                    <div className="mt-2">
                                      <span className={`badge ${getStatusBadgeColor(data.status)} text-white`}>
                                        {data.status}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-end">
                                    <div className="fw-bold fs-6">
                                      {new Intl.NumberFormat("en-NG", {
                                        style: "currency",
                                        currency: "NGN",
                                      }).format(data.amount)}
                                    </div>
                                  </div>
                                </div>

                                <div className="mb-3">
                                  <div className="row g-2">
                                    <div className="col-6">
                                      <small className="text-muted d-block">Sender</small>
                                      {data.sender ? (
                                        <div>
                                          <div className="fw-semibold small">
                                            {data.sender?.username || data.sender?.name || "Unknown"}
                                          </div>
                                          <small className="text-muted">{data.sender?.email || ""}</small>
                                        </div>
                                      ) : (
                                        <span className="text-muted small">Not available</span>
                                      )}
                                    </div>
                                    <div className="col-6">
                                      <small className="text-muted d-block">Receiver</small>
                                      {data.receiver ? (
                                        <div>
                                          <div className="fw-semibold small">
                                            {data.receiver?.username || data.receiver?.name || "Unknown"}
                                          </div>
                                          <small className="text-muted">{data.receiver?.email || ""}</small>
                                        </div>
                                      ) : (
                                        <span className="text-muted small">Not available</span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {data.description && (
                                  <div className="mb-3">
                                    <small className="text-muted d-block">Description</small>
                                    <small>{data.description}</small>
                                  </div>
                                )}

                                <div className="d-flex justify-content-between align-items-center">
                                  <small className="text-muted">
                                    <i className="bx bx-calendar me-1"></i>
                                    {new Date(data.created_at).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </small>
                                  <i className="bx bx-chevron-right text-muted"></i>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Pagination */}
                    {!loading && filteredData.length > 0 && totalFilteredPages > 1 && (
                      <nav className="mt-4">
                        <ul className="pagination justify-content-center flex-wrap">
                          <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                            <button
                              className="page-link"
                              onClick={() => setPage(page - 1)}
                              disabled={page === 1}
                            >
                              <i className="bx bx-chevron-left"></i>
                              <span className="d-none d-sm-inline ms-1">Previous</span>
                            </button>
                          </li>

                          {renderPageButtons()}

                          <li className={`page-item ${page === totalFilteredPages ? "disabled" : ""}`}>
                            <button
                              className="page-link"
                              onClick={() => setPage(page + 1)}
                              disabled={page === totalFilteredPages}
                            >
                              <span className="d-none d-sm-inline me-1">Next</span>
                              <i className="bx bx-chevron-right"></i>
                            </button>
                          </li>
                        </ul>
                      </nav>
                    )}
                  </div>
                </div>

                <Footer />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Modal */}
      {showViewModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content border-0 shadow">
                <div className="modal-header bg-light">
                  <h5 className="modal-title fw-bold">
                    <i className="bx bx-gift me-2"></i>Gift Transaction Details
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowViewModal(false)}
                  ></button>
                </div>
                <div className="modal-body p-0">
                  {selectedItem ? (
                    <div className="list-group list-group-flush">
                      <div className="list-group-item">
                        <small className="text-muted d-block mb-1">Reference</small>
                        <code className="text-primary">{selectedItem.reference}</code>
                      </div>

                      {selectedItem.sender && (
                        <div className="list-group-item">
                          <small className="text-muted d-block mb-1">Sender</small>
                          <div className="fw-semibold">
                            {selectedItem.sender?.username || selectedItem.sender?.name}
                          </div>
                          <small className="text-muted">{selectedItem.sender?.email}</small>
                        </div>
                      )}

                      {selectedItem.receiver && (
                        <div className="list-group-item">
                          <small className="text-muted d-block mb-1">Receiver</small>
                          <div className="fw-semibold">
                            {selectedItem.receiver?.username || selectedItem.receiver?.name}
                          </div>
                          <small className="text-muted">{selectedItem.receiver?.email}</small>
                        </div>
                      )}

                      <div className="list-group-item">
                        <small className="text-muted d-block mb-1">Description</small>
                        <div className="text-muted">{selectedItem.description}</div>
                      </div>

                      <div className="list-group-item bg-light">
                        <small className="text-muted d-block mb-1">Amount</small>
                        <div className="text-success fw-bold fs-5">
                          {new Intl.NumberFormat("en-NG", {
                            style: "currency",
                            currency: "NGN",
                            minimumFractionDigits: 0,
                          }).format(selectedItem.amount)}
                        </div>
                      </div>

                      {selectedItem.channel && (
                        <div className="list-group-item">
                          <small className="text-muted d-block mb-1">Channel</small>
                          <div>{selectedItem.channel}</div>
                        </div>
                      )}

                      {selectedItem.bank && (
                        <div className="list-group-item">
                          <small className="text-muted d-block mb-1">Bank</small>
                          <div>{selectedItem.bank}</div>
                        </div>
                      )}

                      {selectedItem.currency && (
                        <div className="list-group-item">
                          <small className="text-muted d-block mb-1">Currency</small>
                          <div>{selectedItem.currency}</div>
                        </div>
                      )}

                      {selectedItem.message && (
                        <div className="list-group-item">
                          <small className="text-muted d-block mb-1">Message</small>
                          <em className="text-muted">"{selectedItem.message}"</em>
                        </div>
                      )}

                      <div className="list-group-item">
                        <small className="text-muted d-block mb-1">Status</small>
                        <span className={`badge ${getStatusBadgeColor(selectedItem.status)} text-white`}>
                          {selectedItem.status}
                        </span>
                      </div>

                      <div className="list-group-item">
                        <small className="text-muted d-block mb-1">Date & Time</small>
                        <div>
                          {new Date(selectedItem.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-muted">No details available</div>
                  )}
                </div>
                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowViewModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
}