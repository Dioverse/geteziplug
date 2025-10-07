import React, { useEffect, useMemo, useState } from "react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import Topnav from "../../components/Topnav";
import NavLink from "../../components/NavLink";
import api from "../../services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * CablePlan component
 *
 * - Fetches all cable pricing rows once (robust parsing for different API shapes)
 * - Provides client-side filtering by cable_id
 * - Provides client-side pagination (pageSize = 10) but will use API totals if available
 * - Add plan modal and Edit plan modal (with proper form validation)
 * - Delete with confirm toast
*/

export default function CablePlan() {
  const [allData, setAllData] = useState([]); // full dataset from API
  const [loading, setLoading] = useState(true);

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(1);

  // filter
  const [filterCable, setFilterCable] = useState("");

  // form states (used for both add & edit)
  const [cableId, setCableId] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [status, setStatus] = useState(""); // can be "1" or "0" or "active"/"inactive" depending on backend

  // editing
  const [editId, setEditId] = useState(null);

  // ----- Fetching -----
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/pricings/cable");
      let items =
        res?.data?.results?.Data?.data ||
        res?.data?.results?.data ||
        res?.data?.data ||
        res?.data?.results?.Data ||
        res?.data?.results ||
        res?.data;

      if (!Array.isArray(items) && typeof items === "object") {
        if (Array.isArray(items.data)) items = items.data;
        else {
          // try to find array inside
          const foundArray = Object.values(items).find((v) => Array.isArray(v));
          if (foundArray) items = foundArray;
          else items = [];
        }
      }

      setAllData(items || []);

      // compute totalPages:
      const totalFromApi =
        res?.data?.results?.total ??
        res?.data?.results?.Data?.total ??
        res?.data?.results?.Data?.last_page ??
        res?.data?.total ??
        null;

      if (totalFromApi && Number(totalFromApi) > 0) {
        // if API returned total count, compute pages
        setTotalPages(Math.max(1, Math.ceil(Number(totalFromApi) / pageSize)));
      } else {
        // fallback to length of items
        setTotalPages(Math.max(1, Math.ceil((items?.length || 0) / pageSize)));
      }
    } catch (err) {
      console.error("Failed to fetch cable pricings:", err);
      toast.error("Failed to load cable plans");
      setAllData([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // ----- Filtering & Pagination (client-side) -----
  const filteredData = useMemo(() => {
    if (!filterCable) return allData;
    return allData.filter((it) => String(it.cable_id) === String(filterCable));
  }, [allData, filterCable]);

  // recalc totalPages when filter changes (and reset page)
  useEffect(() => {
    setPage(1);
    setTotalPages(Math.max(1, Math.ceil(filteredData.length / pageSize)));
  }, [filteredData]); // eslint-disable-line

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page]);

  // ----- Add Plan -----
  const resetAddForm = () => {
    setCableId("");
    setName("");
    setCode("");
    setBuyPrice("");
    setSellAmount("");
    setStatus("");
  };

  const addNewData = async () => {
    if (!cableId || !name || !code || !buyPrice || !sellAmount) {
      toast.error("Please fill in all fields!");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        cable_id: cableId,
        name,
        code,
        buy_price: buyPrice,
        amount: sellAmount,
        is_active:status, 
      };

      const res = await api.post("/admin/pricings/cable", payload);
      if ([200, 201].includes(res.status)) {
        toast.success("Plan added successfully!");
        // close add modal programmatically if exists
        const closeBtn = document.getElementById("closeAddModalBtn");
        if (closeBtn) closeBtn.click();

        resetAddForm();
        fetchData();
      } else {
        toast.error(res.data?.message || "Failed to add plan");
      }
    } catch (err) {
      console.error("Add plan error:", err);
      if (err.response?.data?.errors) {
        const errs = err.response.data.errors;
        Object.values(errs).flat().forEach((m) => toast.error(m));
      } else {
        toast.error("Failed to add plan");
      }
    } finally {
      setLoading(false);
    }
  };

  // ----- Edit Plan -----
  const openEditModal = (plan) => {
    setEditId(plan.id ?? plan._id ?? null);
    setCableId(String(plan.cable_id ?? ""));
    setName(plan.name ?? "");
    setCode(plan.code ?? "");
    setBuyPrice(plan.buy_price ?? "");
    setSellAmount(plan.amount ?? "");
    // try both variants for active status
    setStatus(plan.is_active !== undefined ? String(plan.is_active) : String(plan.status ?? ""));
    // open modal: caller usually has data-bs-toggle so modal will open
  };

  const updateData = async () => {
    if (!editId) {
      toast.error("No plan selected for update");
      return;
    }
    if (!cableId || !name || !code || !buyPrice || !sellAmount) {
      toast.error("Please fill in all fields!");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        cable_id: String(cableId),
        name,
        code,
        buy_price: buyPrice,
        amount: sellAmount,
        is_active: Number(status),
      };

      const res = await api.put(`/admin/pricings/cable/${editId}`, payload);
      if (res.status && (res.status === 200 || res.status === 201 || res.status === 204)) {
        toast.success("Plan updated successfully!");
        // close edit modal programmatically (button id closeEditModalBtn)
        const closeBtn = document.getElementById("closeEditModalBtn");
        if (closeBtn) closeBtn.click();

        setEditId(null);
        resetAddForm();
        fetchData();
      } else {
        toast.error(res.data?.message || "Failed to update plan");
      }
    } catch (err) {
      console.error("Update plan error:", err);
      if (err.response?.data?.errors) {
        const errs = err.response.data.errors;
        Object.values(errs).flat().forEach((m) => toast.error(m));
      } else {
        toast.error("Failed to update plan");
      }
    } finally {
      setLoading(false);
    }
  };

  // ----- Delete -----
  const confirmDelete = (id) => {
    toast.info(
      <div>
        <p>Are you sure you want to delete this Cable Plan?</p>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => {
              toast.dismiss();
              deleteDataPlans(id);
            }}
          >
            Yes, Delete
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => toast.dismiss()}>
            Cancel
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      }
    );
  };

  const deleteDataPlans = async (id) => {
    if (!id) {
      toast.error("Plan does not exist");
      return;
    }
    setLoading(true);
    try {
      await api.delete(`/admin/pricings/cable/${id}`);
      toast.success("Cable Plan deleted successfully");
      // If deleting the last item on last page, go back a page
      const remaining = filteredData.length - 1;
      const newTotalPages = Math.max(1, Math.ceil((remaining) / pageSize));
      if (page > newTotalPages) setPage(Math.max(1, page - 1));
      fetchData();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Delete unsuccessful");
    } finally {
      setLoading(false);
    }
  };

  // ----- Utility: render pagination buttons (compact) -----
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

  // ----- JSX -----
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
                  <span className="text-muted fw-light">Home / Pricing</span> / Cable
                </h4>

                <div className="row">
                  <div className="col-lg-12 mb-4 order-0">
                    <NavLink />

                    <div className="card">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Filter Pricing Plans</h5>

                        <div className="d-flex align-items-center gap-3">
                          <select
                            className="form-select w-auto"
                            value={filterCable}
                            onChange={(e) => setFilterCable(e.target.value)}
                          >
                            <option value="">All Plans</option>
                            <option value="2">GOTV</option>
                            <option value="1">DSTV</option>
                            <option value="3">StarTimes</option>
                          </select>

                          <button
                            type="button"
                            className="btn btn-primary"
                            data-bs-toggle="modal"
                            data-bs-target="#addModal"
                            onClick={() => {
                              // ensure add form is clean
                              resetAddForm();
                              setEditId(null);
                            }}
                          >
                            Add Plan
                          </button>
                        </div>
                      </div>

                      <div className="d-flex align-items-end row p-3">
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
                                  <th width="50">#</th>
                                  <th>Cable</th>
                                  <th>Code</th>
                                  <th>Buy Price</th>
                                  <th>Selling Price</th>
                                  <th>Status</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody className="table-border-bottom-0">
                                {paginatedData.length === 0 ? (
                                  <tr>
                                    <td colSpan={7} className="text-center py-4">
                                      No plans found.
                                    </td>
                                  </tr>
                                ) : (
                                  paginatedData.map((data, index) => (
                                    <tr key={data.id ?? data._id ?? index}>
                                      <td>{(page - 1) * pageSize + index + 1}</td>
                                      <td>{data.name}</td>
                                      <td>{data.code}</td>
                                      <td>
                                        {new Intl.NumberFormat("en-NG", {
                                          style: "currency",
                                          currency: "NGN",
                                        }).format(Number(data.buy_price || 0))}
                                      </td>
                                      <td>
                                        {new Intl.NumberFormat("en-NG", {
                                          style: "currency",
                                          currency: "NGN",
                                        }).format(Number(data.amount || 0))}
                                      </td>
                                      <td>
                                        <span
                                          className={`badge ${
                                            Number(data.is_active) === 1 ||
                                            String(data.is_active) === "1" ||
                                            String(data.status) === "active"
                                              ? "bg-label-success"
                                              : "bg-label-danger"
                                          }`}
                                        >
                                          {Number(data.is_active) === 1 ||
                                          String(data.is_active) === "1" ||
                                          String(data.status) === "active"
                                            ? "Approved"
                                            : "Disabled"}
                                        </span>
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
                                              data-bs-toggle="modal"
                                              data-bs-target="#editModal"
                                              onClick={() => openEditModal(data)}
                                            >
                                              <i className="bx bx-edit-alt me-1"></i> Edit
                                            </button>
                                            <button
                                              className="dropdown-item"
                                              onClick={() => confirmDelete(data.id)}
                                            >
                                              <i className="bx bx-trash me-1"></i> Delete
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

                          {renderPageButtons()}

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
                    </div>
                  </div>
                </div>

                <Footer />
              </div>
            </div>
          </div>

          {/* ADD MODAL */}
          <div className="modal fade" id="addModal" tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add Plan</h5>
                  <button id="closeAddModalBtn" type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Cable TVs</label>
                    <select className="form-select" value={cableId} onChange={(e) => setCableId(e.target.value)}>
                      <option value="">Select Plan</option>
                      <option value="1">GOTV</option>
                      <option value="2">DSTV</option>
                      <option value="3">StarTimes</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Plan Name</label>
                    <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Plan Code</label>
                    <input className="form-control" value={code} onChange={(e) => setCode(e.target.value)} />
                  </div>

                  <div className="row g-2">
                    <div className="col">
                      <label className="form-label">Buy Price</label>
                      <input type="number" className="form-control" min={0} value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} />
                    </div>
                    <div className="col">
                      <label className="form-label">Selling Price</label>
                      <input type="number" className="form-control" min={0} value={sellAmount} onChange={(e) => setSellAmount(e.target.value)} />
                    </div>
                    <div className="col">
                      <label className="form-label">Status</label>
                      <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="">Choose Status</option>
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
                  <button type="button" className="btn btn-primary" onClick={addNewData}>
                    {loading ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* EDIT MODAL */}
          <div className="modal fade" id="editModal" tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Plan</h5>
                  <button id="closeEditModalBtn" type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Plan Name</label>
                    <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Plan Code</label>
                    <input className="form-control" value={code} onChange={(e) => setCode(e.target.value)} />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Buy Price</label>
                    <input type="number" className="form-control" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Selling Price</label>
                    <input type="number" className="form-control" value={sellAmount} onChange={(e) => setSellAmount(e.target.value)} />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="">Choose Status</option>
                      <option value="1">Approved</option>
                      <option value="0">Disable</option>
                    </select>
                  </div>
                </div>

                <div className="modal-footer">
                  <button id="closeEditModalCancel" type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
                  <button type="button" className="btn btn-primary" onClick={updateData}>
                    {loading ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <ToastContainer position="top-center" autoClose={3000} />
        </div>
      </div>
    </>
  );
}
