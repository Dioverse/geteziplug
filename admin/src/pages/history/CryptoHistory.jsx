import React, { useEffect, useState } from "react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import Topnav from "../../components/Topnav";
import HistoryLink from "../../components/HistoryLink";
import { getRequest } from "../../services/apiServices";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CryptoHistory() {
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const [filterType, setFilterType] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingApprove, setLoadingApprove] = useState(false);

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const fetchData = async (pageNumber) => {
    setLoading(true);
    try {
      const res = await getRequest(`/histories/crypto?page=${pageNumber}`);
      const records = res.data?.results?.Data?.data || [];
      setAllData(records);
      setTotalPages(res.data?.results?.Data?.last_page || 1);
    } catch (err) {
      console.error("Failed to fetch crypto history:", err);
      toast.error("Failed to load crypto history");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (id) => {
    toast.info(
      <div>
        <p>Are you sure you want to approve this request?</p>
        <div className="d-flex justify-content-end">
          <button className="btn btn-secondary btn-sm me-2" onClick={() => toast.dismiss()}>
            Cancel
          </button>
          <button
            className="btn btn-success btn-sm"
            disabled={loadingApprove}
            onClick={async () => {
              try {
                setLoadingApprove(true);
                await getRequest(`/crypto/${id}/approve`);
                toast.success("Approved successfully");
                fetchData(page);
                toast.dismiss();
              } catch (err) {
                console.error(err);
                toast.error("Failed to approve");
              } finally {
                setLoadingApprove(false);
              }
            }}
          >
            {loadingApprove ? "Approving..." : "Yes, Approve"}
          </button>
        </div>
      </div>,
      { autoClose: false }
    );
  };

  const handleReject = (id) => {
    toast.info(
      ({ closeToast }) => (
        <div>
          <p>Are you sure you want to reject this?</p>
          <button
            className="btn btn-sm btn-danger me-2"
            onClick={() => {
              setRejectId(id);
              setShowRejectModal(true);
              closeToast();
            }}
          >
            Yes
          </button>
          <button className="btn btn-sm btn-secondary" onClick={closeToast}>
            No
          </button>
        </div>
      ),
      { autoClose: false }
    );
  };

  const clearFilters = () => {
    setFilterType("");
    setStatusFilter("");
    setSearchTerm("");
  };

  const filteredData = allData.filter((d) => {
    const typeMatch = filterType ? d.type === filterType : true;
    const statusMatch = statusFilter ? d.status?.toLowerCase() === statusFilter : true;
    const searchMatch = searchTerm
      ? d.transaction_hash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.wallet_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.crypto?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return typeMatch && statusMatch && searchMatch;
  });

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-success";
      case "pending":
        return "bg-warning";
      case "failed":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  const getTypeBadgeColor = (type) => {
    return type === "buy" ? "bg-primary" : "bg-info";
  };

  const renderPageButtons = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => (
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
          <button className="page-link" onClick={() => setPage(1)}>
            1
          </button>
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

    for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
      buttons.push(
        <li key={i} className={`page-item ${page === i ? "active" : ""}`}>
          <button className="page-link" onClick={() => setPage(i)}>
            {i}
          </button>
        </li>
      );
    }

    if (page < totalPages - 2) {
      if (page < totalPages - 3) {
        buttons.push(
          <li key="dots-end" className="page-item disabled">
            <span className="page-link">...</span>
          </li>
        );
      }
      buttons.push(
        <li key={totalPages} className="page-item">
          <button className="page-link" onClick={() => setPage(totalPages)}>
            {totalPages}
          </button>
        </li>
      );
    }

    return buttons;
  };

  return (
    <div className="layout-wrapper layout-content-navbar">
      <div className="layout-container">
        <Navbar />
        <div className="layout-page">
          <Topnav />
          <div className="content-wrapper">
            <div className="container-xxl flex-grow-1 container-p-y">
              <h4 className="fw-bold py-3 mb-4">
                <span className="text-muted fw-light">Home / History</span> / Crypto History
              </h4>

              <HistoryLink />

              {/* Modern Filter Card */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <div className="row g-3">
                    {/* Search Bar */}
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold text-muted mb-2">
                        <i className="bx bx-search me-1"></i>Search
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Hash, user, wallet, chain..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    {/* Type Filter */}
                    <div className="col-12 col-md-3">
                      <label className="form-label small fw-semibold text-muted mb-2">
                        <i className="bx bxl-bitcoin me-1"></i>Transaction Type
                      </label>
                      <select
                        className="form-select"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                      >
                        <option value="">All Types</option>
                        <option value="buy">Buy</option>
                        <option value="sell">Sell</option>
                      </select>
                    </div>

                    {/* Status Filter */}
                    <div className="col-12 col-md-3">
                      <label className="form-label small fw-semibold text-muted mb-2">
                        <i className="bx bx-check-circle me-1"></i>Status
                      </label>
                      <select
                        className="form-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="">All Status</option>
                        <option value="approved">Approved</option>
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
                  {(filterType || statusFilter || searchTerm) && (
                    <div className="mt-3 d-flex flex-wrap gap-2 align-items-center">
                      <span className="text-muted small">Active filters:</span>
                      {filterType && (
                        <span className="badge bg-primary">
                          Type: {filterType}
                          <i
                            className="bx bx-x ms-1"
                            onClick={() => setFilterType("")}
                            style={{ cursor: "pointer" }}
                          ></i>
                        </span>
                      )}
                      {statusFilter && (
                        <span className="badge bg-info">
                          Status: {statusFilter}
                          <i
                            className="bx bx-x ms-1"
                            onClick={() => setStatusFilter("")}
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
                    Showing {filteredData.length} result{filteredData.length !== 1 ? "s" : ""}
                  </span>
                  {filteredData.length !== allData.length && (
                    <span className="text-muted small">
                      (Filtered from {allData.length} total records)
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
                      <p className="mt-3 text-muted">Loading crypto transactions...</p>
                    </div>
                  ) : (
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="px-4 py-3">#</th>
                          <th className="py-3">Tx Hash</th>
                          <th className="py-3">User</th>
                          <th className="py-3">Chain</th>
                          <th className="py-3">Type</th>
                          <th className="py-3">Wallet</th>
                          <th className="py-3">Quantity</th>
                          <th className="py-3">USD</th>
                          <th className="py-3">NGN</th>
                          <th className="py-3">Status</th>
                          <th className="py-3">Date</th>
                          <th className="py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.length === 0 ? (
                          <tr>
                            <td colSpan="12" className="text-center py-5">
                              <i className="bx bx-search-alt-2 display-4 text-muted"></i>
                              <p className="text-muted mt-3">No transactions found</p>
                              {(filterType || statusFilter || searchTerm) && (
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
                          filteredData.map((data, index) => (
                            <tr key={data.id ?? index}>
                              <td className="px-4">
                                <span className="text-muted">{index + 1}</span>
                              </td>
                              <td>
                                <code className="text-primary small">
                                  {data.transaction_hash
                                    ? `${data.transaction_hash.substring(0, 10)}...`
                                    : "—"}
                                </code>
                              </td>
                              <td>
                                <div className="fw-semibold">{data.user?.username ?? "—"}</div>
                              </td>
                              <td>
                                <span className="badge bg-dark text-white">
                                  <i className="bx bxl-bitcoin me-1"></i>
                                  {data.crypto?.name ?? "—"}
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${getTypeBadgeColor(data.type)} text-white`}>
                                  {data.type}
                                </span>
                              </td>
                              <td>
                                <code className="small">
                                  {data.wallet_address
                                    ? `${data.wallet_address.substring(0, 8)}...`
                                    : "—"}
                                </code>
                              </td>
                              <td>
                                <span className="fw-semibold">{data.amount_crypto}</span>
                              </td>
                              <td>
                                <span className="fw-bold text-success">
                                  {new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                  }).format(data.amount)}
                                </span>
                              </td>
                              <td>
                                <span className="fw-bold">
                                  {new Intl.NumberFormat("en-NG", {
                                    style: "currency",
                                    currency: "NGN",
                                  }).format(data.naira_equivalent)}
                                </span>
                              </td>
                              <td>
                                <span
                                  className={`badge ${getStatusBadgeColor(data.status)} text-white`}
                                >
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
                                {data.status === "pending" && (
                                  <div className="dropdown">
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-secondary dropdown-toggle"
                                      data-bs-toggle="dropdown"
                                    >
                                      <i className="bx bx-dots-vertical-rounded"></i>
                                    </button>
                                    <div className="dropdown-menu">
                                      <button
                                        className="dropdown-item"
                                        onClick={() => handleApprove(data.id)}
                                      >
                                        <i className="bx bx-check me-1"></i> Approve
                                      </button>
                                      <button
                                        className="dropdown-item text-danger"
                                        onClick={() => handleReject(data.id)}
                                      >
                                        <i className="bx bx-x me-1"></i> Reject
                                      </button>
                                    </div>
                                  </div>
                                )}
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
                    <p className="mt-3 text-muted">Loading crypto transactions...</p>
                  </div>
                ) : filteredData.length === 0 ? (
                  <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                      <i className="bx bx-search-alt-2 display-4 text-muted"></i>
                      <p className="text-muted mt-3">No transactions found</p>
                      {(filterType || statusFilter || searchTerm) && (
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
                    {filteredData.map((data, index) => (
                      <div key={data.id ?? index} className="card border-0 shadow-sm">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div className="flex-grow-1">
                              <code className="text-primary small">
                                {data.transaction_hash
                                  ? `${data.transaction_hash.substring(0, 16)}...`
                                  : "—"}
                              </code>
                              <div className="mt-2 d-flex gap-2">
                                <span className="badge bg-dark text-white">
                                  <i className="bx bxl-bitcoin me-1"></i>
                                  {data.crypto?.name ?? "—"}
                                </span>
                                <span className={`badge ${getTypeBadgeColor(data.type)} text-white`}>
                                  {data.type}
                                </span>
                              </div>
                            </div>
                            <span
                              className={`badge ${getStatusBadgeColor(data.status)} text-white`}
                            >
                              {data.status}
                            </span>
                          </div>

                          <div className="row g-3 mb-3">
                            <div className="col-6">
                              <small className="text-muted d-block">User</small>
                              <div className="fw-semibold">{data.user?.username ?? "—"}</div>
                            </div>
                            <div className="col-6">
                              <small className="text-muted d-block">Quantity</small>
                              <div className="fw-semibold">{data.amount_crypto}</div>
                            </div>
                          </div>

                          <div className="row g-3 mb-3">
                            <div className="col-6">
                              <small className="text-muted d-block">USD Amount</small>
                              <div className="fw-bold text-success">
                                {new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency: "USD",
                                }).format(data.amount)}
                              </div>
                            </div>
                            <div className="col-6">
                              <small className="text-muted d-block">NGN Amount</small>
                              <div className="fw-bold">
                                {new Intl.NumberFormat("en-NG", {
                                  style: "currency",
                                  currency: "NGN",
                                }).format(data.naira_equivalent)}
                              </div>
                            </div>
                          </div>

                          <div className="mb-3">
                            <small className="text-muted d-block">Wallet Address</small>
                            <code className="small">
                              {data.wallet_address
                                ? `${data.wallet_address.substring(0, 16)}...`
                                : "—"}
                            </code>
                          </div>

                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                              <i className="bx bx-calendar me-1"></i>
                              {new Date(data.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </small>
                            {data.status === "pending" && (
                              <div className="dropdown">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary dropdown-toggle"
                                  data-bs-toggle="dropdown"
                                >
                                  Actions
                                </button>
                                <div className="dropdown-menu">
                                  <button
                                    className="dropdown-item"
                                    onClick={() => handleApprove(data.id)}
                                  >
                                    <i className="bx bx-check me-1"></i> Approve
                                  </button>
                                  <button
                                    className="dropdown-item text-danger"
                                    onClick={() => handleReject(data.id)}
                                  >
                                    <i className="bx bx-x me-1"></i> Reject
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {!loading && filteredData.length > 0 && totalPages > 1 && (
                <nav className="mt-4">
                  <ul className="pagination justify-content-center flex-wrap">
                    <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <i className="bx bx-chevron-left"></i>
                        <span className="d-none d-sm-inline ms-1">Previous</span>
                      </button>
                    </li>

                    {renderPageButtons()}

                    <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        <span className="d-none d-sm-inline me-1">Next</span>
                        <i className="bx bx-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              )}

              <Footer />
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}