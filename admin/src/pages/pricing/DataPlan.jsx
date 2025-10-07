import React, { useEffect, useState } from "react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import Topnav from "../../components/Topnav";
import NavLink from "../../components/NavLink";
import { getRequest } from "../../services/apiServices";
import api from "../../services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export default function DataPlan() {
  const [datas, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredData, setFilteredData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const [filter, setFilter] = useState("");

  const [editId, setEditId] = useState(null);

  // new data states
  const [networkId, setNetworkId] = useState("");
  const [planName, setPlanName] = useState("");
  const [smePlanId, setSMEPlanId] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [size, setSize] = useState("");
  const [sizeMb, setSizeMb] = useState("");
  const [validity, setValidity] = useState("");
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/admin/pricings/data", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // const items =
      //   res?.data?.results?.Data?.data ||
      //   res?.data?.results?.data ||
      //   res?.data?.data ||
      //   res?.data?.results ||
      //   [];

      const items =
        res?.data?.results?.data?.data ||
        res?.data?.results?.data ||
        res?.data?.data ||
        res?.data?.results ||
        [];

      // setDatas(Array.isArray(items) ? items : []);
      setData(Array.isArray(items) ? items : []);
      setFilteredData(Array.isArray(items) ? items : []); // ✅ default
    } catch (err) {
      console.error("Failed to fetch data plans:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFilter();
  }, [filter, datas]);

  useEffect(() => {
    calculatePages();
  }, [filteredData]);

  useEffect(() => {
    fetchPlans();
  }, []);

  const addNewDataPlan = async () => {
    setLoading(true);
    console.log(networkId);

    try {
      const response = await api.post("/admin/pricings/data", {
        network_id: networkId,
        plan_name: planName,
        smeplug_plan_id: smePlanId,
        buy_price: buyPrice,
        price: sellPrice,
        size: size,
        size_in_mb: String(sizeMb),
        validity: validity.toLowerCase(),
      });

      //  Handle success
      if (response.status === 200 || response.status === 201) {
        toast.success("Plan added successfully!");
        console.log("Plan added:", response.data);

        // Reset fields if needed
        setNetworkId("");
        setPlanName("");
        setSMEPlanId("");
        setBuyPrice("");
        setSellPrice("");
        setSize("");
        setSizeMb("");
        setValidity("");
      } else {
        // Non-success but no error thrown (rare)
        toast.error(
          response.data?.message || "Something went wrong. Please try again."
        );
        setLoading(false);
      }
    } catch (error) {
      console.error("Failed to add plan:", error);

      // Axios error handling
      if (error.response) {
        // Server responded with error code
        toast.error(
          error.response.data?.message ||
            `Server error: ${error.response.status} ${error.response.statusText}`
        );
      } else if (error.request) {
        // No response (network error, CORS, etc.)
        toast.error("No response from server. Please check your connection.");
      } else {
        // Something else went wrong
        "Error: " + error.message;
      }
    } finally {
      setLoading(false);
    }
  };

  // ----- Edit Plan -----
  // Open Edit Modal
  const openEditModal = (plan) => {
    setEditId(plan.id ?? null);
    setNetworkId(String(plan.network_id ?? ""));
    setPlanName(plan.plan_name ?? "");
    setSMEPlanId(plan.smeplug_plan_id ?? "");
    setBuyPrice(plan.buy_price ?? "");
    setSellPrice(plan.price ?? "");
    setSize(plan.size ?? "");
    setSizeMb(plan.size_in_mb ?? "");
    setValidity(plan.validity ?? "");
  };

  // Update Data Plan
  const updateData = async () => {
    if (!editId) {
      toast.error("No plan selected for update");
      return;
    }
    if (
      !networkId ||
      !planName ||
      !smePlanId ||
      !buyPrice ||
      !sellPrice ||
      !size ||
      !sizeMb ||
      !validity
    ) {
      toast.error("Please fill in all fields!");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        network_id: networkId,
        plan_name: planName,
        smeplug_plan_id: smePlanId,
        buy_price: buyPrice,
        price: sellPrice,
        size,
        // size_in_mb: (sizeMb * 1024 * 1024).toString(),
        size_in_mb: String(sizeMb),
        validity: validity.toLowerCase(),
      };

      const res = await api.put(`/admin/pricings/data/${editId}`, payload);
      if ([200, 201, 204].includes(res.status)) {
        toast.success("Plan updated successfully!");
        setEditId(null);
        // fetchData(page);
        // fetchPlans(page);
        fetchPlans();

        // close modal programmatically
        document.getElementById("closeEditModalBtn")?.click();
      } else {
        toast.error(res.data?.message || "Failed to update plan");
      }
    } catch (err) {
      console.error("Update plan error:", err);
      toast.error("Failed to update plan");
    } finally {
      setLoading(false);
    }
  };

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
      toast.error("plan does not exist");
      return;
    }
    setLoading(true);
    try {
      const response = await api.delete(`/admin/pricings/data/${id}`);
      toast.success("Data Plan deleted successfully");
      console.log(response);
      // fetchData(page);
      // fetchPlans(page);
      fetchPlans();

    } catch (error) {
      toast.error("Delete Unsuccessful");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const applyFilter = () => {
    if (!filter) {
      setFilteredData(datas);
    } else {
      setFilteredData(
        datas.filter(
          (d) => d.network?.name?.toUpperCase() === filter.toUpperCase()
        )
      );
    }
    setPage(1);
  };



  const calculatePages = () => {
    setTotalPages(
      Math.max(1, Math.ceil((filteredData.length || 0) / pageSize))
    );
  };

  const renderPageButtons = () => {
    const maxButtons = 7;
    let start = Math.max(1, page - Math.floor(maxButtons / 2));
    let end = Math.min(totalPages, start + maxButtons - 1);
    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }

    const buttons = [];
    if (start > 1) {
      buttons.push(
        <li key="first" className="page-item">
          <button className="page-link" onClick={() => setPage(1)}>
            1
          </button>
        </li>
      );
      if (start > 2) {
        buttons.push(
          <li key="start-ellipsis" className="page-item disabled">
            <span className="page-link">…</span>
          </li>
        );
      }
    }

    for (let p = start; p <= end; p++) {
      buttons.push(
        <li key={p} className={`page-item ${page === p ? "active" : ""}`}>
          <button className="page-link" onClick={() => setPage(p)}>
            {p}
          </button>
        </li>
      );
    }

    if (end < totalPages) {
      if (end < totalPages - 1) {
        buttons.push(
          <li key="end-ellipsis" className="page-item disabled">
            <span className="page-link">…</span>
          </li>
        );
      }
      buttons.push(
        <li key="last" className="page-item">
          <button className="page-link" onClick={() => setPage(totalPages)}>
            {totalPages}
          </button>
        </li>
      );
    }

    return buttons;
  };

  // ✅ pagination slice
  const startIndex = (page - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

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
                  <span class="text-muted fw-light">Home /Pricing</span> / Data
                </h4>

                <div className="row">
                  <div className="col-lg-12 mb-4 order-0">
                    <NavLink />
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Filter Pricing Plans</h5>
                        <div className="card-header-actions">
                          <div className="row">
                            <div className="col-md-4">
                              <form action="">
                                <select
                                  className="form-select"
                                  value={filter}
                                  onChange={(e) => setFilter(e.target.value)}>
                                  <option value="">All</option>
                                  <option value="MTN">MTN</option>
                                  <option value="AIRTEL">AIRTEL</option>
                                  <option value="GLO">GLO</option>
                                  <option value="9Mobile">9MOBILE</option>
                                </select>
                              </form>
                            </div>
                            <div className="col-md-8">
                              {/* Float this to the right */}
                              <div className="float-end">
                                <button
                                  type="button"
                                  class="btn btn-primary"
                                  data-bs-toggle="modal"
                                  data-bs-target="#basicModal">
                                  Add Plan
                                </button>
                              </div>
                              <div
                                className="modal fade"
                                id="basicModal"
                                tabindex="-1"
                                aria-hidden="true">
                                <div className="modal-dialog" role="document">
                                  <div className="modal-content">
                                    <div className="modal-header">
                                      <h5
                                        className="modal-title"
                                        id="exampleModalLabel1">
                                        Add Plan
                                      </h5>
                                      <button
                                        type="button"
                                        className="btn-close"
                                        data-bs-dismiss="modal"
                                        aria-label="Close"></button>
                                    </div>
                                    <div className="modal-body">
                                      <div className="row">
                                        <div className="col mb-3">
                                          <label
                                            for="nameBasic"
                                            className="form-label">
                                            Name
                                          </label>
                                          <select
                                            className="form-select"
                                            value={networkId}
                                            onChange={(e) =>
                                              setNetworkId(e.target.value)
                                            }>
                                            <option value="">
                                              -- Select Network --
                                            </option>
                                            <option value="1">MTN</option>
                                            <option value="2">AIRTEL</option>
                                            <option value="3">GLO</option>
                                            <option value="4">9MOBILE</option>
                                          </select>
                                        </div>
                                      </div>
                                      <div className="row g-2">
                                        <div className="col mb-0">
                                          <label
                                            for="planName"
                                            className="form-label">
                                            Plan Name
                                          </label>
                                          <input
                                            type="text"
                                            id="planName"
                                            className="form-control"
                                            value={planName}
                                            onChange={(e) =>
                                              setPlanName(e.target.value)
                                            }
                                          />
                                        </div>
                                        <div className="col mb-0">
                                          <label
                                            for="planId"
                                            className="form-label">
                                            Plan ID
                                          </label>
                                          <input
                                            type="text"
                                            id="planId"
                                            className="form-control"
                                            value={smePlanId}
                                            onChange={(e) =>
                                              setSMEPlanId(e.target.value)
                                            }
                                          />
                                        </div>
                                      </div>

                                      <div className="row g-2 mt-2">
                                        <div className="col mb-0">
                                          <label
                                            for="size"
                                            className="form-label">
                                            Size
                                          </label>
                                          <input
                                            type="text"
                                            id="size"
                                            className="form-control"
                                            placeholder="GB"
                                            value={size}
                                            onChange={(e) =>
                                              setSize(e.target.value)
                                            }
                                          />
                                        </div>
                                        <div className="col mb-0">
                                          <label
                                            for="size"
                                            className="form-label">
                                            Size in MB
                                          </label>
                                          <input
                                            type="text"
                                            id="size"
                                            className="form-control"
                                            placeholder="MB"
                                            value={sizeMb}
                                            onChange={(e) =>
                                              setSizeMb(e.target.value)
                                            }
                                          />
                                        </div>
                                      </div>

                                      <div className="row g-2 mt-2">
                                        <div className="col mb-0">
                                          <label
                                            for="buyPrice"
                                            className="form-label">
                                            Buy Price
                                          </label>
                                          <input
                                            type="number"
                                            id="buyPrice"
                                            className="form-control"
                                            min={1}
                                            max={5}
                                            value={buyPrice}
                                            onChange={(e) =>
                                              setBuyPrice(e.target.value)
                                            }
                                          />
                                        </div>
                                        <div className="col mb-0">
                                          <label
                                            for="sellingPrice"
                                            className="form-label">
                                            Selling Price
                                          </label>
                                          <input
                                            type="text"
                                            id="sellingPrice"
                                            className="form-control"
                                            value={sellPrice}
                                            onChange={(e) =>
                                              setSellPrice(e.target.value)
                                            }
                                          />
                                        </div>
                                        <div className="col mb-0">
                                          <label
                                            for="validity"
                                            className="form-label">
                                            Validity
                                          </label>
                                          <select
                                            className="form-select"
                                            value={validity}
                                            onChange={(e) =>
                                              setValidity(e.target.value)
                                            }>
                                            <option value="">
                                              -- Select Validity --
                                            </option>
                                            <option value="7 Days">
                                              7 Days
                                            </option>
                                            <option value="30 Days">
                                              30 Days
                                            </option>
                                            <option value="90 Days">
                                              90 Days
                                            </option>
                                            <option value="180 Days">
                                              180 Days
                                            </option>
                                          </select>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="modal-footer">
                                      <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        data-bs-dismiss="modal"
                                        data-bs-toggle="modal"
                                        data-bs-target="#basicModal">
                                        Close
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={addNewDataPlan}>
                                        Save changes
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Edit Plan Modal */}
                      <div
                        className="modal fade"
                        id="editModal"
                        tabIndex="-1"
                        aria-hidden="true">
                        <div className="modal-dialog" role="document">
                          <div className="modal-content">
                            <div className="modal-header">
                              <h5 className="modal-title">Edit Plan</h5>
                              <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                              <div className="row">
                                <div className="col mb-3">
                                  <label className="form-label">Network</label>
                                  <select
                                    className="form-select"
                                    value={networkId}
                                    onChange={(e) =>
                                      setNetworkId(e.target.value)
                                    }>
                                    <option value="">
                                      -- Select Network --
                                    </option>
                                    <option value="1">MTN</option>
                                    <option value="2">AIRTEL</option>
                                    <option value="3">9MOBILE</option>
                                    <option value="4">GLO</option>
                                    {/* <option value="3">AIRTEL</option> */}
                                    {/* <option value="4">9MOBILE</option> */}
                                  </select>
                                </div>
                              </div>

                              <div className="row g-2">
                                <div className="col mb-0">
                                  <label className="form-label">
                                    Plan Name
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={planName}
                                    onChange={(e) =>
                                      setPlanName(e.target.value)
                                    }
                                  />
                                </div>
                                <div className="col mb-0">
                                  <label className="form-label">Plan ID</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={smePlanId}
                                    onChange={(e) =>
                                      setSMEPlanId(e.target.value)
                                    }
                                  />
                                </div>
                              </div>

                              <div className="row g-2 mt-2">
                                <div className="col mb-0">
                                  <label className="form-label">Size</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="GB"
                                    value={size}
                                    onChange={(e) => setSize(e.target.value)}
                                  />
                                </div>
                                <div className="col mb-0">
                                  <label className="form-label">
                                    Size in MB
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="MB"
                                    value={sizeMb}
                                    onChange={(e) => setSizeMb(e.target.value)}
                                  />
                                </div>
                              </div>

                              <div className="row g-2 mt-2">
                                <div className="col mb-0">
                                  <label className="form-label">
                                    Buy Price
                                  </label>
                                  <input
                                    type="number"
                                    className="form-control"
                                    value={buyPrice}
                                    onChange={(e) =>
                                      setBuyPrice(e.target.value)
                                    }
                                  />
                                </div>
                                <div className="col mb-0">
                                  <label className="form-label">
                                    Selling Price
                                  </label>
                                  <input
                                    type="number"
                                    className="form-control"
                                    value={sellPrice}
                                    onChange={(e) =>
                                      setSellPrice(e.target.value)
                                    }
                                  />
                                </div>
                                <div className="col mb-0">
                                  <label className="form-label">Validity</label>
                                  <select
                                    className="form-select"
                                    value={validity}
                                    onChange={(e) =>
                                      setValidity(e.target.value)
                                    }>
                                    <option value="">
                                      -- Select Validity --
                                    </option>
                                    <option value="7 Days">7 Days</option>
                                    <option value="30 Days">30 Days</option>
                                    <option value="90 Days">90 Days</option>
                                    <option value="180 Days">180 Days</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                            <div className="modal-footer">
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                data-bs-dismiss="modal"
                                id="closeEditModalBtn">
                                Close
                              </button>
                              <button
                                type="button"
                                className="btn btn-primary"
                                onClick={updateData}>
                                Update Plan
                              </button>
                            </div>
                          </div>
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
                          ) : filteredData.length === 0 ? (
                            <div className="p-4 text-center">
                              No Data Plans Found
                            </div>
                          ) : (
                            <table className="table">
                              <thead>
                                <tr>
                                  <th width="50">#</th>
                                  <th>Network</th>
                                  <th>Plan Name</th>
                                  <th>Price</th>
                                  <th>Allow Resell</th>
                                  <th>Status</th>
                                  <th>Date</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody className="table-border-bottom-0">
                                {paginatedData.length === 0 ? (
                                  // ✅ fallback row inside the table
                                  <tr>
                                    <td colSpan="8" className="text-center p-4">
                                      No Data Plans Found
                                    </td>
                                  </tr>
                                ) : (
                                  paginatedData.map((data, index) => (
                                    <tr key={index}>
                                      <td>
                                        {(page - 1) * pageSize + index + 1}
                                      </td>
                                      <td>
                                        {data.network?.name || data.network_id}
                                      </td>
                                      <td>
                                        {data.plan_name} - {data.size}
                                      </td>
                                      <td>
                                        {new Intl.NumberFormat("en-NG", {
                                          style: "currency",
                                          currency: "NGN",
                                        }).format(data.buy_price)}
                                      </td>
                                      <td>
                                        {new Intl.NumberFormat("en-NG", {
                                          style: "currency",
                                          currency: "NGN",
                                        }).format(data.price)}
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
                                          {data.status === "approved"
                                            ? "Approved"
                                            : data.status === "pending"
                                            ? "Pending"
                                            : "Rejected"}
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
                                              data-bs-toggle="modal"
                                              data-bs-target="#editModal"
                                              onClick={() =>
                                                openEditModal(data)
                                              }>
                                              <i className="bx bx-edit-alt me-1"></i>{" "}
                                              Edit
                                            </button>
                                            <button
                                              className="dropdown-item"
                                              onClick={() =>
                                                confirmDelete(data.id)
                                              }>
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
                      onClick={() => setPage((p) => Math.max(1, p - 1))}>
                      Previous
                    </button>
                  </li>
                  {renderPageButtons()}
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

              {/* Footer */}
              <Footer />
              {/* / Footer */}

              <div className="content-backdrop fade"></div>
            </div>
            {/* Content wrapper */}
          </div>
          {/* / Layout page */}
        </div>
        <ToastContainer position="top-center" autoClose={3000} />
      </div>
    </>
  );
}
