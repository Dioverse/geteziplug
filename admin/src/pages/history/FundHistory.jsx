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
  const pageSize = 10;

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Apply filters
  const filteredData = datas.filter((d) => {
    const typeMatch = filterType ? d.type === filterType : true;
    const statusMatch = filterStatus ? d.status === filterStatus : true;
    const searchMatch = searchTerm ? 
      (d.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       d.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       d.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       d.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())) : true;
    return typeMatch && statusMatch && searchMatch;
  });

  // Calculate pagination for filtered data
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPageData = filteredData.slice(startIndex, endIndex);
  
  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
    setPage(1);
  };

  const handleFilterStatusChange = (e) => {
    setFilterStatus(e.target.value);
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setFilterType("");
    setFilterStatus("");
    setSearchTerm("");
    setPage(1);
  };

  const handleView = async (item) => {
    try {
      const res = await getRequest(`/histories/payment/${item.id}`);
      setSelectedItem(res.data?.results?.Data || item);
      setShowViewModal(true);
    } catch (err) {
      console.error("Failed to fetch payment details:", err);
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
      const res = await getRequest(`/histories/payment`);
      setData(res.data?.results?.Data || []);
    } catch (err) {
      console.error("Failed to fetch fund history:", err);
      toast.error("Failed to load fund history");
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadgeColor = (type) => {
    switch(type) {
      case 'deposit':
        return 'bg-success';
      case 'withdrawal':
        return 'bg-danger';
      case 'transfer':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'completed':
        return 'bg-success';
      case 'pending':
        return 'bg-warning';
      case 'processing':
        return 'bg-info';
      case 'failed':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
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
                  <span className="text-muted fw-light">Home / History</span> / Fund History
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
                              placeholder="Search by reference, user, email..."
                              value={searchTerm}
                              onChange={handleSearchChange}
                            />
                          </div>

                          {/* Type Filter */}
                          <div className="col-12 col-md-3">
                            <label className="form-label small fw-semibold text-muted mb-2">
                              <i className="bx bx-filter me-1"></i>Transaction Type
                            </label>
                            <select
                              className="form-select"
                              value={filterType}
                              onChange={handleFilterTypeChange}
                            >
                              <option value="">All Types</option>
                              <option value="deposit">Deposit</option>
                              <option value="withdrawal">Withdrawal</option>
                              <option value="transfer">Transfer</option>
                            </select>
                          </div>

                          {/* Status Filter */}
                          <div className="col-12 col-md-3">
                            <label className="form-label small fw-semibold text-muted mb-2">
                              <i className="bx bx-check-circle me-1"></i>Status
                            </label>
                            <select
                              className="form-select"
                              value={filterStatus}
                              onChange={handleFilterStatusChange}
                            >
                              <option value="">All Status</option>
                              <option value="completed">Completed</option>
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
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
                        {(filterType || filterStatus || searchTerm) && (
                          <div className="mt-3 d-flex flex-wrap gap-2 align-items-center">
                            <span className="text-muted small">Active filters:</span>
                            {filterType && (
                              <span className="badge bg-primary">
                                Type: {filterType}
                                <i 
                                  className="bx bx-x ms-1 cursor-pointer" 
                                  onClick={() => setFilterType("")}
                                  style={{ cursor: 'pointer' }}
                                ></i>
                              </span>
                            )}
                            {filterStatus && (
                              <span className="badge bg-info">
                                Status: {filterStatus}
                                <i 
                                  className="bx bx-x ms-1 cursor-pointer" 
                                  onClick={() => setFilterStatus("")}
                                  style={{ cursor: 'pointer' }}
                                ></i>
                              </span>
                            )}
                            {searchTerm && (
                              <span className="badge bg-success">
                                Search: "{searchTerm}"
                                <i 
                                  className="bx bx-x ms-1 cursor-pointer" 
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
                          Showing {currentPageData.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} results
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
                            <p className="mt-3 text-muted">Loading transactions...</p>
                          </div>
                        ) : (
                          <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                              <tr>
                                <th className="px-4 py-3">#</th>
                                <th className="py-3">Reference</th>
                                <th className="py-3">User</th>
                                <th className="py-3">Type</th>
                                <th className="py-3">Method</th>
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
                                    {(filterType || filterStatus || searchTerm) && (
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
                                      <div>
                                        <div className="fw-semibold">
                                          {data.user?.username || data.user?.name || "Unknown User"}
                                        </div>
                                        <small className="text-muted">{data.user?.email || ""}</small>
                                      </div>
                                    </td>
                                    <td>
                                      <span className={`badge ${getTypeBadgeColor(data.type)} text-white`}>
                                        {data.type}
                                      </span>
                                    </td>
                                    <td>
                                      <span className="text-capitalize">
                                        {data.method ? data.method.replace('_', ' ') : '-'}
                                      </span>
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
                            style={{ width: "3rem", height: "3rem" }}>
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mt-3 text-muted">Loading transactions...</p>
                        </div>
                      ) : currentPageData.length === 0 ? (
                        <div className="card border-0 shadow-sm">
                          <div className="card-body text-center py-5">
                            <i className="bx bx-search-alt-2 display-4 text-muted"></i>
                            <p className="text-muted mt-3">No transactions found</p>
                            {(filterType || filterStatus || searchTerm) && (
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
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                  <div>
                                    <code className="text-primary small">{data.reference}</code>
                                    <div className="mt-1">
                                      <span className={`badge ${getTypeBadgeColor(data.type)} text-white me-2`}>
                                        {data.type}
                                      </span>
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
                                
                                <div className="mb-2">
                                  <small className="text-muted d-block">User</small>
                                  <div className="fw-semibold">
                                    {data.user?.username || data.user?.name || "Unknown User"}
                                  </div>
                                  <small className="text-muted">{data.user?.email || ""}</small>
                                </div>

                                <div className="d-flex justify-content-between align-items-center mt-3">
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
                    {!loading && filteredData.length > 0 && totalPages > 1 && (
                      <nav className="mt-4">
                        <ul className="pagination justify-content-center flex-wrap">
                          <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                            <button
                              className="page-link"
                              onClick={() => setPage(page - 1)}
                              disabled={page === 1}>
                              <i className="bx bx-chevron-left"></i>
                              <span className="d-none d-sm-inline ms-1">Previous</span>
                            </button>
                          </li>
                          
                          {/* Smart pagination - show first, last, and pages around current */}
                          {totalPages <= 7 ? (
                            Array.from({ length: totalPages }, (_, i) => (
                              <li
                                key={i}
                                className={`page-item ${page === i + 1 ? "active" : ""}`}>
                                <button
                                  className="page-link"
                                  onClick={() => setPage(i + 1)}>
                                  {i + 1}
                                </button>
                              </li>
                            ))
                          ) : (
                            <>
                              {page > 3 && (
                                <>
                                  <li className="page-item">
                                    <button className="page-link" onClick={() => setPage(1)}>1</button>
                                  </li>
                                  {page > 4 && <li className="page-item disabled"><span className="page-link">...</span></li>}
                                </>
                              )}
                              
                              {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p >= page - 2 && p <= page + 2)
                                .map(p => (
                                  <li key={p} className={`page-item ${page === p ? "active" : ""}`}>
                                    <button className="page-link" onClick={() => setPage(p)}>{p}</button>
                                  </li>
                                ))}
                              
                              {page < totalPages - 2 && (
                                <>
                                  {page < totalPages - 3 && <li className="page-item disabled"><span className="page-link">...</span></li>}
                                  <li className="page-item">
                                    <button className="page-link" onClick={() => setPage(totalPages)}>{totalPages}</button>
                                  </li>
                                </>
                              )}
                            </>
                          )}
                          
                          <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                            <button
                              className="page-link"
                              onClick={() => setPage(page + 1)}
                              disabled={page === totalPages}>
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

        {/* Enhanced Modal */}
        {showViewModal && (
          <>
            <div className="modal-backdrop fade show"></div>
            <div className="modal fade show d-block" tabIndex="-1">
              <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content border-0 shadow">
                  <div className="modal-header bg-light">
                    <h5 className="modal-title fw-bold">
                      <i className="bx bx-receipt me-2"></i>Transaction Details
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowViewModal(false)}></button>
                  </div>
                  <div className="modal-body p-0">
                    {selectedItem ? (
                      <div className="list-group list-group-flush">
                        <div className="list-group-item">
                          <small className="text-muted d-block mb-1">Reference</small>
                          <code className="text-primary">{selectedItem.reference}</code>
                        </div>
                        
                        <div className="list-group-item">
                          <small className="text-muted d-block mb-1">User</small>
                          <div className="fw-semibold">{selectedItem.user?.username || selectedItem.user?.name}</div>
                          <small className="text-muted">{selectedItem.user?.email}</small>
                        </div>
                        
                        <div className="list-group-item">
                          <div className="row">
                            <div className="col-6">
                              <small className="text-muted d-block mb-1">Type</small>
                              <span className={`badge ${getTypeBadgeColor(selectedItem.type)} text-white`}>
                                {selectedItem.type}
                              </span>
                            </div>
                            <div className="col-6">
                              <small className="text-muted d-block mb-1">Status</small>
                              <span className={`badge ${getStatusBadgeColor(selectedItem.status)} text-white`}>
                                {selectedItem.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="list-group-item">
                          <small className="text-muted d-block mb-1">Method</small>
                          <div className="text-capitalize">{selectedItem.method ? selectedItem.method.replace('_', ' ') : 'N/A'}</div>
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
                        
                        {(selectedItem.balance_before || selectedItem.balance_after) && (
                          <div className="list-group-item">
                            <div className="row">
                              {selectedItem.balance_before && (
                                <div className="col-6">
                                  <small className="text-muted d-block mb-1">Balance Before</small>
                                  <div className="fw-semibold">
                                    {new Intl.NumberFormat("en-NG", {
                                      style: "currency",
                                      currency: "NGN",
                                      minimumFractionDigits: 0,
                                    }).format(selectedItem.balance_before)}
                                  </div>
                                </div>
                              )}
                              {selectedItem.balance_after && (
                                <div className="col-6">
                                  <small className="text-muted d-block mb-1">Balance After</small>
                                  <div className="fw-semibold">
                                    {new Intl.NumberFormat("en-NG", {
                                      style: "currency",
                                      currency: "NGN",
                                      minimumFractionDigits: 0,
                                    }).format(selectedItem.balance_after)}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {selectedItem.bank_name && (
                          <div className="list-group-item">
                            <small className="text-muted d-block mb-1">Bank Details</small>
                            <div className="fw-semibold">{selectedItem.bank_name}</div>
                            <small className="text-muted">{selectedItem.account_number || 'N/A'}</small>
                          </div>
                        )}
                        
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
                        
                        {selectedItem.description && (
                          <div className="list-group-item">
                            <small className="text-muted d-block mb-1">Description</small>
                            <div className="text-muted">{selectedItem.description}</div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-muted">No details available</div>
                    )}
                  </div>
                  <div className="modal-footer bg-light">
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
          </>
        )}
        
        <ToastContainer position="top-center" autoClose={3000} />
      </div>
    </>
  );
}