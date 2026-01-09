import React, { useEffect, useState } from "react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import Topnav from "../../components/Topnav";
import HistoryLink from "../../components/HistoryLink";
import { getRequest } from "../../services/apiServices";

export default function BillHistory() {
  const [datas, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const billers = [
    { value: "abuja-electric", label: "AEDC - Abuja Electric" },
    { value: "enugu-electric", label: "EEDC - Enugu Electric" },
    { value: "eko-electric", label: "EKEDC - Eko Electric" },
    { value: "ibadan-electric", label: "IBEDC - Ibadan Electric" },
    { value: "ikeja-electric", label: "IKEDC - Ikeja Electric" },
    { value: "jos-electric", label: "JEDC - Jos Electric" },
    { value: "kano-electric", label: "KEDC - Kano Electric" },
    { value: "kaduna-electric", label: "KAEDC - Kaduna Electric" },
    { value: "portharcourt-electric", label: "PHEDC - Port Harcourt Electric" },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [filter, statusFilter, searchTerm, datas]);

  useEffect(() => {
    calculatePages();
  }, [filteredData]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getRequest(`/histories/bill`);
      const results = res.data?.results?.Data || [];
      setData(results);
      setFilteredData(results);
    } catch (err) {
      console.error("Failed to fetch bill history:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let tempData = [...datas];

    if (filter) {
      tempData = tempData.filter((d) => String(d.bill?.serviceID) === filter);
    }

    if (statusFilter) {
      tempData = tempData.filter((d) => d.status?.toLowerCase() === statusFilter);
    }

    if (searchTerm) {
      tempData = tempData.filter((d) =>
        d.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.account_number?.includes(searchTerm) ||
        d.phone?.includes(searchTerm)
      );
    }

    setFilteredData(tempData);
    setPage(1);
  };

  const calculatePages = () => {
    const total = filteredData.length;
    setTotalPages(Math.ceil(total / pageSize) || 1);
  };

  const clearFilters = () => {
    setFilter("");
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

  const paginatedData = filteredData.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const renderPageButtons = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => (
        <li key={i} className={`page-item ${page === i + 1 ? "active" : ""}`}>
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
    <div className="layout-wrapper layout-content-navbar">
      <div className="layout-container">
        <Navbar />
        <div className="layout-page">
          <Topnav />
          <div className="content-wrapper">
            <div className="container-xxl flex-grow-1 container-p-y">
              <h4 className="fw-bold py-3 mb-4">
                <span className="text-muted fw-light">Home / History</span> / Bill History
              </h4>

              <div className="row">
                <div className="col-lg-12 mb-4 order-0">
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
                            placeholder="Reference, user, account, phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>

                        {/* Biller Filter */}
                        <div className="col-12 col-md-3">
                          <label className="form-label small fw-semibold text-muted mb-2">
                            <i className="bx bx-store me-1"></i>Biller
                          </label>
                          <select
                            className="form-select"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                          >
                            <option value="">All Billers</option>
                            {billers.map((biller) => (
                              <option key={biller.value} value={biller.value}>
                                {biller.label}
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
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
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
                      {(filter || statusFilter || searchTerm) && (
                        <div className="mt-3 d-flex flex-wrap gap-2 align-items-center">
                          <span className="text-muted small">Active filters:</span>
                          {filter && (
                            <span className="badge bg-primary">
                              Biller: {billers.find(b => b.value === filter)?.label || filter}
                              <i 
                                className="bx bx-x ms-1" 
                                onClick={() => setFilter("")}
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
                        Showing {paginatedData.length > 0 ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, filteredData.length)} of {filteredData.length} results
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
                          <p className="mt-3 text-muted">Loading bill transactions...</p>
                        </div>
                      ) : (
                        <table className="table table-hover align-middle mb-0">
                          <thead className="table-light">
                            <tr>
                              <th className="px-4 py-3">#</th>
                              <th className="py-3">Reference</th>
                              <th className="py-3">User</th>
                              <th className="py-3">Biller</th>
                              <th className="py-3">Account No.</th>
                              <th className="py-3">Phone</th>
                              <th className="py-3">Amount</th>
                              <th className="py-3">Status</th>
                              <th className="py-3">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedData.length === 0 ? (
                              <tr>
                                <td colSpan="9" className="text-center py-5">
                                  <i className="bx bx-search-alt-2 display-4 text-muted"></i>
                                  <p className="text-muted mt-3">No transactions found</p>
                                  {(filter || statusFilter || searchTerm) && (
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
                              paginatedData.map((data, index) => (
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
                                    <div className="fw-semibold">{data.user?.username}</div>
                                  </td>
                                  <td>
                                    <span className="badge bg-info text-white">
                                      {data.bill?.serviceID?.toUpperCase()}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="font-monospace">{data.account_number}</span>
                                  </td>
                                  <td>
                                    <span className="text-nowrap">{data.phone}</span>
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
                                      {data.status === "success" ? "Successful" : 
                                       data.status === "pending" ? "Pending" : "Failed"}
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
                        <p className="mt-3 text-muted">Loading bill transactions...</p>
                      </div>
                    ) : paginatedData.length === 0 ? (
                      <div className="card border-0 shadow-sm">
                        <div className="card-body text-center py-5">
                          <i className="bx bx-search-alt-2 display-4 text-muted"></i>
                          <p className="text-muted mt-3">No transactions found</p>
                          {(filter || statusFilter || searchTerm) && (
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
                        {paginatedData.map((data, index) => (
                          <div key={data.id || index} className="card border-0 shadow-sm">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="flex-grow-1">
                                  <code className="text-primary small">{data.reference}</code>
                                  <div className="mt-2">
                                    <span className="badge bg-info text-white">
                                      {data.bill?.serviceID?.toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                <span className={`badge ${getStatusBadgeColor(data.status)} text-white`}>
                                  {data.status === "success" ? "Successful" : 
                                   data.status === "pending" ? "Pending" : "Failed"}
                                </span>
                              </div>

                              <div className="row g-3 mb-3">
                                <div className="col-6">
                                  <small className="text-muted d-block">User</small>
                                  <div className="fw-semibold">{data.user?.username}</div>
                                </div>
                                <div className="col-6">
                                  <small className="text-muted d-block">Amount</small>
                                  <div className="fw-bold">
                                    {new Intl.NumberFormat("en-NG", {
                                      style: "currency",
                                      currency: "NGN",
                                    }).format(data.amount)}
                                  </div>
                                </div>
                              </div>

                              <div className="row g-3 mb-3">
                                <div className="col-6">
                                  <small className="text-muted d-block">Account No.</small>
                                  <div className="font-monospace small">{data.account_number}</div>
                                </div>
                                <div className="col-6">
                                  <small className="text-muted d-block">Phone</small>
                                  <div>{data.phone}</div>
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
                </div>
              </div>

              <Footer />
              <div className="content-backdrop fade"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}