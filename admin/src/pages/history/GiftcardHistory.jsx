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

  const [filterType, setFilterType] = useState(""); // type filter
  const [statusFilter, setStatusFilter] = useState(""); // ✅ new status filter

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [loadingApprove, setLoadingApprove] = useState(false);

  /* ================= FETCH DATA ================= */
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
    } finally {
      setLoading(false);
    }
  };

  /* ================= CLIENT-SIDE FILTER ================= */
  const filteredData = datas.filter((d) => {
    const typeMatch = filterType ? d.card_type === filterType : true;
    const statusMatch = statusFilter ? d.status === statusFilter : true;
    return typeMatch && statusMatch;
  });

  /* ================= HANDLERS ================= */
  const handleFilterChange = (e) => setFilterType(e.target.value);
  const handleStatusChange = (e) => setStatusFilter(e.target.value);

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
                  <span className="text-muted fw-light">Home /History</span> /
                  Giftcard
                </h4>

                <HistoryLink />

                <div className="card">
                  <div className="card-header d-flex gap-2">
                    <select
                      className="form-select"
                      value={filterType}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Types</option>
                      <option value="Amazon">Amazon</option>
                      <option value="Zelle">Zelle</option>
                      <option value="Dribble">Dribble</option>
                    </select>

                    <select
                      className="form-select"
                      value={statusFilter}
                      onChange={handleStatusChange}
                    >
                      <option value="">All Status</option>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

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
                            <th>Ref</th>
                            <th>User</th>
                            <th>Giftcard</th>
                            <th>Type</th>
                            <th>Qty</th>
                            <th>Naira</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredData.length === 0 ? (
                            <tr>
                              <td colSpan="10" className="text-center py-4">
                                No records found for this filter
                              </td>
                            </tr>
                          ) : (
                            filteredData.map((data, index) => (
                              <tr key={data.id || index}>
                                <td>{(page - 1) * pageSize + index + 1}</td>
                                <td>{data.reference}</td>
                                <td>
                                  <a href={`mailto:${data.user?.email || ""}`}>
                                    {data.user?.username || "Unknown User"}
                                  </a>
                                </td>
                                <td>{data.card_type}</td>
                                <td>{data.type}</td>
                                <td>{data.quantity}</td>
                                <td>
                                  {new Intl.NumberFormat("en-NG", {
                                    style: "currency",
                                    currency: "NGN",
                                  }).format(data.naira_equivalent)}
                                </td>
                                <td>
                                  <span
                                    className={`badge ${
                                      data.status === "approved"
                                        ? "bg-label-success"
                                        : data.status === "pending"
                                        ? "bg-label-warning"
                                        : "bg-label-danger"
                                    }`}
                                  >
                                    {data.status}
                                  </span>
                                </td>
                                <td>
                                  {new Date(data.created_at).toLocaleDateString(
                                    "en-US",
                                    { year: "numeric", month: "long", day: "numeric" }
                                  )}
                                </td>
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
                                      <button
                                        className="dropdown-item"
                                        onClick={() => handleApprove(data.id)}
                                      >
                                        <i className="bx bx-check me-1"></i> Approve
                                      </button>
                                      <button
                                        className="dropdown-item"
                                        onClick={() => handleReject(data.id)}
                                      >
                                        <i className="bx bx-x me-1"></i> Reject
                                      </button>
                                      {data.type === "sell" && (
                                        <button
                                          className="dropdown-item"
                                          onClick={() => handleView(data)}
                                        >
                                          <i className="bx bx-show me-1"></i> View
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
                  <ToastContainer position="top-center" autoClose={3000} />
                </div>

                {/* Pagination */}
                <nav className="mt-3">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                      >
                        Previous
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <li
                        key={i}
                        className={`page-item ${page === i + 1 ? "active" : ""}`}
                      >
                        <button className="page-link" onClick={() => setPage(i + 1)}>
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>

                <Footer />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
