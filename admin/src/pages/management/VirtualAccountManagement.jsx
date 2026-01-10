import React, { useEffect, useState } from "react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import Topnav from "../../components/Topnav";
import { getRequest, postRequest } from "../../services/apiServices";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function VirtualAccountManagement() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const [showViewModal, setShowViewModal] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBank, setFilterBank] = useState("");

  // Get unique banks for filter
  const uniqueBanks = [...new Set(
    accounts
      .map((a) => a.bank_name || a.bank)
      .filter((bank) => bank && bank.trim() !== "")
  )].sort();

  const filteredData = accounts.filter((a) => {
    const statusMatch = filterStatus ? a.status === filterStatus : true;
    const bankMatch = filterBank ? (a.bank_name || a.bank) === filterBank : true;
    const searchMatch = searchTerm
      ? a.account_number?.includes(searchTerm) ||
        a.account_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return statusMatch && searchMatch && bankMatch;
  });

  const totalFilteredPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const currentPageData = filteredData.slice(startIndex, startIndex + pageSize);

  const clearFilters = () => {
    setFilterStatus("");
    setSearchTerm("");
    setFilterBank("");
    setPage(1);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getRequest("/virtual-accounts/accounts");
      console.log("Virtual accounts response:", res.data);

      const dataArray = res.data?.results?.Data || res.data?.data || [];
      setAccounts(dataArray);
      setTotalPages(Math.ceil(dataArray.length / pageSize));
    } catch (err) {
      console.error("Failed to fetch virtual accounts:", err);
      toast.error("Failed to load virtual accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const handleViewTransactions = async (item) => {
    setSelectedItem(item);
    setShowTransactionsModal(true);
    setLoadingTransactions(true);

    try {
      const res = await getRequest(`/admin/virtual-accounts/${item.id}/transactions`);
      setTransactions(res.data?.results?.Data || []);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      toast.error("Failed to load transactions");
      setTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleToggleStatus = (item) => {
    const newStatus = item.status === "active" ? "inactive" : "active";

    toast.info(
      ({ closeToast }) => (
        <div>
          <p className="mb-3">
            Are you sure you want to {newStatus === "active" ? "activate" : "deactivate"}{" "}
            <strong>{item.account_number}</strong>?
          </p>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-primary"
              onClick={async () => {
                try {
                  await postRequest(`/admin/virtual-accounts/${item.id}/toggle`, {
                    status: newStatus,
                  });
                  toast.success(
                    `Account ${newStatus === "active" ? "activated" : "deactivated"} successfully`
                  );
                  fetchData();
                  closeToast();
                } catch (err) {
                  console.error(err);
                  toast.error("Failed to update status");
                }
              }}
            >
              Yes, {newStatus === "active" ? "Activate" : "Deactivate"}
            </button>
            <button className="btn btn-sm btn-secondary" onClick={closeToast}>
              Cancel
            </button>
          </div>
        </div>
      ),
      { autoClose: false }
    );
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-success";
      case "inactive":
        return "bg-secondary";
      case "suspended":
        return "bg-danger";
      default:
        return "bg-warning";
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

    for (let i = Math.max(1, page - 2); i <= Math.min(totalFilteredPages, page + 2); i++) {
      buttons.push(
        <li key={i} className={`page-item ${page === i ? "active" : ""}`}>
          <button className="page-link" onClick={() => setPage(i)}>
            {i}
          </button>
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

  // Calculate summary statistics
  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const activeAccounts = accounts.filter((a) => a.status === "active").length;
  const inactiveAccounts = accounts.filter((a) => a.status === "inactive").length;

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
                  <span className="text-muted fw-light">Home / Management</span> / Virtual Accounts
                </h4>

                {/* Statistics Cards */}
                <div className="row mb-4">
                  <div className="col-lg-3 col-md-6 mb-4">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div className="flex-shrink-0">
                            <div
                              className="bg-label-primary rounded p-3"
                              style={{ width: "56px", height: "56px" }}
                            >
                              <i className="bx bx-wallet fs-3 text-primary"></i>
                            </div>
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <p className="text-muted mb-1 small">Total Accounts</p>
                            <h4 className="mb-0 fw-bold">{accounts.length}</h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-3 col-md-6 mb-4">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div className="flex-shrink-0">
                            <div
                              className="bg-label-success rounded p-3"
                              style={{ width: "56px", height: "56px" }}
                            >
                              <i className="bx bx-check-circle fs-3 text-success"></i>
                            </div>
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <p className="text-muted mb-1 small">Active</p>
                            <h4 className="mb-0 fw-bold text-success">{activeAccounts}</h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-3 col-md-6 mb-4">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div className="flex-shrink-0">
                            <div
                              className="bg-label-secondary rounded p-3"
                              style={{ width: "56px", height: "56px" }}
                            >
                              <i className="bx bx-x-circle fs-3 text-secondary"></i>
                            </div>
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <p className="text-muted mb-1 small">Inactive</p>
                            <h4 className="mb-0 fw-bold text-secondary">{inactiveAccounts}</h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-3 col-md-6 mb-4">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div className="flex-shrink-0">
                            <div
                              className="bg-label-info rounded p-3"
                              style={{ width: "56px", height: "56px" }}
                            >
                              <i className="bx bx-money fs-3 text-info"></i>
                            </div>
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <p className="text-muted mb-1 small">Total Balance</p>
                            <h4 className="mb-0 fw-bold text-info">
                              {new Intl.NumberFormat("en-NG", {
                                style: "currency",
                                currency: "NGN",
                                notation: "compact",
                              }).format(totalBalance)}
                            </h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-lg-12 mb-4 order-0">
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
                              placeholder="Account number, name, email..."
                              value={searchTerm}
                              onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1);
                              }}
                            />
                          </div>

                          {/* Status Filter */}
                          <div className="col-12 col-md-3">
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
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                              <option value="suspended">Suspended</option>
                            </select>
                          </div>

                          {/* Bank Filter */}
                          <div className="col-12 col-md-3">
                            <label className="form-label small fw-semibold text-muted mb-2">
                              <i className="bx bx-building me-1"></i>Bank
                            </label>
                            <select
                              className="form-select"
                              value={filterBank}
                              onChange={(e) => {
                                setFilterBank(e.target.value);
                                setPage(1);
                              }}
                            >
                              <option value="">All Banks</option>
                              {uniqueBanks.map((bank, idx) => (
                                <option key={idx} value={bank}>
                                  {bank}
                                </option>
                              ))}
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
                        {(filterStatus || searchTerm || filterBank) && (
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
                            {filterBank && (
                              <span className="badge bg-primary">
                                Bank: {filterBank}
                                <i
                                  className="bx bx-x ms-1"
                                  onClick={() => setFilterBank("")}
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
                          {Math.min(startIndex + pageSize, filteredData.length)} of {filteredData.length}{" "}
                          results
                        </span>
                        {filteredData.length !== accounts.length && (
                          <span className="text-muted small">
                            (Filtered from {accounts.length} total accounts)
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
                            <p className="mt-3 text-muted">Loading virtual accounts...</p>
                          </div>
                        ) : (
                          <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                              <tr>
                                <th className="px-4 py-3">#</th>
                                <th className="py-3">User</th>
                                <th className="py-3">Bank</th>
                                <th className="py-3">Account Number</th>
                                <th className="py-3">Account Name</th>
                                <th className="py-3">Balance</th>
                                <th className="py-3">Status</th>
                                <th className="py-3">Created</th>
                                <th className="py-3">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {currentPageData.length === 0 ? (
                                <tr>
                                  <td colSpan="9" className="text-center py-5">
                                    <i className="bx bx-search-alt-2 display-4 text-muted"></i>
                                    <p className="text-muted mt-3">No virtual accounts found</p>
                                    {(filterStatus || searchTerm || filterBank) && (
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
                                      {data.user ? (
                                        <div>
                                          <div className="fw-semibold">
                                            {data.user?.firstName && data.user?.lastName
                                              ? `${data.user.firstName} ${data.user.lastName}`
                                              : data.user?.username || "Unknown"}
                                          </div>
                                          <small className="text-muted">{data.user?.email || ""}</small>
                                        </div>
                                      ) : (
                                        <span className="text-muted">Not available</span>
                                      )}
                                    </td>
                                    <td>
                                      <div className="d-flex align-items-center">
                                        <i className="bx bx-building me-2 text-primary"></i>
                                        <strong>{data.bank_name || data.bank || "N/A"}</strong>
                                      </div>
                                    </td>
                                    <td>
                                      <code className="text-primary">{data.account_number}</code>
                                    </td>
                                    <td>
                                      <span className="fw-semibold">{data.account_name}</span>
                                    </td>
                                    <td>
                                      <span className="fw-bold text-success">
                                        {data.balance !== undefined
                                          ? new Intl.NumberFormat("en-NG", {
                                              style: "currency",
                                              currency: "NGN",
                                            }).format(data.balance)
                                          : "N/A"}
                                      </span>
                                    </td>
                                    <td>
                                      <span
                                        className={`badge ${getStatusBadgeColor(
                                          data.status
                                        )} text-white`}
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
                                      <div className="dropdown">
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-outline-primary dropdown-toggle"
                                          data-bs-toggle="dropdown"
                                        >
                                          <i className="bx bx-dots-horizontal-rounded"></i>
                                        </button>
                                        <div className="dropdown-menu">
                                          <button
                                            className="dropdown-item"
                                            onClick={() => handleView(data)}
                                          >
                                            <i className="bx bx-show me-2"></i>View Details
                                          </button>
                                          <button
                                            className="dropdown-item"
                                            onClick={() => handleViewTransactions(data)}
                                          >
                                            <i className="bx bx-list-ul me-2"></i>View Transactions
                                          </button>
                                          <button
                                            className="dropdown-item"
                                            onClick={() => handleToggleStatus(data)}
                                          >
                                            <i className="bx bx-toggle-left me-2"></i>
                                            {data.status === "active" ? "Deactivate" : "Activate"}
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
                          <p className="mt-3 text-muted">Loading virtual accounts...</p>
                        </div>
                      ) : currentPageData.length === 0 ? (
                        <div className="card border-0 shadow-sm">
                          <div className="card-body text-center py-5">
                            <i className="bx bx-search-alt-2 display-4 text-muted"></i>
                            <p className="text-muted mt-3">No virtual accounts found</p>
                            {(filterStatus || searchTerm || filterBank) && (
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
                                    <code className="text-primary small">{data.account_number}</code>
                                    <div className="mt-2">
                                      <span
                                        className={`badge ${getStatusBadgeColor(
                                          data.status
                                        )} text-white`}
                                      >
                                        {data.status}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-end">
                                    <div className="fw-bold fs-6 text-success">
                                      {data.balance !== undefined
                                        ? new Intl.NumberFormat("en-NG", {
                                            style: "currency",
                                            currency: "NGN",
                                          }).format(data.balance)
                                        : "N/A"}
                                    </div>
                                  </div>
                                </div>

                                <div className="mb-3">
                                  <small className="text-muted d-block mb-1">Account Name</small>
                                  <div className="fw-semibold">{data.account_name}</div>
                                </div>

                                <div className="mb-3">
                                  <div className="row g-2">
                                    <div className="col-6">
                                      <small className="text-muted d-block">User</small>
                                      {data.user ? (
                                        <div>
                                          <div className="fw-semibold small">
                                            {data.user?.firstName && data.user?.lastName
                                              ? `${data.user.firstName} ${data.user.lastName}`
                                              : data.user?.username || "Unknown"}
                                          </div>
                                          <small className="text-muted">{data.user?.email || ""}</small>
                                        </div>
                                      ) : (
                                        <span className="text-muted small">Not available</span>
                                      )}
                                    </div>
                                    <div className="col-6">
                                      <small className="text-muted d-block">Bank</small>
                                      <div className="small fw-semibold">
                                        <i className="bx bx-building me-1"></i>
                                        {data.bank_name || data.bank || "N/A"}
                                      </div>
                                    </div>
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

      {/* Enhanced View Modal */}
      {showViewModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content border-0 shadow">
                <div className="modal-header bg-light">
                  <h5 className="modal-title fw-bold">
                    <i className="bx bx-wallet me-2"></i>Virtual Account Details
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
                        <small className="text-muted d-block mb-1">User</small>
                        <div className="fw-semibold">
                          {selectedItem.user?.firstName && selectedItem.user?.lastName
                            ? `${selectedItem.user.firstName} ${selectedItem.user.lastName}`
                            : selectedItem.user?.username || "Unknown"}
                        </div>
                        <small className="text-muted">{selectedItem.user?.email}</small>
                      </div>

                      <div className="list-group-item">
                        <small className="text-muted d-block mb-1">Bank</small>
                        <div className="d-flex align-items-center">
                          <i className="bx bx-building me-2 text-primary"></i>
                          <strong>{selectedItem.bank_name || selectedItem.bank}</strong>
                        </div>
                      </div>

                      <div className="list-group-item">
                        <small className="text-muted d-block mb-1">Account Number</small>
                        <code className="text-primary fs-6">{selectedItem.account_number}</code>
                      </div>

                      <div className="list-group-item">
                        <small className="text-muted d-block mb-1">Account Name</small>
                        <div className="fw-semibold">{selectedItem.account_name}</div>
                      </div>

                      <div className="list-group-item bg-light">
                        <small className="text-muted d-block mb-1">Balance</small>
                        <div className="text-success fw-bold fs-4">
                          {selectedItem.balance !== undefined
                            ? new Intl.NumberFormat("en-NG", {
                                style: "currency",
                                currency: "NGN",
                                minimumFractionDigits: 0,
                              }).format(selectedItem.balance)
                            : "N/A"}
                        </div>
                      </div>

                      <div className="list-group-item">
                        <small className="text-muted d-block mb-1">Status</small>
                        <span className={`badge ${getStatusBadgeColor(selectedItem.status)} text-white`}>
                          {selectedItem.status}
                        </span>
                      </div>

                      {selectedItem.provider && (
                        <div className="list-group-item">
                          <small className="text-muted d-block mb-1">Provider</small>
                          <div>{selectedItem.provider}</div>
                        </div>
                      )}

                      <div className="list-group-item">
                        <small className="text-muted d-block mb-1">Created Date</small>
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

                      {selectedItem.updated_at && (
                        <div className="list-group-item">
                          <small className="text-muted d-block mb-1">Last Updated</small>
                          <div>
                            {new Date(selectedItem.updated_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
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
                    className="btn btn-outline-primary"
                    onClick={() => {
                      setShowViewModal(false);
                      handleViewTransactions(selectedItem);
                    }}
                  >
                    <i className="bx bx-list-ul me-1"></i>View Transactions
                  </button>
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

      {/* Enhanced Transactions Modal */}
      {showTransactionsModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content border-0 shadow">
                <div className="modal-header bg-light">
                  <h5 className="modal-title fw-bold">
                    <i className="bx bx-list-ul me-2"></i>Transaction History
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowTransactionsModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  {selectedItem && (
                    <div className="alert alert-info mb-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>Account:</strong> {selectedItem.account_number}
                        </div>
                        <div>
                          <strong>Bank:</strong> {selectedItem.bank_name || selectedItem.bank}
                        </div>
                      </div>
                    </div>
                  )}

                  {loadingTransactions ? (
                    <div className="text-center p-5">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                        style={{ width: "3rem", height: "3rem" }}
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-3 text-muted">Loading transactions...</p>
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bx bx-receipt display-4 text-muted"></i>
                      <p className="text-muted mt-3">No transactions found for this account</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>#</th>
                            <th>Date</th>
                            <th>Reference</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.map((trans, idx) => (
                            <tr key={idx}>
                              <td>{idx + 1}</td>
                              <td>
                                <small>
                                  {new Date(trans.created_at).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </small>
                              </td>
                              <td>
                                <code className="small">{trans.reference}</code>
                              </td>
                              <td>
                                <span
                                  className={`badge ${
                                    trans.type === "credit"
                                      ? "bg-label-success"
                                      : "bg-label-danger"
                                  }`}
                                >
                                  {trans.type === "credit" ? (
                                    <>
                                      <i className="bx bx-down-arrow-alt"></i> Credit
                                    </>
                                  ) : (
                                    <>
                                      <i className="bx bx-up-arrow-alt"></i> Debit
                                    </>
                                  )}
                                </span>
                              </td>
                              <td>
                                <span
                                  className={`fw-bold ${
                                    trans.type === "credit" ? "text-success" : "text-danger"
                                  }`}
                                >
                                  {trans.type === "credit" ? "+" : "-"}
                                  {new Intl.NumberFormat("en-NG", {
                                    style: "currency",
                                    currency: "NGN",
                                  }).format(trans.amount)}
                                </span>
                              </td>
                              <td>
                                <span
                                  className={`badge ${
                                    trans.status === "successful"
                                      ? "bg-success"
                                      : trans.status === "pending"
                                      ? "bg-warning"
                                      : "bg-danger"
                                  } text-white`}
                                >
                                  {trans.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowTransactionsModal(false)}
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