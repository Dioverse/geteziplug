import React, { useEffect, useState } from "react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import Topnav from "../../components/Topnav";
import HistoryLink from "../../components/HistoryLink";
import { getRequest } from "../../services/apiServices";
import { ToastContainer, toast } from "react-toastify";

export default function CryptoHistory() {
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filterType, setFilterType] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchRef, setSearchRef] = useState("");

  const [loadingApprove, setLoadingApprove] = useState(false);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    fetchData(page);
  }, [page]);

  const fetchData = async (pageNumber) => {
    setLoading(true);
    try {
      const res = await getRequest(`/histories/crypto?page=${pageNumber}`);
      setAllData(res.data?.results?.Data?.data || []);
      setTotalPages(res.data?.results?.Data?.last_page || 1);
    } catch (err) {
      console.error("Failed to fetch crypto history:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= ACTIONS ================= */
  const handleApprove = (id) => {
    toast.info(
      <div>
        <p>Are you sure you want to approve this request?</p>
        <div className="d-flex justify-content-end">
          <button
            className="btn btn-secondary btn-sm me-2"
            onClick={() => toast.dismiss()}
          >
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
            className="btn btn-danger btn-sm me-2"
            onClick={closeToast}
          >
            Yes
          </button>
          <button className="btn btn-secondary btn-sm" onClick={closeToast}>
            No
          </button>
        </div>
      ),
      { autoClose: false }
    );
  };

  /* ================= FILTER + SEARCH ================= */
  const filteredData = allData.filter((d) => {
    const typeMatch = filterType ? d.type === filterType : true;
    const statusMatch = statusFilter
      ? d.status?.toLowerCase() === statusFilter
      : true;
    const searchMatch = searchRef
      ? d.transaction_hash?.toLowerCase().includes(searchRef.toLowerCase())
      : true;

    return typeMatch && statusMatch && searchMatch;
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
                <span className="text-muted fw-light">Home / History</span> / Crypto
              </h4>

              <HistoryLink />

              <div className="card">
                {/* FILTER BAR */}
                <div className="card-header">
                  <div className="d-flex align-items-center gap-2 flex-nowrap">
                    <input
                      className="form-control"
                      placeholder="Search by Reference ID"
                      value={searchRef}
                      onChange={(e) => setSearchRef(e.target.value)}
                      style={{ maxWidth: "260px" }}
                    />

                    <select
                      className="form-select"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      style={{ maxWidth: "160px" }}
                    >
                      <option value="">All Types</option>
                      <option value="buy">Buy</option>
                      <option value="sell">Sell</option>
                    </select>

                    <select
                      className="form-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      style={{ maxWidth: "180px" }}
                    >
                      <option value="">All Status</option>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                </div>

                {/* TABLE */}
                <div className="table-responsive text-nowrap">
                  {loading ? (
                    <div className="text-center p-4">
                      <div className="spinner-border text-primary" />
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
                          <th>Wallet</th>
                          <th>Qty</th>
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
                            <td colSpan="12" className="text-center py-4">
                              No records found
                            </td>
                          </tr>
                        ) : (
                          filteredData.map((data, index) => (
                            <tr key={data.id}>
                              <td>{index + 1}</td>
                              <td>{data.transaction_hash ?? "—"}</td>
                              <td>{data.user?.username ?? "—"}</td>
                              <td>{data.crypto?.name ?? "—"}</td>
                              <td>{data.type}</td>
                              <td>{data.wallet_address ?? "—"}</td>
                              <td>{data.amount_crypto}</td>
                              <td>${data.amount}</td>
                              <td>₦{data.naira_equivalent}</td>
                              <td>
                                <span className={`badge ${
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
                                {new Date(data.created_at).toLocaleDateString()}
                              </td>
                              <td>
                                {data.status === "pending" && (
                                  <div className="dropdown">
                                    <button
                                      className="btn p-0 dropdown-toggle hide-arrow"
                                      data-bs-toggle="dropdown"
                                    >
                                      <i className="bx bx-dots-vertical-rounded" />
                                    </button>
                                    <div className="dropdown-menu">
                                      <button
                                        className="dropdown-item"
                                        onClick={() => handleApprove(data.id)}
                                      >
                                        Approve
                                      </button>
                                      <button
                                        className="dropdown-item"
                                        onClick={() => handleReject(data.id)}
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* PAGINATION */}
              <nav className="mt-3">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${page === 1 && "disabled"}`}>
                    <button className="page-link" onClick={() => setPage(page - 1)}>
                      Previous
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <li
                      key={i}
                      className={`page-item ${page === i + 1 ? "active" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${page === totalPages && "disabled"}`}>
                    <button className="page-link" onClick={() => setPage(page + 1)}>
                      Next
                    </button>
                  </li>
                </ul>
              </nav>

              <Footer />
              <ToastContainer position="top-center" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
