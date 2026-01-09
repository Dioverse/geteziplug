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

export default function BonusManagement() {
  const [bonuses, setBonuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    bonus_type: "fixed",
    minimum_transaction: "",
    expiry_date: "",
    status: "active",
    max_usage: ""
  });

  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");

  // Apply filters
  const filteredData = bonuses.filter((b) => {
    const statusMatch = filterStatus ? b.status === filterStatus : true;
    const typeMatch = filterType ? b.bonus_type === filterType : true;
    return statusMatch && typeMatch;
  });

  const currentPageData = filteredData;

  const handleFilterStatusChange = (e) => {
    setFilterStatus(e.target.value);
    setPage(1);
  };

  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
    setPage(1);
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const fetchData = async (pageNum) => {
    setLoading(true);
    try {
      const res = await getRequest(
        `/admin/bonuses?page=${pageNum}&limit=${pageSize}`
      );
      const dataArray = res.data?.results?.Data?.data || res.data?.results?.Data || [];
      const lastPage = res.data?.results?.Data?.last_page || res.data?.results?.last_page || 1;
      
      setBonuses(dataArray);
      setTotalPages(lastPage);
    } catch (err) {
      console.error("Failed to fetch bonuses:", err);
      toast.error("Failed to load bonuses");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreate = () => {
    setFormData({
      title: "",
      description: "",
      amount: "",
      bonus_type: "fixed",
      minimum_transaction: "",
      expiry_date: "",
      status: "active",
      max_usage: ""
    });
    setShowCreateModal(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      amount: item.amount,
      bonus_type: item.bonus_type,
      minimum_transaction: item.minimum_transaction || "",
      expiry_date: item.expiry_date || "",
      status: item.status,
      max_usage: item.max_usage || ""
    });
    setShowEditModal(true);
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await postRequest("/admin/bonuses", formData);
      toast.success("Bonus created successfully");
      setShowCreateModal(false);
      fetchData(page);
      setFormData({
        title: "",
        description: "",
        amount: "",
        bonus_type: "fixed",
        minimum_transaction: "",
        expiry_date: "",
        status: "active",
        max_usage: ""
      });
    } catch (err) {
      console.error("Failed to create bonus:", err);
      toast.error("Failed to create bonus");
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await postRequest(`/admin/bonuses/${selectedItem.id}`, {
        ...formData,
        _method: "PUT"
      });
      toast.success("Bonus updated successfully");
      setShowEditModal(false);
      fetchData(page);
    } catch (err) {
      console.error("Failed to update bonus:", err);
      toast.error("Failed to update bonus");
    }
  };

  const handleToggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    
    toast.info(
      ({ closeToast }) => (
        <div>
          <p>Are you sure you want to {newStatus === "active" ? "activate" : "deactivate"} this bonus?</p>
          <button
            className="btn btn-sm btn-primary me-2"
            onClick={async () => {
              try {
                await postRequest(`/admin/bonuses/${id}/toggle`, {
                  status: newStatus
                });
                toast.success(`Bonus ${newStatus === "active" ? "activated" : "deactivated"}`);
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

  const handleDelete = (id) => {
    toast.info(
      ({ closeToast }) => (
        <div>
          <p>Are you sure you want to delete this bonus?</p>
          <button
            className="btn btn-sm btn-danger me-2"
            onClick={async () => {
              try {
                await postRequest(`/admin/bonuses/${id}`, {
                  _method: "DELETE"
                });
                toast.success("Bonus deleted successfully");
                fetchData(page);
                closeToast();
              } catch (err) {
                console.error(err);
                toast.error("Failed to delete bonus");
              }
            }}>
            Yes, Delete
          </button>
          <button className="btn btn-sm btn-secondary" onClick={closeToast}>
            Cancel
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
                  Bonus Management
                </h4>

                <div className="row">
                  <div className="col-lg-12 mb-4 order-0">
                    <div className="card">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <div className="d-flex gap-2 align-items-center">
                          <h5 className="mb-0">Filter</h5>
                          <select
                            className="form-select"
                            value={filterType}
                            onChange={handleFilterTypeChange}
                            style={{ width: '180px' }}
                          >
                            <option value="">All Types</option>
                            <option value="fixed">Fixed Amount</option>
                            <option value="percentage">Percentage</option>
                          </select>
                          <select
                            className="form-select"
                            value={filterStatus}
                            onChange={handleFilterStatusChange}
                            style={{ width: '180px' }}
                          >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="expired">Expired</option>
                          </select>
                        </div>

                        <button
                          className="btn btn-primary"
                          onClick={handleCreate}
                        >
                          <i className="bx bx-plus me-1"></i> Create Bonus
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
                                  <th>Type</th>
                                  <th>Amount</th>
                                  <th>Min Transaction</th>
                                  <th>Max Usage</th>
                                  <th>Expiry Date</th>
                                  <th>Status</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {currentPageData.length === 0 ? (
                                  <tr>
                                    <td
                                      colSpan="9"
                                      className="text-center py-4">
                                      No bonuses found
                                    </td>
                                  </tr>
                                ) : (
                                  currentPageData.map((data, index) => (
                                    <tr key={data.id || index}>
                                      <td>
                                        {(page - 1) * pageSize + index + 1}
                                      </td>
                                      <td>
                                        <strong>{data.title}</strong>
                                        <br />
                                        <small className="text-muted">
                                          {data.description ? data.description.substring(0, 50) + '...' : ''}
                                        </small>
                                      </td>
                                      <td>
                                        <span className={`badge ${
                                          data.bonus_type === "fixed" ? "bg-label-primary" : "bg-label-info"
                                        }`}>
                                          {data.bonus_type === "fixed" ? "Fixed" : "Percentage"}
                                        </span>
                                      </td>
                                      <td>
                                        {data.bonus_type === "percentage" 
                                          ? `${data.amount}%`
                                          : new Intl.NumberFormat("en-NG", {
                                              style: "currency",
                                              currency: "NGN",
                                            }).format(data.amount)}
                                      </td>
                                      <td>
                                        {data.minimum_transaction
                                          ? new Intl.NumberFormat("en-NG", {
                                              style: "currency",
                                              currency: "NGN",
                                            }).format(data.minimum_transaction)
                                          : "N/A"}
                                      </td>
                                      <td>
                                        {data.max_usage || "Unlimited"}
                                      </td>
                                      <td>
                                        {data.expiry_date
                                          ? new Date(data.expiry_date).toLocaleDateString("en-US", {
                                              year: "numeric",
                                              month: "short",
                                              day: "numeric",
                                            })
                                          : "No Expiry"}
                                      </td>
                                      <td>
                                        <span
                                          className={`badge ${
                                            data.status === "active"
                                              ? "bg-label-success"
                                              : data.status === "expired"
                                              ? "bg-label-danger"
                                              : "bg-label-secondary"
                                          }`}>
                                          {data.status}
                                        </span>
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
                                              View
                                            </button>
                                            <button
                                              className="dropdown-item"
                                              onClick={() => handleEdit(data)}>
                                              <i className="bx bx-edit me-1"></i>{" "}
                                              Edit
                                            </button>
                                            <button
                                              className="dropdown-item"
                                              onClick={() =>
                                                handleToggleStatus(data.id, data.status)
                                              }>
                                              <i className="bx bx-toggle-left me-1"></i>{" "}
                                              {data.status === "active" ? "Deactivate" : "Activate"}
                                            </button>
                                            <button
                                              className="dropdown-item text-danger"
                                              onClick={() => handleDelete(data.id)}>
                                              <i className="bx bx-trash me-1"></i>{" "}
                                              Delete
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

        {/* Create Modal */}
        <div
          className={`modal fade ${showCreateModal ? "show d-block" : ""}`}
          tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create Bonus</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}></button>
              </div>
              <form onSubmit={handleSubmitCreate}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Title <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., Welcome Bonus"
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Bonus Type <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        name="bonus_type"
                        value={formData.bonus_type}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="fixed">Fixed Amount</option>
                        <option value="percentage">Percentage</option>
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Amount <span className="text-danger">*</span>
                        <small className="text-muted ms-1">
                          {formData.bonus_type === "percentage" ? "(in %)" : "(in NGN)"}
                        </small>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        placeholder={formData.bonus_type === "percentage" ? "e.g., 10" : "e.g., 1000"}
                        step={formData.bonus_type === "percentage" ? "0.01" : "1"}
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Minimum Transaction</label>
                      <input
                        type="number"
                        className="form-control"
                        name="minimum_transaction"
                        value={formData.minimum_transaction}
                        onChange={handleInputChange}
                        placeholder="e.g., 5000"
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Max Usage Per User</label>
                      <input
                        type="number"
                        className="form-control"
                        name="max_usage"
                        value={formData.max_usage}
                        onChange={handleInputChange}
                        placeholder="Leave empty for unlimited"
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Expiry Date</label>
                      <input
                        type="date"
                        className="form-control"
                        name="expiry_date"
                        value={formData.expiry_date}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Describe the bonus..."
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Bonus
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        <div
          className={`modal fade ${showEditModal ? "show d-block" : ""}`}
          tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Bonus</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}></button>
              </div>
              <form onSubmit={handleSubmitEdit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Title <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Bonus Type <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        name="bonus_type"
                        value={formData.bonus_type}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="fixed">Fixed Amount</option>
                        <option value="percentage">Percentage</option>
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Amount <span className="text-danger">*</span>
                        <small className="text-muted ms-1">
                          {formData.bonus_type === "percentage" ? "(in %)" : "(in NGN)"}
                        </small>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        step={formData.bonus_type === "percentage" ? "0.01" : "1"}
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Minimum Transaction</label>
                      <input
                        type="number"
                        className="form-control"
                        name="minimum_transaction"
                        value={formData.minimum_transaction}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Max Usage Per User</label>
                      <input
                        type="number"
                        className="form-control"
                        name="max_usage"
                        value={formData.max_usage}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Expiry Date</label>
                      <input
                        type="date"
                        className="form-control"
                        name="expiry_date"
                        value={formData.expiry_date}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update Bonus
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* View Modal */}
        <div
          key={selectedItem?.id}
          className={`modal fade ${showViewModal ? "show d-block" : ""}`}
          tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Bonus Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body">
                {selectedItem ? (
                  <>
                    <div className="mb-3">
                      <h4>{selectedItem.title}</h4>
                      <span className={`badge ${
                        selectedItem.bonus_type === "fixed" ? "bg-label-primary" : "bg-label-info"
                      } me-2`}>
                        {selectedItem.bonus_type === "fixed" ? "Fixed Amount" : "Percentage"}
                      </span>
                      <span
                        className={`badge ${
                          selectedItem.status === "active"
                            ? "bg-label-success"
                            : selectedItem.status === "expired"
                            ? "bg-label-danger"
                            : "bg-label-secondary"
                        }`}>
                        {selectedItem.status}
                      </span>
                    </div>

                    <ul className="list-group">
                      <li className="list-group-item">
                        <strong>Amount:</strong>{" "}
                        <span className="text-primary fw-bold fs-5">
                          {selectedItem.bonus_type === "percentage" 
                            ? `${selectedItem.amount}%`
                            : new Intl.NumberFormat("en-NG", {
                                style: "currency",
                                currency: "NGN",
                              }).format(selectedItem.amount)}
                        </span>
                      </li>
                      <li className="list-group-item">
                        <strong>Description:</strong>
                        <br />
                        {selectedItem.description || "No description"}
                      </li>
                      <li className="list-group-item">
                        <strong>Minimum Transaction:</strong>{" "}
                        {selectedItem.minimum_transaction
                          ? new Intl.NumberFormat("en-NG", {
                              style: "currency",
                              currency: "NGN",
                            }).format(selectedItem.minimum_transaction)
                          : "No minimum"}
                      </li>
                      <li className="list-group-item">
                        <strong>Max Usage Per User:</strong>{" "}
                        {selectedItem.max_usage || "Unlimited"}
                      </li>
                      <li className="list-group-item">
                        <strong>Expiry Date:</strong>{" "}
                        {selectedItem.expiry_date
                          ? new Date(selectedItem.expiry_date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "No expiry"}
                      </li>
                      <li className="list-group-item">
                        <strong>Created:</strong>{" "}
                        {new Date(selectedItem.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </li>
                      <li className="list-group-item">
                        <strong>Last Updated:</strong>{" "}
                        {new Date(selectedItem.updated_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
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