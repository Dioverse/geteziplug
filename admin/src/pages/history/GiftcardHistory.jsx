import React, { useEffect, useState } from "react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import Topnav from "../../components/Topnav";
import HistoryLink from "../../components/HistoryLink";
import {
  getRequest,
  postRequest,
} from "../../services/apiServices";
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

  const [filterType, setFilterType] = useState(""); // ✅ new state
  // ✅ Apply filter
  const filteredData = datas.filter((d) =>
    filterType ? d.card_type === filterType : true
  );

  const currentPageData = filteredData;
  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
    setPage(1);
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [loadingApprove, setLoadingApprove] = useState(false);

  //   const handleCloseModal = () => {
  //     setShowViewModal(false);
  //     setSelectedItem(null);
  //   };

  const handleReject = (id) => {
    toast.info(
      ({ closeToast }) => (
        <div>
          <p>Are you sure you want to reject this?</p>
          <button
            className="btn btn-sm btn-danger me-2"
            onClick={() => {
              setRejectId(id); // store which item is being rejected
              setShowRejectModal(true); // open modal
              closeToast(); // close the toast
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

  // HandleApprove
  const handleApprove = (id) => {
    toast.info(
      <div>
        <p>Are you sure you want to approve this request?</p>
        <div className="d-flex justify-content-end">
          <button
            className="btn btn-secondary btn-sm me-2"
            onClick={() => toast.dismiss()}>
            Cancel
          </button>
          <button
            className="btn btn-success btn-sm"
            disabled={loadingApprove} // ✅ prevent multiple clicks
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
            }}>
            {loadingApprove ? "Approving..." : "Yes, Approve"}
          </button>
        </div>
      </div>,
      { autoClose: false }
    );
  };

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
      setTotalPages(res.data.results.Data.last_page);
    } catch (err) {
      console.error("Failed to fetch plan:", err);
    } finally {
      setLoading(false);
    }
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
                <h4 class="fw-bold py-3 mb-4">
                  <span class="text-muted fw-light">Home /History</span> /
                  Giftcard
                </h4>

                <div className="row">
                  <div className="col-lg-12 mb-4 order-0">
                    <HistoryLink />
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Filter</h5>

                        <div className="card-header-actions col-4">
                          <select
                            className="form-select"
                            value={filterType}
                            onChange={handleFilterChange} // ✅ added
                          >
                            <option value="">All</option>
                            <option value="Amazon">Amazon</option>
                            <option value="Zelle">Zelle</option>
                            <option value="Dribble">Dribble</option>
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
                                {currentPageData.length === 0 ? (
                                  <tr>
                                    <td
                                      colSpan="10"
                                      className="text-center py-4">
                                      No records found for this filter
                                    </td>
                                  </tr>
                                ) : (
                                  currentPageData.map((data, index) => (
                                    <tr key={data.id || index}>
                                      {/* <td>{startIndex + index + 1}</td> // ✅
                                      fixed numbering with pagination */}
                                      <td>
                                        {(page - 1) * pageSize + index + 1}
                                      </td>

                                      <td>{data.reference}</td>
                                      <td>
                                        {/* <a href={`mailto:${data.user.email}`}>
                                          {data.user.username}
                                        </a> */}
                                        <a
                                          href={`mailto:${
                                            data.user?.email || ""
                                          }`}>
                                          {data.user?.username ||
                                            "Unknown User"}
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
                                          }`}>
                                          {data.status}
                                        </span>
                                      </td>
                                      <td>
                                        {new Date(
                                          data.created_at
                                        ).toLocaleDateString("en-US", {
                                          year: "numeric",
                                          month: "long",
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
                                              onClick={() =>
                                                handleApprove(data.id)
                                              }>
                                              <i className="bx bx-check me-1"></i>{" "}
                                              Approve
                                            </button>
                                            <button
                                              className="dropdown-item"
                                              onClick={() =>
                                                handleReject(data.id)
                                              }>
                                              <i className="bx bx-x me-1"></i>{" "}
                                              Reject
                                            </button>

                                            {data.type === "sell" && (
                                              <button
                                                className="dropdown-item"
                                                onClick={() =>
                                                  handleView(data)
                                                }>
                                                <i className="bx bx-show me-1"></i>{" "}
                                                View
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
                <h5 className="modal-title">Giftcard Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body">
                {selectedItem ? (
                  <>
                    {selectedItem?.images && (
                      <div className="text-center mb-3">
                        <img
                          src={`http://127.0.0.1:8000/${
                            JSON.parse(selectedItem.images)[0]
                          }`}
                          alt="Giftcard"
                          className="img-fluid rounded"
                          style={{ maxHeight: "250px", objectFit: "contain" }}
                          onError={(e) =>
                            (e.target.src =
                              "https://via.placeholder.com/250?text=No+Image")
                          }
                        />
                      </div>
                    )}
                    {selectedItem?.images && (
                      <div className="text-center mb-3 d-flex flex-wrap justify-content-center gap-3">
                        {JSON.parse(selectedItem.images).map((img, idx) => (
                          <img
                            key={idx}
                            src={`http://127.0.0.1:8000/${img}`}
                            alt={`Giftcard Proof ${idx + 1}`}
                            className="img-fluid rounded"
                            style={{ maxHeight: "200px", objectFit: "contain" }}
                            onError={(e) =>
                              (e.target.src =
                                "https://via.placeholder.com/200?text=No+Image")
                            }
                          />
                        ))}
                      </div>
                    )}
                    <ul className="list-group">
                      <li className="list-group-item">
                        <strong>Reference:</strong> {selectedItem.reference}
                      </li>
                      <li className="list-group-item">
                        <strong>User:</strong> {selectedItem.user.username}
                      </li>
                      <li className="list-group-item">
                        <strong>Giftcard:</strong> {selectedItem.card_type}
                      </li>
                      <li className="list-group-item">
                        <strong>Type:</strong> {selectedItem.type}
                      </li>
                      <li className="list-group-item">
                        <strong>Quantity:</strong> {selectedItem.quantity}
                      </li>
                      <li className="list-group-item">
                        <strong>Naira:</strong>{" "}
                        {new Intl.NumberFormat("en-NG", {
                          style: "currency",
                          currency: "NGN",
                          minimumFractionDigits: 0,
                        }).format(selectedItem.naira_equivalent)}
                      </li>
                      <li className="list-group-item">
                        <strong>Status:</strong>{" "}
                        <span
                          className={`badge ${
                            selectedItem.status === "approved"
                              ? "bg-label-success"
                              : selectedItem.status === "pending"
                              ? "bg-label-warning"
                              : "bg-label-danger"
                          }`}>
                          {selectedItem.status === "approved"
                            ? "Approved"
                            : selectedItem.status === "pending"
                            ? "Pending"
                            : "Rejected"}
                        </span>
                      </li>

                      {/* ✅ Only show reason if rejected */}
                      {selectedItem.status === "rejected" && (
                        <li className="list-group-item">
                          <strong>Reason:</strong>{" "}
                          {selectedItem.reason || "No reason provided"}
                        </li>
                      )}

                      <li className="list-group-item">
                        <strong>Date:</strong>{" "}
                        {new Date(selectedItem.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </li>
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
        {/* Reject Modal */}
        <div
          className={`modal fade ${showRejectModal ? "show d-block" : ""}`}
          tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reason for Rejection</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRejectModal(false)}></button>
              </div>
              <div className="modal-body">
                <textarea
                  className="form-control"
                  placeholder="Enter reason..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
                {/* <textarea
                  className="form-control"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter reasons, separated by commas"
                /> */}
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowRejectModal(false)}>
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  disabled={!rejectReason.trim()} // ✅ prevent empty reason
                  onClick={async () => {
                    try {
                      await postRequest(`/giftcard/${rejectId}/decline`, {
                        reason: rejectReason, // lowercase "reason" unless API expects "Reason"
                      });
                      toast.success("Rejected successfully");
                      fetchData(page);
                      setRejectReason("");
                      setShowRejectModal(false);
                    } catch (err) {
                      console.error(err);
                      toast.error("Failed to reject");
                    }
                  }}>
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
