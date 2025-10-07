import React, { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Topnav from "../components/Topnav";
import axios from "axios";
import { API_BASE, getRequest } from "../services/apiServices";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // Modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [fundData, setFundData] = useState({ amount: "", wallet_type: "" });
  const [kycData, setKycData] = useState({ tier: "", reason: "" });
  const [modalType, setModalType] = useState(""); // "fund", "approve", "reject"

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const fetchUsers = async (pageNum) => {
    setLoading(true);
    try {
      const res = await getRequest(`/users?page=${pageNum}&limit=${pageSize}`, {
        header: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUsers(res.data.users.data);
      setTotalPages(Math.ceil(res.data.users.total / pageSize));
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, status) => {
    try {
      const endpoint =
        status === "active"
          ? `${API_BASE}/api/admin/users/${userId}/block`
          : `${API_BASE}/api/admin/users/${userId}/unblock`;

      await axios.patch(endpoint, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      toast.success("User status updated successfully");
      fetchUsers(page);
    } catch (err) {
      toast.error("Failed to toggle user status");
      console.error("Failed to toggle user status:", err);
    }
  };

  // Open modals
  const openFundModal = (user, type) => {
    setSelectedUser(user);
    setFundData({ amount: "", wallet_type: type });
    setModalType("fund");
  };

  const openApproveModal = (user) => {
    setSelectedUser(user);
    setKycData({ tier: "" });
    setModalType("approve");
  };

  const openRejectModal = (user) => {
    setSelectedUser(user);
    setKycData({ tier: "", reason: "" });
    setModalType("reject");
  };

  // Handle modal actions
  const handleFundWallet = async () => {
    try {
      await axios.post(
        `${API_BASE}/api/admin/fund-wallet/${selectedUser.uuid}`,
        fundData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success("Wallet funded successfully");
      fetchUsers(page);
    } catch (err) {
      toast.error("Error funding wallet");
      console.error("Error funding wallet:", err);
    }
  };

  const handleApproveKyc = async () => {
    try {
      await axios.post(
        `${API_BASE}/api/admin/kycs/${selectedUser.uuid}/approve`,
        { tier: kycData.tier },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success("KYC approved");
      fetchUsers(page);
    } catch (err) {
      toast.error("Failed to approve KYC");
      console.error("Failed to approve KYC:", err);
    }
  };

  const handleRejectKyc = async () => {
    try {
      await axios.post(
        `${API_BASE}/api/admin/kycs/${selectedUser.uuid}/reject`,
        { tier: kycData.tier, reason: kycData.reason },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success("KYC rejected");
      fetchUsers(page);
    } catch (err) {
      toast.error("Failed to reject KYC");
      console.error("Failed to reject KYC:", err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <span className="badge bg-label-success">Active</span>;
      case "ban":
        return <span className="badge bg-label-danger">Banned</span>;
      case "disable":
        return <span className="badge bg-label-warning">Disabled</span>;
      default:
        return <span className="badge bg-label-secondary">{status}</span>;
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
                  <span className="text-muted fw-light">Home /</span> User Management
                </h4>

                <div className="row">
                  <div className="col-lg-12 mb-4 order-0">
                    <div className="card">
                      <div className="d-flex align-items-end row">
                        <div className="table-responsive text-nowrap">
                          {loading ? (
                            <div className="text-center p-4">
                              <div
                                className="spinner-border text-primary"
                                role="status"
                                style={{ width: "3rem", height: "3rem" }}
                              >
                                <span className="visually-hidden">Loading...</span>
                              </div>
                            </div>
                          ) : (
                            <table className="table">
                              <thead>
                                <tr>
                                  <th>#</th>
                                  <th>Name</th>
                                  <th>Email</th>
                                  <th>Phone</th>
                                  <th>Naira</th>
                                  <th>USD</th>
                                  <th>Role</th>
                                  <th>Status</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody className="table-border-bottom-0">
                                {users.map((user, index) => (
                                  <tr key={user.id}>
                                    <td>{(page - 1) * pageSize + index + 1}</td>
                                    <td>
                                      <ul className="list-unstyled users-list m-0 avatar-group d-flex align-items-center">
                                        <li
                                          data-bs-toggle="tooltip"
                                          data-popup="tooltip-custom"
                                          data-bs-placement="top"
                                          className="avatar avatar-xs pull-up"
                                          title="User Avatar"
                                        >
                                          <img
                                            src="../assets/img/avatars/5.png"
                                            alt="Avatar"
                                            className="rounded-circle"
                                          />
                                        </li>
                                        <a className="ms-2">
                                          {user.lastName + " " + user.firstName + " " + user.middleName}
                                        </a>
                                      </ul>
                                    </td>
                                    <td>{user.email}</td>
                                    <td>{user.phone}</td>
                                    <td>₦{user.wallet_naira?.toLocaleString()}</td>
                                    <td>${user.wallet_usd?.toLocaleString()}</td>
                                    <td>
                                      <span className="badge bg-label-primary me-1">
                                        {user.role}
                                      </span>
                                    </td>
                                    <td>{getStatusBadge(user.status)}</td>
                                    <td>
                                      <div className="dropdown">
                                        <button
                                          type="button"
                                          className="btn p-0 dropdown-toggle hide-arrow"
                                          data-bs-toggle="dropdown"
                                        >
                                          <i className="bx bx-dots-vertical-rounded"></i>
                                        </button>
                                        <div className="dropdown-menu">
                                          <a
                                            className="dropdown-item"
                                            href="#"
                                            onClick={() => toggleUserStatus(user.id, user.status)}
                                          >
                                            <i className="bx bx-toggle-left me-1"></i> Toggle Status
                                          </a>
                                          <a
                                            className="dropdown-item"
                                            href={`/admin/users/${user.uuid}`}
                                          >
                                            <i className="bx bx-user me-1"></i> View User & KYC
                                          </a>
                                          <a
                                            className="dropdown-item"
                                            href="#"
                                            onClick={() => openApproveModal(user)}
                                            data-bs-toggle="modal"
                                            data-bs-target="#approveModal"
                                          >
                                            <i className="bx bx-check-circle me-1"></i> Approve KYC
                                          </a>
                                          <a
                                            className="dropdown-item"
                                            href="#"
                                            onClick={() => openRejectModal(user)}
                                            data-bs-toggle="modal"
                                            data-bs-target="#rejectModal"
                                          >
                                            <i className="bx bx-x-circle me-1"></i> Reject KYC
                                          </a>
                                          <a
                                            className="dropdown-item"
                                            href="#"
                                            onClick={() => openFundModal(user, "ngn")}
                                            data-bs-toggle="modal"
                                            data-bs-target="#fundModal"
                                          >
                                            <i className="bx bx-wallet me-1"></i> Fund Wallet (₦)
                                          </a>
                                          <a
                                            className="dropdown-item"
                                            href="#"
                                            onClick={() => openFundModal(user, "usd")}
                                            data-bs-toggle="modal"
                                            data-bs-target="#fundModal"
                                          >
                                            <i className="bx bx-wallet me-1"></i> Fund Wallet ($)
                                          </a>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pagination */}
              <nav className="mt-3">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => setPage(page - 1)}>Previous</button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <li key={i} className={`page-item ${page === i + 1 ? "active" : ""}`}>
                      <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
                    </li>
                  ))}
                  <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => setPage(page + 1)}>Next</button>
                  </li>
                </ul>
              </nav>
              <Footer />
              <div className="content-backdrop fade"></div>
            </div>
          </div>
        </div>
      </div>

      {/* FUND WALLET MODAL */}
      <div className="modal fade" id="fundModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Fund Wallet ({fundData.wallet_type?.toUpperCase()})</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <input
                type="number"
                className="form-control"
                placeholder="Enter amount"
                value={fundData.amount}
                onChange={(e) => setFundData({ ...fundData, amount: e.target.value })}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button
                className="btn btn-primary"
                onClick={handleFundWallet}
                data-bs-dismiss="modal"
              >
                Fund
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* APPROVE KYC MODAL */}
      <div className="modal fade" id="approveModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Approve KYC</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <select
                className="form-control"
                value={kycData.tier}
                onChange={(e) => setKycData({ tier: e.target.value })}
              >
                <option value="">Select Tier</option>
                <option value="2">Tier 2</option>
                <option value="3">Tier 3</option>
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button
                className="btn btn-success"
                onClick={handleApproveKyc}
                data-bs-dismiss="modal"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* REJECT KYC MODAL */}
      <div className="modal fade" id="rejectModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Reject KYC</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <select
                className="form-control mb-3"
                value={kycData.tier}
                onChange={(e) => setKycData({ ...kycData, tier: e.target.value })}
              >
                <option value="">Select Tier</option>
                <option value="2">Tier 2</option>
                <option value="3">Tier 3</option>
              </select>
              <textarea
                className="form-control"
                placeholder="Enter rejection reason"
                value={kycData.reason}
                onChange={(e) => setKycData({ ...kycData, reason: e.target.value })}
              ></textarea>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button
                className="btn btn-danger"
                onClick={handleRejectKyc}
                data-bs-dismiss="modal"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
