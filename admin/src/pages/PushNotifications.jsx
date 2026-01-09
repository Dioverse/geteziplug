import React, { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Topnav from "../components/Topnav";
import {
  getRequest,
  postRequest,
} from "../services/apiServices";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function PushNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const [showSendModal, setShowSendModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    recipient_type: "all",
    user_id: "",
    priority: "normal",
    action_url: "",
    schedule_time: ""
  });

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    fetchNotifications(page);
  }, [page]);

  const fetchNotifications = async (pageNum) => {
    setLoading(true);
    try {
      const res = await getRequest(
        `/admin/notifications?page=${pageNum}&limit=${pageSize}`
      );
      const dataArray = res.data?.results?.Data?.data || res.data?.results?.Data || [];
      const lastPage = res.data?.results?.Data?.last_page || res.data?.results?.last_page || 1;
      
      setNotifications(dataArray);
      setTotalPages(lastPage);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await getRequest("/admin/users?page=1&limit=100");
      const dataArray = res.data?.results?.Data?.data || res.data?.results?.Data || [];
      setUsers(dataArray);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      toast.error("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSendNotification = () => {
    setFormData({
      title: "",
      message: "",
      recipient_type: "all",
      user_id: "",
      priority: "normal",
      action_url: "",
      schedule_time: ""
    });
    setShowSendModal(true);
    if (formData.recipient_type === "specific") {
      fetchUsers();
    }
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const handleSubmitSend = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.message) {
      toast.error("Please fill in title and message");
      return;
    }

    if (formData.recipient_type === "specific" && !formData.user_id) {
      toast.error("Please select a user");
      return;
    }

    try {
      await postRequest("/admin/notifications/send", formData);
      toast.success("Notification sent successfully");
      setShowSendModal(false);
      fetchNotifications(page);
      setFormData({
        title: "",
        message: "",
        recipient_type: "all",
        user_id: "",
        priority: "normal",
        action_url: "",
        schedule_time: ""
      });
    } catch (err) {
      console.error("Failed to send notification:", err);
      toast.error(err.response?.data?.message || "Failed to send notification");
    }
  };

  const handleRecipientTypeChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, recipient_type: value });
    
    if (value === "specific" && users.length === 0) {
      fetchUsers();
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
                <h4 className="fw-bold py-3 mb-4">
                  <span className="text-muted fw-light">Home /</span> Push Notifications
                </h4>

                <div className="row">
                  <div className="col-lg-12 mb-4 order-0">
                    <div className="card">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Notification History</h5>

                        <button
                          className="btn btn-primary"
                          onClick={handleSendNotification}
                        >
                          <i className="bx bx-bell-plus me-1"></i> Send Notification
                        </button>
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
                                  <th>Title</th>
                                  <th>Message</th>
                                  <th>Recipient Type</th>
                                  <th>Priority</th>
                                  <th>Status</th>
                                  <th>Sent Date</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {notifications.length === 0 ? (
                                  <tr>
                                    <td
                                      colSpan="8"
                                      className="text-center py-4">
                                      No notifications found
                                    </td>
                                  </tr>
                                ) : (
                                  notifications.map((data, index) => (
                                    <tr key={data.id || index}>
                                      <td>
                                        {(page - 1) * pageSize + index + 1}
                                      </td>
                                      <td>
                                        <strong>{data.title}</strong>
                                      </td>
                                      <td>
                                        <small>
                                          {data.message?.length > 50
                                            ? `${data.message.substring(0, 50)}...`
                                            : data.message}
                                        </small>
                                      </td>
                                      <td>
                                        <span className={`badge ${
                                          data.recipient_type === "all" ? "bg-label-primary" :
                                          data.recipient_type === "specific" ? "bg-label-info" :
                                          "bg-label-success"
                                        }`}>
                                          {data.recipient_type}
                                        </span>
                                      </td>
                                      <td>
                                        <span className={`badge ${
                                          data.priority === "high" ? "bg-label-danger" :
                                          data.priority === "normal" ? "bg-label-primary" :
                                          "bg-label-secondary"
                                        }`}>
                                          {data.priority}
                                        </span>
                                      </td>
                                      <td>
                                        <span
                                          className={`badge ${
                                            data.status === "sent"
                                              ? "bg-label-success"
                                              : data.status === "scheduled"
                                              ? "bg-label-warning"
                                              : data.status === "failed"
                                              ? "bg-label-danger"
                                              : "bg-label-secondary"
                                          }`}>
                                          {data.status}
                                        </span>
                                      </td>
                                      <td>
                                        {new Date(
                                          data.created_at || data.sent_at
                                        ).toLocaleDateString("en-US", {
                                          year: "numeric",
                                          month: "short",
                                          day: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
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

        {/* Send Notification Modal */}
        <div
          className={`modal fade ${showSendModal ? "show d-block" : ""}`}
          tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bx bx-bell-plus me-2"></i>
                  Send Push Notification
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowSendModal(false)}></button>
              </div>
              <form onSubmit={handleSubmitSend}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">
                      Title <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Notification title"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Message <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows="4"
                      placeholder="Notification message..."
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Recipient Type</label>
                      <select
                        className="form-select"
                        name="recipient_type"
                        value={formData.recipient_type}
                        onChange={handleRecipientTypeChange}
                      >
                        <option value="all">All Users</option>
                        <option value="specific">Specific User</option>
                        <option value="active">Active Users Only</option>
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Priority</label>
                      <select
                        className="form-select"
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                      >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  {formData.recipient_type === "specific" && (
                    <div className="mb-3">
                      <label className="form-label">
                        Select User <span className="text-danger">*</span>
                      </label>
                      {loadingUsers ? (
                        <p className="text-muted">Loading users...</p>
                      ) : (
                        <select
                          className="form-select"
                          name="user_id"
                          value={formData.user_id}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">-- Select a user --</option>
                          {users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.firstName && user.lastName
                                ? `${user.firstName} ${user.lastName}`
                                : user.username} - {user.email}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Action URL (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      name="action_url"
                      value={formData.action_url}
                      onChange={handleInputChange}
                      placeholder="e.g., /transactions, /profile"
                    />
                    <small className="text-muted">
                      Where to navigate when user taps notification
                    </small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Schedule Time (Optional)</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      name="schedule_time"
                      value={formData.schedule_time}
                      onChange={handleInputChange}
                    />
                    <small className="text-muted">
                      Leave empty to send immediately
                    </small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowSendModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="bx bx-send me-1"></i>
                    {formData.schedule_time ? "Schedule" : "Send Now"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* View Notification Modal */}
        <div
          key={selectedItem?.id}
          className={`modal fade ${showViewModal ? "show d-block" : ""}`}
          tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Notification Details</h5>
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
                        <strong>Title:</strong>
                        <br />
                        <span className="fs-5">{selectedItem.title}</span>
                      </li>
                      <li className="list-group-item">
                        <strong>Message:</strong>
                        <br />
                        {selectedItem.message}
                      </li>
                      <li className="list-group-item">
                        <strong>Recipient Type:</strong>{" "}
                        <span className={`badge ${
                          selectedItem.recipient_type === "all" ? "bg-label-primary" :
                          selectedItem.recipient_type === "specific" ? "bg-label-info" :
                          "bg-label-success"
                        }`}>
                          {selectedItem.recipient_type}
                        </span>
                      </li>
                      {selectedItem.recipient_type === "specific" && selectedItem.user && (
                        <li className="list-group-item">
                          <strong>Recipient:</strong>{" "}
                          {selectedItem.user.firstName && selectedItem.user.lastName
                            ? `${selectedItem.user.firstName} ${selectedItem.user.lastName}`
                            : selectedItem.user.username}
                          <br />
                          <small className="text-muted">{selectedItem.user.email}</small>
                        </li>
                      )}
                      <li className="list-group-item">
                        <strong>Priority:</strong>{" "}
                        <span className={`badge ${
                          selectedItem.priority === "high" ? "bg-label-danger" :
                          selectedItem.priority === "normal" ? "bg-label-primary" :
                          "bg-label-secondary"
                        }`}>
                          {selectedItem.priority}
                        </span>
                      </li>
                      {selectedItem.action_url && (
                        <li className="list-group-item">
                          <strong>Action URL:</strong> {selectedItem.action_url}
                        </li>
                      )}
                      <li className="list-group-item">
                        <strong>Status:</strong>{" "}
                        <span
                          className={`badge ${
                            selectedItem.status === "sent"
                              ? "bg-label-success"
                              : selectedItem.status === "scheduled"
                              ? "bg-label-warning"
                              : selectedItem.status === "failed"
                              ? "bg-label-danger"
                              : "bg-label-secondary"
                          }`}>
                          {selectedItem.status}
                        </span>
                      </li>
                      {selectedItem.sent_count && (
                        <li className="list-group-item">
                          <strong>Sent Count:</strong> {selectedItem.sent_count} users
                        </li>
                      )}
                      <li className="list-group-item">
                        <strong>Sent At:</strong>{" "}
                        {new Date(selectedItem.created_at || selectedItem.sent_at).toLocaleString()}
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
      </div>
    </>
  );
}