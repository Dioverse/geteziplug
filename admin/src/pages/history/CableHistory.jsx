import React, { useEffect, useState } from "react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import Topnav from "../../components/Topnav";
import HistoryLink from "../../components/HistoryLink";
import api from "../../services/api";

export default function CableHistory() {
  const [datas, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [planFilter, setPlanFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const cablePlans = [
    { value: "GOTV", label: "GOTV", icon: "bx-tv" },
    { value: "DSTV", label: "DSTV", icon: "bx-tv" },
    { value: "Startimes", label: "Startimes", icon: "bx-tv" },
  ];

  useEffect(() => {
    fetchData(page);
  }, [page]);

  useEffect(() => {
    applyFilter();
  }, [planFilter, statusFilter, searchTerm, datas]);

  const fetchData = async (pageNum = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/admin/histories/cable?page=${pageNum}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const apiData = res?.data?.results?.Data;

      setData(apiData?.data || []);
      setFilteredData(apiData?.data || []);
      setLastPage(apiData?.last_page || 1);
    } catch (err) {
      console.error("Failed to fetch cable history:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let temp = [...datas];

    if (planFilter) {
      temp = temp.filter(
        (d) => d.cable?.name.toLowerCase() === planFilter.toLowerCase()
      );
    }

    if (statusFilter) {
      temp = temp.filter(
        (d) => d.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (searchTerm) {
      temp = temp.filter((d) =>
        d.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.iuc_number?.includes(searchTerm) ||
        d.phone?.includes(searchTerm)
      );
    }

    setFilteredData(temp);
  };

  const clearFilters = () => {
    setPlanFilter("");
    setStatusFilter("");
    setSearchTerm("");
  };

  const getStatusBadgeColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'success':
        return 'bg-success';
      case 'pending':
        return 'bg-warning';
      case 'failed':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  const getPlanBadgeColor = (plan) => {
    const planName = plan?.toLowerCase();
    if (planName?.includes('dstv')) return 'bg-danger';
    if (planName?.includes('gotv')) return 'bg-primary';
    if (planName?.includes('startimes')) return 'bg-info';
    return 'bg-secondary';
  };

  const renderPageButtons = () => {
    if (lastPage <= 7) {
      return Array.from({ length: lastPage }, (_, i) => (
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

    for (let i = Math.max(1, page - 2); i <= Math.min(lastPage, page + 2); i++) {
      buttons.push(
        <li key={i} className={`page-item ${page === i ? "active" : ""}`}>
          <button className="page-link" onClick={() => setPage(i)}>{i}</button>
        </li>
      );
    }

    if (page < lastPage - 2) {
      if (page < lastPage - 3) {
        buttons.push(
          <li key="dots-end" className="page-item disabled">
            <span className="page-link">...</span>
          </li>
        );
      }
      buttons.push(
        <li key={lastPage} className="page-item">
          <button className="page-link" onClick={() => setPage(lastPage)}>
            {lastPage}
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
                <span className="text-muted fw-light">Home / History</span> / Cable History
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
                        placeholder="Reference, user, IUC, phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    {/* Plan Filter */}
                    <div className="col-12 col-md-3">
                      <label className="form-label small fw-semibold text-muted mb-2">
                        <i className="bx bx-tv me-1"></i>TV Provider
                      </label>
                      <select
                        className="form-select"
                        value={planFilter}
                        onChange={(e) => setPlanFilter(e.target.value)}
                      >
                        <option value="">All Providers</option>
                        {cablePlans.map((plan) => (
                          <option key={plan.value} value={plan.value}>
                            {plan.label}
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
                        <option value="success">Successful</option>
                        <option value="failed">Failed</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>

                    {/* Clear Button */}
                    <div className="col-12 col-md-2 d-flex align-items-end">
                      <button
                        className="btn btn-outline-secondary w-100"
                        onClick={clearFilters}
                      >
                        <i className="bx bx-reset me-1"></i>Clear
                      </button>
                    </div>
                  </div>

                  {/* Active Filters Display */}
                  {(planFilter || statusFilter || searchTerm) && (
                    <div className="mt-3 d-flex flex-wrap gap-2 align-items-center">
                      <span className="text-muted small">Active filters:</span>
                      {planFilter && (
                        <span className="badge bg-primary">
                          Provider: {planFilter}
                          <i 
                            className="bx bx-x ms-1" 
                            onClick={() => setPlanFilter("")}
                            style={{ cursor: 'pointer' }}
                          ></i>
                        </span>
                      )}
                      {statusFilter && (
                        <span className="badge bg-info">
                          Status: {statusFilter}
                          <i 
                            className="bx bx-x ms-1" 
                            onClick={() => setStatusFilter("")}
                            style={{ cursor: 'pointer' }}
                          ></i>
                        </span>
                      )}
                      {searchTerm && (
                        <span className="badge bg-success">
                          Search: "{searchTerm}"
                          <i 
                            className="bx bx-x ms-1" 
                            onClick={() => setSearchTerm("")}
                            style={{ cursor: 'pointer' }}
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
                    Showing {filteredData.length} result{filteredData.length !== 1 ? 's' : ''}
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
                        style={{ width: "3rem", height: "3rem" }}>
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-3 text-muted">Loading cable transactions...</p>
                    </div>
                  ) : (
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="px-4 py-3">#</th>
                          <th className="py-3">Reference</th>
                          <th className="py-3">User</th>
                          <th className="py-3">TV Provider</th>
                          <th className="py-3">Plan</th>
                          <th className="py-3">IUC No.</th>
                          <th className="py-3">Phone</th>
                          <th className="py-3">Amount</th>
                          <th className="py-3">Status</th>
                          <th className="py-3">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.length === 0 ? (
                          <tr>
                            <td colSpan="10" className="text-center py-5">
                              <i className="bx bx-search-alt-2 display-4 text-muted"></i>
                              <p className="text-muted mt-3">No transactions found</p>
                              {(planFilter || statusFilter || searchTerm) && (
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
                          filteredData.map((d, idx) => (
                            <tr key={d.id ?? idx}>
                              <td className="px-4">
                                <span className="text-muted">{idx + 1}</span>
                              </td>
                              <td>
                                <code className="text-primary">{d.reference}</code>
                              </td>
                              <td>
                                <div className="fw-semibold">{d.user?.username ?? "—"}</div>
                              </td>
                              <td>
                                <span className={`badge ${getPlanBadgeColor(d.cable?.name)} text-white`}>
                                  <i className="bx bx-tv me-1"></i>
                                  {d.cable?.name ?? "—"}
                                </span>
                              </td>
                              <td>
                                <span className="text-muted small">
                                  {d.cable_plan?.name ?? "—"}
                                </span>
                              </td>
                              <td>
                                <span className="font-monospace">{d.iuc_number}</span>
                              </td>
                              <td>
                                <span className="text-nowrap">{d.phone}</span>
                              </td>
                              <td>
                                <span className="fw-bold">
                                  {new Intl.NumberFormat("en-NG", {
                                    style: "currency",
                                    currency: "NGN",
                                  }).format(d.amount)}
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${getStatusBadgeColor(d.status)} text-white`}>
                                  {d.status === "success" ? "Successful" : 
                                   d.status === "pending" ? "Pending" : "Failed"}
                                </span>
                              </td>
                              <td>
                                <small>
                                  {new Date(d.created_at).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </small>
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
                      style={{ width: "3rem", height: "3rem" }}>
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading cable transactions...</p>
                  </div>
                ) : filteredData.length === 0 ? (
                  <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                      <i className="bx bx-search-alt-2 display-4 text-muted"></i>
                      <p className="text-muted mt-3">No transactions found</p>
                      {(planFilter || statusFilter || searchTerm) && (
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
                    {filteredData.map((d, idx) => (
                      <div key={d.id ?? idx} className="card border-0 shadow-sm">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div className="flex-grow-1">
                              <code className="text-primary small">{d.reference}</code>
                              <div className="mt-2">
                                <span className={`badge ${getPlanBadgeColor(d.cable?.name)} text-white`}>
                                  <i className="bx bx-tv me-1"></i>
                                  {d.cable?.name ?? "—"}
                                </span>
                              </div>
                            </div>
                            <span className={`badge ${getStatusBadgeColor(d.status)} text-white`}>
                              {d.status === "success" ? "Successful" : 
                               d.status === "pending" ? "Pending" : "Failed"}
                            </span>
                          </div>

                          <div className="mb-3">
                            <small className="text-muted d-block">Plan</small>
                            <div className="fw-semibold">{d.cable_plan?.name ?? "—"}</div>
                          </div>

                          <div className="row g-3 mb-3">
                            <div className="col-6">
                              <small className="text-muted d-block">User</small>
                              <div className="fw-semibold">{d.user?.username ?? "—"}</div>
                            </div>
                            <div className="col-6">
                              <small className="text-muted d-block">Amount</small>
                              <div className="fw-bold">
                                {new Intl.NumberFormat("en-NG", {
                                  style: "currency",
                                  currency: "NGN",
                                }).format(d.amount)}
                              </div>
                            </div>
                          </div>

                          <div className="row g-3 mb-3">
                            <div className="col-6">
                              <small className="text-muted d-block">IUC Number</small>
                              <div className="font-monospace small">{d.iuc_number}</div>
                            </div>
                            <div className="col-6">
                              <small className="text-muted d-block">Phone</small>
                              <div>{d.phone}</div>
                            </div>
                          </div>

                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                              <i className="bx bx-calendar me-1"></i>
                              {new Date(d.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {!loading && filteredData.length > 0 && lastPage > 1 && (
                <nav className="mt-4">
                  <ul className="pagination justify-content-center flex-wrap">
                    <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                      >
                        <i className="bx bx-chevron-left"></i>
                        <span className="d-none d-sm-inline ms-1">Previous</span>
                      </button>
                    </li>

                    {renderPageButtons()}

                    <li className={`page-item ${page === lastPage ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setPage(Math.min(lastPage, page + 1))}
                        disabled={page === lastPage}
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
  );
}