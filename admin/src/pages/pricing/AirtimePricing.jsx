import React, { useEffect, useState } from "react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import Topnav from "../../components/Topnav";
import NavLink from "../../components/NavLink";
import api from "../../services/api";
import { getRequest } from "../../services/apiServices";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AirtimePricing() {
  const [datas, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // form state
  const [percentage, setPercentage] = useState("");

  const [networkId, setNetworkId] = useState("");
  const [buyPrice, setBuyPrice] = useState("");

  const [editingPlan, setEditingPlan] = useState(null); // holds the plan being edited

  const handleAddPlan = async () => {
    if (!networkId || !percentage || !buyPrice) {
      toast.warning("Please fill in all fields");
      return;
    }

    try {
      await api.post("/admin/pricings/airtime", {
        network_id: networkId,
        buy_price: Number(buyPrice),
        percentage: Number(percentage),
      });
      toast.success("Airtime plan added successfully!", {
        onClose: () => {
          const modal = document.getElementById("basicModal");
          const modalInstance = window.bootstrap.Modal.getInstance(modal);
          if (modalInstance) modalInstance.hide();
        },
      });

      // refresh list
      fetchData();

      // reset form
      setNetworkId("");
      setPercentage("");
      setBuyPrice("");
    } catch (err) {
      const message = err.response?.data?.message || "Failed to add plan";
      toast.error(message);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]); // prevents infinite requests

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/admin/pricings/airtime?page=${page}&limit=${pageSize}`
      );
      setData(res.data?.results?.Data || []);
      setTotalPages(res.data?.results?.last_page || 1);
    } catch (err) {
      console.error("Failed to fetch airtime pricing data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (plan) => {
    setEditingPlan({
      ...plan,
      network_id: String(plan.network?.id || plan.network_id), // always string
    });
    const modal = new window.bootstrap.Modal(
      document.getElementById("editModal")
    );
    modal.show();
  };



  const handleUpdatePlan = async () => {
    if (!editingPlan) return;

    try {
      await api.put(`/admin/pricings/airtime/${editingPlan.id}`, {
        network_id: String(editingPlan.network_id),
        buy_price: Number(editingPlan.buy_price),
        percentage: Number(editingPlan.percentage),
      });

      toast.success("Plan updated successfully!", {
        onClose: () => {
          const modal = document.getElementById("editModal");
          const modalInstance = window.bootstrap.Modal.getInstance(modal);
          if (modalInstance) modalInstance.hide();
        },
      });

      fetchData();
      setEditingPlan(null); // reset
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update plan";
      toast.error(message);
    }
  };



  useEffect(() => {
    const modal = document.getElementById("editModal");
    modal?.addEventListener("hidden.bs.modal", () => {
      setEditingPlan(null);
    });
  }, []);



  const confirmDelete = (id) => {
    toast.info(
      <div>
        <p>Are you sure you want to delete this Data Plan?</p>
        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => {
              toast.dismiss(); // close the confirmation toast
              deleteDataPlan(id); // call delete
            }}>
            Yes, Delete
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => toast.dismiss()} // just close toast
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false, // don’t auto-close until user clicks
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      }
    );
  };

  const deleteDataPlan = async (id) => {
    if (!id) {
      alert("plan does not exist");
      return;
    }
    setLoading(true);
    try {
      const response = await api.delete(`/admin/pricings/airtime/${id}`);
      toast.success("Airtime Plan deleted successfully");
      console.log(response);
      fetchData(page);
    } catch (error) {
      toast.error("Delete Unsuccessful");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout-wrapper layout-content-navbar">
      <div className="layout-container">
        <Navbar />
        <div className="layout-page">
          <Topnav />
          <div className="content-wrapper">
            <div className="container-xxl flex-grow-1 container-p-y">
              <h4 className="fw-bold py-3 mb-4">
                <span className="text-muted fw-light">Home / Pricing</span> /
                Airtime
              </h4>

              <div className="row">
                <div className="col-lg-12 mb-4 order-0">
                  <NavLink />
                  <div className="card">
                    <div className="card-header">
                      <h5 className="mb-0">Filter Pricing Plans</h5>

                      <div className="card-header-actions float-end">
                        <button
                          type="button"
                          className="btn btn-primary"
                          data-bs-toggle="modal"
                          data-bs-target="#basicModal">
                          Add Plan
                        </button>
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
                                <th>Network</th>
                                <th>Status</th>
                                <th>Percentage</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody className="table-border-bottom-0">
                              {datas.map((data, index) => (
                                <tr key={data.id}>
                                  {/* <td>{index + 1}</td> */}
                                  <td>{(page - 1) * pageSize + (index + 1)}</td>

                                  <td>{data.network.name}</td>
                                  {/* <td>
                                    <span className="badge bg-label-primary me-1">Active</span>
                                  </td> */}
                                  <td>
                                    <span
                                      className={`badge ${
                                        data.status === "approved"
                                          ? "bg-label-success"
                                          : data.status === "pending"
                                          ? "bg-label-warning"
                                          : "bg-label-danger"
                                      }`}
                                      title={
                                        data.status === "rejected"
                                          ? data.reason || "No reason provided"
                                          : ""
                                      }>
                                      {data.status === "approved"
                                        ? "Approved"
                                        : data.status === "pending"
                                        ? "Pending"
                                        : "Pending"}
                                    </span>
                                  </td>
                                  <td>{data.percentage}%</td>
                                  <td>
                                    <div className="dropdown">
                                      <button
                                        type="button"
                                        className="btn p-0 dropdown-toggle hide-arrow"
                                        data-bs-toggle="dropdown">
                                        <i className="bx bx-dots-vertical-rounded"></i>
                                      </button>
                                      <div className="dropdown-menu">
                                        {/* <button className="dropdown-item">
                                          <i className="bx bx-edit-alt me-1"></i>{" "}
                                          Edit
                                        </button> */}
                                        <button
                                          className="dropdown-item"
                                          onClick={() => handleEditClick(data)}>
                                          <i className="bx bx-edit-alt me-1"></i>{" "}
                                          Edit
                                        </button>

                                        <button
                                          className="dropdown-item"
                                          onClick={() =>
                                            // deleteDataPlan(data.id)
                                            confirmDelete(data.id)
                                          }>
                                          <i className="bx bx-trash me-1"></i>{" "}
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                      {/* Add Plan Modal */}
                      <div
                        className="modal fade"
                        id="basicModal"
                        tabIndex="-1"
                        aria-labelledby="basicModalLabel"
                        aria-hidden="true">
                        <div className="modal-dialog modal-dialog-centered">
                          <div className="modal-content">
                            <div className="modal-header">
                              <h5 className="modal-title" id="basicModalLabel">
                                Add Airtime Plan
                              </h5>
                              <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                              <form>
                                <div className="mb-3">
                                  <label
                                    htmlFor="network"
                                    className="form-label">
                                    Network
                                  </label>
                                  <select
                                    className="form-select"
                                    id="network"
                                    value={networkId}
                                    onChange={(e) =>
                                      setNetworkId(e.target.value)
                                    }
                                    required>
                                    <option value="">Select Network</option>
                                    <option value="1">MTN</option>
                                    <option value="2">Glo</option>
                                    <option value="3">Airtel</option>
                                    <option value="4">9mobile</option>
                                  </select>
                                </div>

                                <div className="mb-3">
                                  <label
                                    htmlFor="percentage"
                                    className="form-label">
                                    Percentage
                                  </label>
                                  <input
                                    type="number"
                                    className="form-control"
                                    id="percentage"
                                    value={percentage}
                                    onChange={(e) =>
                                      setPercentage(e.target.value)
                                    }
                                    placeholder="Enter percentage"
                                    required
                                  />
                                </div>

                                <div className="mb-3">
                                  <label
                                    htmlFor="buyPrice"
                                    className="form-label">
                                    Buy Price
                                  </label>
                                  <input
                                    type="number"
                                    className="form-control"
                                    id="buyPrice"
                                    value={buyPrice}
                                    onChange={(e) =>
                                      setBuyPrice(e.target.value)
                                    }
                                    placeholder="Enter buy price"
                                    required
                                  />
                                </div>
                              </form>
                            </div>
                            <div className="modal-footer">
                              <button
                                type="button"
                                className="btn btn-secondary"
                                data-bs-dismiss="modal">
                                Cancel
                              </button>
                              <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleAddPlan}>
                                Save Plan
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className="modal fade"
                        id="editModal"
                        tabIndex="-1"
                        aria-labelledby="editModalLabel"
                        aria-hidden="true">
                        <div className="modal-dialog modal-dialog-centered">
                          <div className="modal-content">
                            <div className="modal-header">
                              <h5 className="modal-title" id="editModalLabel">
                                Edit Airtime Plan
                              </h5>
                              <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                              {editingPlan && (
                                <form>
                                  <div className="mb-3">
                                    <label
                                      htmlFor="editNetwork"
                                      className="form-label">
                                      Network
                                    </label>
                                    <select
                                      className="form-select"
                                      id="editNetwork"
                                      value={editingPlan.network_id}
                                      onChange={(e) =>
                                        setEditingPlan({
                                          ...editingPlan,
                                          network_id: e.target.value,
                                        })
                                      }>
                                      <option value="">Select Network</option>
                                      <option value="1">MTN</option>
                                      <option value="2">Glo</option>
                                      <option value="3">Airtel</option>
                                      <option value="4">9mobile</option>
                                    </select>
                                  </div>

                                  <div className="mb-3">
                                    <label
                                      htmlFor="editPercentage"
                                      className="form-label">
                                      Percentage
                                    </label>
                                    <input
                                      type="number"
                                      className="form-control"
                                      id="editPercentage"
                                      value={editingPlan.percentage}
                                      onChange={(e) =>
                                        setEditingPlan({
                                          ...editingPlan,
                                          percentage: e.target.value,
                                        })
                                      }
                                    />
                                  </div>

                                  <div className="mb-3">
                                    <label
                                      htmlFor="editBuyPrice"
                                      className="form-label">
                                      Buy Price
                                    </label>
                                    <input
                                      type="number"
                                      className="form-control"
                                      id="editBuyPrice"
                                      value={editingPlan.buy_price}
                                      onChange={(e) =>
                                        setEditingPlan({
                                          ...editingPlan,
                                          buy_price: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                </form>
                              )}
                            </div>
                            <div className="modal-footer">
                              <button
                                type="button"
                                className="btn btn-secondary"
                                data-bs-dismiss="modal">
                                Cancel
                              </button>
                              <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleUpdatePlan}>
                                Save Changes
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Pagination */}
                      <nav className="mt-3">
                        <ul className="pagination justify-content-center">
                          <li
                            className={`page-item ${
                              page === 1 ? "disabled" : ""
                            }`}>
                            <button
                              className="page-link"
                              onClick={() => setPage(page - 1)}>
                              Previous
                            </button>
                          </li>
                          {Array.from({ length: totalPages }, (_, i) => (
                            <li
                              key={i}
                              className={`page-item ${
                                page === i + 1 ? "active" : ""
                              }`}>
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
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Footer />
            <div className="content-backdrop fade"></div>
          </div>
        </div>
      </div>
      {/* Toast Container */}
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}
