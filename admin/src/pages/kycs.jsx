import React, { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Topnav from "../components/Topnav";
import axios from "axios";
import { API_BASE, getRequest } from "../services/apiServices";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Kycs() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedUser, setSelectedUser] = useState(null);
  const [kycData, setKycData] = useState({ tier: "", reason: "" });

  const pageSize = 20;

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const fetchUsers = async (pageNum) => {
    setLoading(true);
    try {
      const res = await getRequest(`/users?page=${pageNum}`, {
        header: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setUsers(res.data.users.data);
      setTotalPages(res.data.users.last_page);
    } catch (err) {
      toast.error("Failed to fetch users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* =======================
      KYC ACTIONS
  ======================== */

  const openApproveModal = (user) => {
    setSelectedUser(user);
    setKycData({ tier: "" });
  };

  const openRejectModal = (user) => {
    setSelectedUser(user);
    setKycData({ tier: "", reason: "" });
  };

  const approveKyc = async () => {
    try {
      await axios.post(
        `${API_BASE}/api/admin/kycs/${selectedUser.uuid}/approve`,
        { tier: kycData.tier },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success("KYC approved successfully");
      fetchUsers(page);
    } catch (err) {
      toast.error("Failed to approve KYC");
    }
  };

  const rejectKyc = async () => {
    try {
      await axios.post(
        `${API_BASE}/api/admin/kycs/${selectedUser.uuid}/reject`,
        kycData,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success("KYC rejected");
      fetchUsers(page);
    } catch (err) {
      toast.error("Failed to reject KYC");
    }
  };

  /* =======================
      HELPERS
  ======================== */

  const kycStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return <span className="badge bg-label-success">Approved</span>;
      case "Rejected":
        return <span className="badge bg-label-danger">Rejected</span>;
      case "Submitted":
        return <span className="badge bg-label-warning">Submitted</span>;
      default:
        return <span className="badge bg-label-secondary">Not Submitted</span>;
    }
  };

  const tierBadge = (tier) => (
    <span className="badge bg-label-info">{tier || "Tier 1 (Basic)"}</span>
  );

  const statusBadge = (status) =>
    status === "active" ? (
      <span className="badge bg-label-success">Active</span>
    ) : (
      <span className="badge bg-label-danger">Blocked</span>
    );

  return (
    <>
      <ToastContainer />
      <div className="layout-wrapper layout-content-navbar">
        <div className="layout-container">
          <Navbar />
          <div className="layout-page">
            <Topnav />

            <div className="content-wrapper">
              <div className="container-xxl container-p-y">
                <h4 className="fw-bold mb-4">
                  <span className="text-muted fw-light">Admin /</span> KYC Users
                </h4>

                <div className="card">
                  <div className="table-responsive text-nowrap">
                    {loading ? (
                      <div className="text-center p-5">
                        <div className="spinner-border text-primary" />
                      </div>
                    ) : (
                      <table className="table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>User</th>
                            <th>Contact</th>
                            <th>KYC Status</th>
                            <th>KYC Tier</th>
                            <th>Account</th>
                            <th>Joined</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((u, i) => (
                            <tr key={u.id}>
                              <td>{(page - 1) * pageSize + i + 1}</td>

                              <td>
                                <strong>
                                  {u.lastName} {u.firstName}
                                </strong>
                                <br />
                                {/* <small className="text-muted">{u.uuid}</small> */}
                              </td>

                              <td>
                                {u.email}
                                <br />
                                <small>{u.phone}</small>
                              </td>

                              <td>{kycStatusBadge(u.kyc_status_label)}</td>

                              <td>{tierBadge(u.kyc_tier_label)}</td>

                              <td>{statusBadge(u.status)}</td>

                              <td>
                                {new Date(u.created_at).toLocaleDateString()}
                              </td>

                              <td>
                                <div className="dropdown">
                                  <button
                                    className="btn p-0 dropdown-toggle hide-arrow"
                                    data-bs-toggle="dropdown"
                                  >
                                    <i className="bx bx-dots-vertical-rounded" />
                                  </button>
                                  <div className="dropdown-menu">
                                    <a
                                      className="dropdown-item"
                                      href={`/admin/users/${u.uuid}`}
                                    >
                                      <i className="bx bx-user me-1" />
                                      View KYC
                                    </a>

                                    {u.kyc_status_label !== "Approved" && (
                                      <>
                                        <a
                                          className="dropdown-item"
                                          data-bs-toggle="modal"
                                          data-bs-target="#approveModal"
                                          onClick={() => openApproveModal(u)}
                                        >
                                          <i className="bx bx-check-circle me-1" />
                                          Approve KYC
                                        </a>

                                        <a
                                          className="dropdown-item"
                                          data-bs-toggle="modal"
                                          data-bs-target="#rejectModal"
                                          onClick={() => openRejectModal(u)}
                                        >
                                          <i className="bx bx-x-circle me-1" />
                                          Reject KYC
                                        </a>
                                      </>
                                    )}
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

                {/* Pagination */}
                <nav className="mt-4">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${page === 1 && "disabled"}`}>
                      <button
                        className="page-link"
                        onClick={() => setPage(page - 1)}
                      >
                        Prev
                      </button>
                    </li>

                    {Array.from({ length: totalPages }).map((_, i) => (
                      <li
                        key={i}
                        className={`page-item ${
                          page === i + 1 ? "active" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}

                    <li
                      className={`page-item ${
                        page === totalPages && "disabled"
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setPage(page + 1)}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>

              <Footer />
            </div>
          </div>
        </div>
      </div>

      {/* APPROVE MODAL */}
      <div className="modal fade" id="approveModal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5>Approve KYC</h5>
              <button className="btn-close" data-bs-dismiss="modal" />
            </div>
            <div className="modal-body">
              <select
                className="form-control"
                onChange={(e) =>
                  setKycData({ ...kycData, tier: e.target.value })
                }
              >
                <option value="">Select Tier</option>
                <option value="2">Tier 2</option>
                <option value="3">Tier 3</option>
              </select>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-success"
                onClick={approveKyc}
                data-bs-dismiss="modal"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* REJECT MODAL */}
      <div className="modal fade" id="rejectModal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5>Reject KYC</h5>
              <button className="btn-close" data-bs-dismiss="modal" />
            </div>
            <div className="modal-body">
              <textarea
                className="form-control"
                placeholder="Reason"
                onChange={(e) =>
                  setKycData({ ...kycData, reason: e.target.value })
                }
              />
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-danger"
                onClick={rejectKyc}
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
