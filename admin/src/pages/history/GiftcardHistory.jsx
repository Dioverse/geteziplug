import React, { useEffect, useState } from "react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import Topnav from "../../components/Topnav";
import HistoryLink from "../../components/HistoryLink";
import { getRequest, postRequest } from "../../services/apiServices";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function GiftcardHistory() {
  const [datas, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [filterType, setFilterType] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [loadingApprove, setLoadingApprove] = useState(false);

  const giftcardTypes = [
    { value: "Amazon", label: "Amazon", color: "bg-warning" },
    { value: "Zelle", label: "Zelle", color: "bg-primary" },
    { value: "Dribble", label: "Dribble", color: "bg-danger" },
  ];

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const fetchData = async (pageNum) => {
    setLoading(true);
    try {
      const res = await getRequest(
        `/histories/giftcard?page=${pageNum}&limit=${pageSize}`
      );
      setData(res.data?.results?.Data?.data || []);
      setTotalPages(res.data.results.Data.last_page || 1);
    } catch (err) {
      console.error("Failed to fetch giftcard history:", err);
      toast.error("Failed to load giftcard history");
    } finally {
      setLoading(false);
    }
  };

  const filteredData = datas.filter((d) => {
    const typeMatch = filterType ? d.card_type === filterType : true;
    const statusMatch = statusFilter ? d.status === statusFilter : true;
    const searchMatch = searchTerm
      ? d.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.card_type?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return typeMatch && statusMatch && searchMatch;
  });

  const clearFilters = () => {
    setFilterType("");
    setStatusFilter("");
    setSearchTerm("");
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setShowViewModal(true);
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
                await getRequest(`/giftcard/${id}/approve`);
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

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-success";
      case "pending":
        return "bg-warning";
      case "rejected":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  const getCardTypeBadgeColor = (cardType) => {
    const type = giftcardTypes.find(t => t.value === cardType);
    return type ? type.color : "bg-secondary";
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

    for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
      buttons.push(
        <li key={i} className={`page-item ${page === i ? "active" : ""}`}>
          <button className="page-link" onClick={() => setPage(i)}>{i}</button>
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
    <>
      <div className="layout-wrapper layout-content-navbar">
        <div className="layout-container">
          <Navbar />
          <div className="layout-page">
            <Topnav />
            <div className="content-wrapper">
              <div className="container-xxl flex-grow-1 container-p-y">
                <h4 className="fw-bold py-3 mb-4">
                  <span className="text-muted fw-light">Home / History</span> / Giftcard History
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
                          placeholder="Reference, user, card type..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>

                      {/* Card Type Filter */}
                      <div className="col-12 col-md-3">
                        <label className="form-label small fw-semibold text-muted mb-2">
                          <i className="bx bx-gift me-1"></i>Card Type
                        </label>
                        <select
                          className="form-select"
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                        >
                          <option value="">All Types</option>
                          {giftcardTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
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
                          <option value="rejected">Rejected</option>
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
                        <p className="mt-3 text-muted">Loading giftcard transactions...</p>
                      </div>
                    ) : (
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th className="px-4 py-3">#</th>
                            <th className="py-3">Reference</th>
                            <th className="py-3">User</th>
                            <th className="py-3">Card Type</th>
                            <th className="py-3">Transaction</th>
                            <th className="py-3">Quantity</th>
                            <th className="py-3">Amount (NGN)</th>
                            <th className="py-3">Status</th>
                            <th className="py-3">Date</th>
                            <th className="py-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredData.length === 0 ? (
                            <tr>
                              <td colSpan="10" className="text-center py-5">
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
                              <tr key={data.id || index}>
                                <td className="px-4">
                                  <span className="text-muted">
                                    {(page - 1) * pageSize + index + 1}
                                  </span>
                                </td>
                                <td>
                                  <code className="text-primary">{data.reference}</code>
                                </td>
                                <td>
                                  <div className="fw-semibold">
                                    {data.user?.username || "Unknown User"}
                                  </div>
                                  <small className="text-muted">{data.user?.email || ""}</small>
                                </td>
                                <td>
                                  <span className={`badge ${getCardTypeBadgeColor(data.card_type)} text-white`}>
                                    <i className="bx bx-gift me-1"></i>
                                    {data.card_type}
                                  </span>
                                </td>
                                <td>
                                  <span className="badge bg-dark text-white text-capitalize">
                                    {data.type}
                                  </span>
                                </td>
                                <td>
                                  <span className="fw-semibold">{data.quantity}</span>
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
                                      {data.type === "sell" && (
                                        <button
                                          className="dropdown-item"
                                          onClick={() => handleView(data)}
                                        >
                                          <i className="bx bx-show me-1"></i> View Details
                                        </button>
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
                      <p className="mt-3 text-muted">Loading giftcard transactions...</p>
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
                        <div key={data.id || index} className="card border-0 shadow-sm">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div className="flex-grow-1">
                                <code className="text-primary small">{data.reference}</code>
                                <div className="mt-2 d-flex gap-2 flex-wrap">
                                  <span className={`badge ${getCardTypeBadgeColor(data.card_type)} text-white`}>
                                    <i className="bx bx-gift me-1"></i>
                                    {data.card_type}
                                  </span>
                                  <span className="badge bg-dark text-white text-capitalize">
                                    {data.type}
                                  </span>
                                </div>
                              </div>
                              <span className={`badge ${getStatusBadgeColor(data.status)} text-white`}>
                                {data.status}
                              </span>
                            </div>

                            <div className="row g-3 mb-3">
                              <div className="col-6">
                                <small className="text-muted d-block">User</small>
                                <div className="fw-semibold">{data.user?.username || "Unknown User"}</div>
                                <small className="text-muted">{data.user?.email || ""}</small>
                              </div>
                              <div className="col-6">
                                <small className="text-muted d-block">Quantity</small>
                                <div className="fw-semibold">{data.quantity}</div>
                              </div>
                            </div>

                            <div className="mb-3">
                              <small className="text-muted d-block">Amount</small>
                              <div className="fw-bold fs-5">
                                {new Intl.NumberFormat("en-NG", {
                                  style: "currency",
                                  currency: "NGN",
                                }).format(data.naira_equivalent)}
                              </div>
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
                                  {data.type === "sell" && (
                                    <button
                                      className="dropdown-item"
                                      onClick={() => handleView(data)}
                                    >
                                      <i className="bx bx-show me-1"></i> View Details
                                    </button>
                                  )}
                                </div>
                              </div>
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
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
}