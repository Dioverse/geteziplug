import React, { useEffect, useState } from "react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import Topnav from "../../components/Topnav";
import HistoryLink from "../../components/HistoryLink";
import { getRequest } from "../../services/apiServices";
import { ToastContainer, toast } from "react-toastify";


export default function CryptoHistory() {
  const [allData, setAllData] = useState([]); // data from API (current page)
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const [filterType, setFilterType] = useState(""); // buy | sell
  const [statusFilter, setStatusFilter] = useState(""); // approved | pending | failed
    const [loadingApprove, setLoadingApprove] = useState(false);
  

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    fetchData(page);
  }, [page]);

  const fetchData = async (pageNumber) => {
    setLoading(true);
    try {
      const res = await getRequest(`/histories/crypto?page=${pageNumber}`);
      const records = res.data?.results?.Data?.data || [];
      setAllData(records);
      setTotalPages(res.data?.results?.Data?.last_page || 1);
    } catch (err) {
      console.error("Failed to fetch crypto history:", err);
    } finally {
      setLoading(false);
    }
  };

  //HANDLE APPROVE AND REJECT ACTION 
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
                  await getRequest(`/crypto/${id}/approve`);
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
  

  /* ================= CLIENT-SIDE FILTER ================= */
  const filteredData = allData.filter((d) => {
    const typeMatch = filterType ? d.type === filterType : true;
    const statusMatch = statusFilter
      ? d.status?.toLowerCase() === statusFilter
      : true;
    return typeMatch && statusMatch;
  });

  return (
    <div className="layout-wrapper layout-content-navbar">
      <div className="layout-container">
        <Navbar />
        <div className="layout-page">
          <Topnav />
          <div className="content-wrapper">
            <div className="container-xxl flex-grow-1 container-p-y">
              <h4 className="fw-bold py-3 mb-4">
                <span className="text-muted fw-light">Home /History</span> /
                Crypto
              </h4>

              <HistoryLink />

              <div className="card">
                {/* FILTERS */}
                <div className="card-header d-flex gap-2">
                  <select
                    className="form-select"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}>
                    <option value="">All Types</option>
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                  </select>

                  <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                {/* TABLE */}
                <div className="table-responsive text-nowrap">
                  {loading ? (
                    <div className="text-center p-4">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                        style={{ width: "3rem", height: "3rem" }}>
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
                          <th>Chain</th>
                          <th>Type</th>
                          <th>Wallet Add.</th>
                          <th>Quantity</th>
                          <th>Amount</th>
                          <th>Naira</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.length === 0 ? (
                          <tr>
                            <td colSpan="11" className="text-center py-4">
                              No records found
                            </td>
                          </tr>
                        ) : (
                          filteredData.map((data, index) => (
                            <tr key={data.id ?? index}>
                              <td>{index + 1}</td>
                              <td>{data.transaction_hash ?? "—"}</td>
                              <td>{data.user?.username ?? "—"}</td>
                              <td>{data.crypto?.name ?? "—"}</td>
                              <td>{data.type}</td>
                              <td>{data.wallet_address ?? "—"}</td>
                              <td>{data.amount_crypto}</td>
                              <td>
                                {new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency: "USD",
                                }).format(data.amount)}
                              </td>
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
                                  }`}>
                                  {data.status}
                                </span>
                              </td>
                              <td>
                                {new Date(data.created_at).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )}
                              </td>
                              {/* <td>
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
                                      onClick={() => handleApprove(data.id)}>
                                      <i className="bx bx-check me-1"></i>{" "}
                                      Approve
                                    </button>
                                    <button
                                      className="dropdown-item"
                                      onClick={() => handleReject(data.id)}>
                                      <i className="bx bx-x me-1"></i> Reject
                                    </button>
                                  </div>
                                </div>
                              </td> */}

                              {data.status === "pending" && (
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
                                      onClick={() => handleApprove(data.id)}>
                                      <i className="bx bx-check me-1"></i>{" "}
                                      Approve
                                    </button>
                                    <button
                                      className="dropdown-item"
                                      onClick={() => handleReject(data.id)}>
                                      <i className="bx bx-x me-1"></i> Reject
                                    </button>
                                  </div>
                                </div>
                              )}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* SERVER-SIDE PAGINATION */}
              <nav className="mt-3">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}>
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
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }>
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
  );
}
