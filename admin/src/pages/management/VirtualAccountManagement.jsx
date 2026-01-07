import React, { useEffect, useState } from "react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import Topnav from "../../components/Topnav";
import {
  getRequest,
  postRequest,
} from "../../services/apiServices";
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
  const [searchQuery, setSearchQuery] = useState("");

  // Apply filters
  const filteredData = accounts.filter((a) => {
    const statusMatch = filterStatus ? a.status === filterStatus : true;
    const searchMatch = searchQuery
      ? a.account_number?.includes(searchQuery) ||
        a.account_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.user?.username?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return statusMatch && searchMatch;
  });

  const currentPageData = filteredData;

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const fetchData = async (pageNum) => {
    setLoading(true);
    try {
      const res = await getRequest(
        `/admin/virtual-accounts?page=${pageNum}&limit=${pageSize}`
      );
      const dataArray = res.data?.results?.Data?.data || res.data?.results?.Data || [];
      const lastPage = res.data?.results?.Data?.last_page || res.data?.results?.last_page || 1;
      
      setAccounts(dataArray);
      setTotalPages(lastPage);
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

  const handleToggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    
    toast.info(
      ({ closeToast }) => (
        <div>
          <p>Are you sure you want to {newStatus === "active" ? "activate" : "deactivate"} this account?</p>
          <button
            className="btn btn-sm btn-primary me-2"
            onClick={async () => {
              try {
                await postRequest(`/admin/virtual-accounts/${id}/toggle`, {
                  status: newStatus
                });
                toast.success(`Account ${newStatus === "active" ? "activated" : "deactivated"}`);
                fetchData(page);
                closeToast();
              } catch (err) {
                console.error(err);
                toast.error("Failed to update status");
              }
            }}>
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
                  <span className="text-muted fw-light">Home / Management</span> /
                  Virtual Accounts
                </h4>

                <div className="row">
                  <div className="col-lg-12 mb-4 order-0">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Filter & Search</h5>

                        <div className="card-header-actions d-flex gap-2">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Search by account number, name, email..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            style={{ width: '300px' }}
                          />
                          <select
                            className="form-select"
                            value={filterStatus}
                            onChange={handleFilterChange}
                            style={{ width: '180px' }}
                          >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
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
                                  <th>User</th>
                                  <th>Bank</th>
                                  <th>Account Number</th>
                                  <th>Account Name</th>
                                  <th>Balance</th>
                                  <th>Status</th>
                                  <th>Created Date</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {currentPageData.length === 0 ? (
                                  <tr>
                                    <td
                                      colSpan="9"
                                      className="text-center py-4">
                                      No virtual accounts found
                                    </td>
                                  </tr>
                                ) : (
                                  currentPageData.map((data, index) => (
                                    <tr key={data.id || index}>
                                      <td>
                                        {(page - 1) * pageSize + index + 1}
                                      </td>
                                      <td>
                                        <a
                                          href={`mailto:${
                                            data.user?.email || ""
                                          }`}>
                                          {data.user?.firstName && data.user?.lastName
                                            ? `${data.user.firstName} ${data.user.lastName}`
                                            : data.user?.username ||
                                              "Unknown User"}
                                        </a>
                                        <br />
                                        <small className="text-muted">
                                          {data.user?.email || ""}
                                        </small>
                                      </td>
                                      <td>
                                        <strong>{data.bank_name || data.bank}</strong>
                                      </td>
                                      <td>
                                        <span className="badge bg-label-primary">
                                          {data.account_number}
                                        </span>
                                      </td>
                                      <td>{data.account_name}</td>
                                      <td>
                                        {data.balance !== undefined
                                          ? new Intl.NumberFormat("en-NG", {
                                              style: "currency",
                                              currency: "NGN",
                                            }).format(data.balance)
                                          : "N/A"}
                                      </td>
                                      <td>
                                        <span
                                          className={`badge ${
                                            data.status === "active"
                                              ? "bg-label-success"
                                              : data.status === "suspended"
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
                                          month: "short",
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
                                              onClick={() => handleView(data)}>
                                              <i className="bx bx-show me-1"></i>{" "}
                                              View Details
                                            </button>
                                            <button
                                              className="dropdown-item"
                                              onClick={() =>
                                                handleViewTransactions(data)
                                              }>
                                              <i className="bx bx-list-ul me-1"></i>{" "}
                                              View Transactions
                                            </button>
                                            <button
                                              className="dropdown-item"
                                              onClick={() =>
                                                handleToggleStatus(data.id, data.status)
                                              }>
                                              <i className="bx bx-toggle-left me-1"></i>{" "}
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
                <h5 className="modal-title">Virtual Account Details</h5>
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
                        <strong>User:</strong>{" "}
                        {selectedItem.user?.firstName && selectedItem.user?.lastName
                          ? `${selectedItem.user.firstName} ${selectedItem.user.lastName}`
                          : selectedItem.user?.username || "Unknown"}
                        <br />
                        <small className="text-muted">{selectedItem.user?.email}</small>
                      </li>
                      <li className="list-group-item">
                        <strong>Bank:</strong> {selectedItem.bank_name || selectedItem.bank}
                      </li>
                      <li className="list-group-item">
                        <strong>Account Number:</strong>{" "}
                        <span className="badge bg-label-primary fs-6">
                          {selectedItem.account_number}
                        </span>
                      </li>
                      <li className="list-group-item">
                        <strong>Account Name:</strong> {selectedItem.account_name}
                      </li>
                      {selectedItem.balance !== undefined && (
                        <li className="list-group-item">
                          <strong>Balance:</strong>{" "}
                          <span className="text-success fw-bold fs-5">
                            {new Intl.NumberFormat("en-NG", {
                              style: "currency",
                              currency: "NGN",
                            }).format(selectedItem.balance)}
                          </span>
                        </li>
                      )}
                      <li className="list-group-item">
                        <strong>Status:</strong>{" "}
                        <span
                          className={`badge ${
                            selectedItem.status === "active"
                              ? "bg-label-success"
                              : selectedItem.status === "suspended"
                              ? "bg-label-danger"
                              : "bg-label-secondary"
                          }`}>
                          {selectedItem.status}
                        </span>
                      </li>
                      <li className="list-group-item">
                        <strong>Created:</strong>{" "}
                        {new Date(selectedItem.created_at).toLocaleString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </li>
                      {selectedItem.provider && (
                        <li className="list-group-item">
                          <strong>Provider:</strong> {selectedItem.provider}
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

        {/* Transactions Modal */}
        <div
          key={`trans-${selectedItem?.id}`}
          className={`modal fade ${showTransactionsModal ? "show d-block" : ""}`}
          tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Transactions - {selectedItem?.account_number}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowTransactionsModal(false)}></button>
              </div>
              <div className="modal-body">
                {loadingTransactions ? (
                  <div className="text-center p-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : transactions.length === 0 ? (
                  <p className="text-center text-muted">No transactions found</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Type</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Reference</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((trans, idx) => (
                          <tr key={idx}>
                            <td>
                              <small>
                                {new Date(trans.created_at).toLocaleDateString()}
                              </small>
                            </td>
                            <td>
                              <span className={`badge ${
                                trans.type === "credit" ? "bg-label-success" : "bg-label-danger"
                              }`}>
                                {trans.type}
                              </span>
                            </td>
                            <td>
                              {new Intl.NumberFormat("en-NG", {
                                style: "currency",
                                currency: "NGN",
                              }).format(trans.amount)}
                            </td>
                            <td>
                              <span className={`badge ${
                                trans.status === "successful" ? "bg-label-success" : "bg-label-warning"
                              }`}>
                                {trans.status}
                              </span>
                            </td>
                            <td>
                              <small>{trans.reference}</small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowTransactionsModal(false)}>
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