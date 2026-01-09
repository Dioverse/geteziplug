import React, { useEffect, useState } from "react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import Topnav from "../../components/Topnav";
import HistoryLink from "../../components/HistoryLink";
import { getRequest } from "../../services/apiServices";

export default function DataHistory() {
  const [datas, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const pageSize = 10;

  const LOGO_CDN = {
    MTN: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/MTN_2022_logo.svg/250px-MTN_2022_logo.svg.png",
    AIRTEL: "https://s3-ap-southeast-1.amazonaws.com/bsy/iportal/images/airtel-logo-red-text-horizontal.jpg",
    GLO: "https://upload.wikimedia.org/wikipedia/commons/8/86/Glo_button.png",
    "9MOBILE": "https://9mobile.com.ng/_next/static/media/logos.1d851e63.png",
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getRequest(`/histories/data`);
      const allData = res.data?.results?.Data?.data || [];
      setData(allData);
    } catch (err) {
      console.error("Failed to fetch plan:", err);
    } finally {
      setLoading(false);
    }
  };

  const normalizeNetworkKey = (network) => {
    if (!network) return null;
    const s = typeof network === "string" ? network : network.name || network.code || "";
    const low = String(s).toLowerCase();
    if (low.includes("mtn")) return "MTN";
    if (low.includes("airtel")) return "AIRTEL";
    if (low.includes("glo")) return "GLO";
    if (low.includes("9") || low.includes("9mobile") || low.includes("t2")) return "9MOBILE";
    return null;
  };

  const getNetworkName = (network) => {
    if (!network) return "—";
    if (typeof network === "string") return network;
    return network.name || network.code || "—";
  };

  const getNetworkLogo = (network) => {
    if (!network) return null;
    if (typeof network === "object" && (typeof network.logo === "string" || typeof network.logo?.url === "string")) {
      return typeof network.logo === "string" ? network.logo : network.logo.url;
    }
    const key = normalizeNetworkKey(network);
    return key ? LOGO_CDN[key] : null;
  };

  // Apply all filters
  const filteredData = datas.filter((d) => {
    const networkMatch = filter ? normalizeNetworkKey(d.network) === filter : true;
    const statusMatch = statusFilter ? d.status?.toLowerCase() === statusFilter : true;
    const searchMatch = searchTerm ? 
      (d.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       d.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       d.phone?.includes(searchTerm) ||
       d.data_plan?.name?.toLowerCase().includes(searchTerm.toLowerCase())) : true;
    return networkMatch && statusMatch && searchMatch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  const clearFilters = () => {
    setFilter("");
    setStatusFilter("");
    setSearchTerm("");
    setPage(1);
  };

  const getStatusBadgeColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'approved':
        return 'bg-success';
      case 'pending':
        return 'bg-warning';
      case 'rejected':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

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
        <li key="first" className="page-item">
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

    Array.from({ length: totalPages }, (_, i) => i + 1)
      .filter(p => p >= page - 2 && p <= page + 2)
      .forEach(p => {
        buttons.push(
          <li key={p} className={`page-item ${page === p ? "active" : ""}`}>
            <button className="page-link" onClick={() => setPage(p)}>{p}</button>
          </li>
        );
      });

    if (page < totalPages - 2) {
      if (page < totalPages - 3) {
        buttons.push(
          <li key="dots-end" className="page-item disabled">
            <span className="page-link">...</span>
          </li>
        );
      }
      buttons.push(
        <li key="last" className="page-item">
          <button className="page-link" onClick={() => setPage(totalPages)}>{totalPages}</button>
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
                  <span className="text-muted fw-light">Home / History</span> / Data History
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
                              placeholder="Reference, user, phone, plan..."
                              value={searchTerm}
                              onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1);
                              }}
                            />
                          </div>

                          {/* Network Filter */}
                          <div className="col-12 col-md-3">
                            <label className="form-label small fw-semibold text-muted mb-2">
                              <i className="bx bx-network-chart me-1"></i>Network
                            </label>
                            <select
                              className="form-select"
                              value={filter}
                              onChange={(e) => {
                                setFilter(e.target.value);
                                setPage(1);
                              }}
                            >
                              <option value="">All Networks</option>
                              <option value="MTN">MTN</option>
                              <option value="AIRTEL">Airtel</option>
                              <option value="GLO">Glo</option>
                              <option value="9MOBILE">9mobile</option>
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
                              onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                              }}
                            >
                              <option value="">All Status</option>
                              <option value="approved">Approved</option>
                              <option value="pending">Pending</option>
                              <option value="rejected">Rejected</option>
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
                                Network: {filter}
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
                          Showing {paginatedData.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + pageSize, filteredData.length)} of {filteredData.length} results
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
                            <p className="mt-3 text-muted">Loading data transactions...</p>
                          </div>
                        ) : (
                          <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                              <tr>
                                <th className="px-4 py-3">#</th>
                                <th className="py-3">Reference</th>
                                <th className="py-3">User</th>
                                <th className="py-3">Network</th>
                                <th className="py-3">Data Plan</th>
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
                                paginatedData.map((data, index) => {
                                  const networkObj = data.network;
                                  const networkName = getNetworkName(networkObj);
                                  const logoUrl = getNetworkLogo(networkObj);
                                  return (
                                    <tr key={index}>
                                      <td className="px-4">
                                        <span className="text-muted">{startIndex + index + 1}</span>
                                      </td>
                                      <td>
                                        <code className="text-primary">{data.reference}</code>
                                      </td>
                                      <td>
                                        <div className="fw-semibold">{data.user?.username}</div>
                                      </td>
                                      <td>
                                        <div className="d-flex align-items-center gap-2">
                                          {logoUrl && (
                                            <img
                                              src={logoUrl}
                                              alt={networkName}
                                              height="24"
                                              className="rounded"
                                            />
                                          )}
                                          <span className="fw-semibold">{networkName}</span>
                                        </div>
                                      </td>
                                      <td>
                                        <span className="badge bg-light text-dark border">
                                          {data.data_plan?.name || "—"}
                                        </span>
                                      </td>
                                      <td>
                                        <span className="text-nowrap">{data.phone}</span>
                                      </td>
                                      <td>
                                        <span className="fw-bold">
                                          {new Intl.NumberFormat("en-NG", {
                                            style: "currency",
                                            currency: "NGN",
                                          }).format(data.price)}
                                        </span>
                                      </td>
                                      <td>
                                        <span className={`badge ${getStatusBadgeColor(data.status)} text-white`}>
                                          {data.status === "approved" ? "Approved" : 
                                           data.status === "pending" ? "Pending" : "Rejected"}
                                        </span>
                                      </td>
                                      <td>
                                        <small>{data.created_at?.slice(0, 10)}</small>
                                      </td>
                                    </tr>
                                  );
                                })
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
                          <p className="mt-3 text-muted">Loading data transactions...</p>
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
                          {paginatedData.map((data, index) => {
                            const networkObj = data.network;
                            const networkName = getNetworkName(networkObj);
                            const logoUrl = getNetworkLogo(networkObj);
                            return (
                              <div key={index} className="card border-0 shadow-sm">
                                <div className="card-body">
                                  <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div className="flex-grow-1">
                                      <code className="text-primary small">{data.reference}</code>
                                      <div className="d-flex align-items-center gap-2 mt-2">
                                        {logoUrl && (
                                          <img
                                            src={logoUrl}
                                            alt={networkName}
                                            height="24"
                                            className="rounded"
                                          />
                                        )}
                                        <span className="fw-semibold">{networkName}</span>
                                      </div>
                                    </div>
                                    <span className={`badge ${getStatusBadgeColor(data.status)} text-white`}>
                                      {data.status === "approved" ? "Approved" : 
                                       data.status === "pending" ? "Pending" : "Rejected"}
                                    </span>
                                  </div>

                                  <div className="row g-3 mb-3">
                                    <div className="col-6">
                                      <small className="text-muted d-block">User</small>
                                      <div className="fw-semibold">{data.user?.username}</div>
                                    </div>
                                    <div className="col-6">
                                      <small className="text-muted d-block">Phone</small>
                                      <div className="fw-semibold">{data.phone}</div>
                                    </div>
                                  </div>

                                  <div className="mb-3">
                                    <small className="text-muted d-block">Data Plan</small>
                                    <span className="badge bg-light text-dark border">
                                      {data.data_plan?.name || "—"}
                                    </span>
                                  </div>

                                  <div className="row g-3">
                                    <div className="col-6">
                                      <small className="text-muted d-block">Amount</small>
                                      <div className="fw-bold">
                                        {new Intl.NumberFormat("en-NG", {
                                          style: "currency",
                                          currency: "NGN",
                                        }).format(data.price)}
                                      </div>
                                    </div>
                                    <div className="col-6">
                                      <small className="text-muted d-block">Date</small>
                                      <div>
                                        <i className="bx bx-calendar me-1"></i>
                                        {data.created_at?.slice(0, 10)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
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
                              onClick={() => setPage(page - 1)}
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
                              onClick={() => setPage(page + 1)}
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
              </div>

              <Footer />
              <div className="content-backdrop fade"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}