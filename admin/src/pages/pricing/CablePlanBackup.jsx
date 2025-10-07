import React, { useEffect, useState, useMemo } from "react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import Topnav from "../../components/Topnav";
import NavLink from "../../components/NavLink";
import api from "../../services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CablePlan() {
  const [allData, setAllData] = useState([]); // raw from backend
  const [loading, setLoading] = useState(true);

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // filter state
  const [filterCable, setFilterCable] = useState("");

  // form states
  const [cableId, setCableId] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [sellAmount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [editId, setEditId] = useState(null);

  // Fetch all cable plans once
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/pricings/cable", {
        headers: {
          Authorization: `Bearer 79|PuUjRfohikVMETW5OOn8nSIxnfT4Yu88ot417Abg5413ec31`,
        },
      });
      setAllData(res.data?.results?.Data || []);
    } catch (err) {
      console.error("Failed to fetch plan:", err);
    } finally {
      setLoading(false);
    }
  };

  // filter + paginate client side
  const filteredData = useMemo(() => {
    return allData.filter((item) =>
      filterCable ? String(item.cable_id) === filterCable : true
    );
  }, [allData, filterCable]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page]);

  // reset to page 1 when filter changes
  useEffect(() => {
    setPage(1);
  }, [filterCable]);

  const openEditModal = (plan) => {
    setEditId(plan.id);
    setCableId(String(plan.cable_id || ""));
    setName(plan.name || "");
    setCode(plan.code || "");
    setBuyPrice(plan.buy_price || "");
    setAmount(plan.amount || "");
    setStatus(plan.status || "");
  };

  const updateData = async () => {
    if (!name || !code || !buyPrice || !sellAmount || !cableId) {
      toast.error("Please fill in all fields!");
      return;
    }

    try {
      setLoading(true);
      const response = await api.put(`/admin/pricings/cable/${editId}`, {
        cable_id: String(cableId),
        name,
        code,
        buy_price: buyPrice,
        amount: sellAmount,
        is_active: status,
      });

      if (response.status) {
        document.getElementById("closeModal").click();
        setEditId(null);
        toast.success("Plan updated successfully!");
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to update plan");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addNewData = async () => {
    if (!cableId || !name || !code || !buyPrice || !sellAmount) {
      toast.error("Please fill in all fields!");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/admin/pricings/cable", {
        cable_id: cableId,
        name,
        code,
        buy_price: buyPrice,
        amount: sellAmount,
        status,
      });

      if ([200, 201].includes(response.status)) {
        toast.success("Plan added successfully!");
        setCableId("");
        setName("");
        setCode("");
        setBuyPrice("");
        setAmount("");
        setStatus("");
        fetchData();
      }
    } catch (error) {
      toast.error("Add Plan failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id) => {
    toast.info(
      <div>
        <p>Are you sure you want to delete this Cable Plan?</p>
        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => {
              toast.dismiss();
              deleteDataPlans(id);
            }}
          >
            Yes, Delete
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => toast.dismiss()}
          >
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
    setLoading(true);
    try {
      await api.delete(`/admin/pricings/cable/${id}`);
      toast.success("Cable Plan deleted successfully");
      fetchData();
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
                <span className="text-muted fw-light">Home /Pricing</span> /Cable
              </h4>

              <div className="card">
                <div className="card-header d-flex justify-content-between">
                  <h5 className="mb-0">Filter Pricing Plans</h5>
                  <select
                    className="form-select w-auto"
                    value={filterCable}
                    onChange={(e) => setFilterCable(e.target.value)}
                  >
                    <option value="">All Plans</option>
                    <option value="1">GOTV</option>
                    <option value="2">DSTV</option>
                    <option value="3">StarTimes</option>
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
                          <th>Cable</th>
                          <th>Code</th>
                          <th>Buy Price</th>
                          <th>Selling Price</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedData.map((data, index) => (
                          <tr key={data.id}>
                            <td>{(page - 1) * pageSize + index + 1}</td>
                            <td>{data.name}</td>
                            <td>{data.code}</td>
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
                              }).format(data.amount)}
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  data.is_active === 1
                                    ? "bg-label-success"
                                    : "bg-label-danger"
                                }`}
                              >
                                {data.is_active === 1
                                  ? "Approved"
                                  : "Disabled"}
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-primary me-2"
                                data-bs-toggle="modal"
                                data-bs-target="#editModal"
                                onClick={() => openEditModal(data)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => confirmDelete(data.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Pagination */}
                <nav className="mt-3">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setPage(page - 1)}
                      >
                        Previous
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => (
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
                        page === totalPages ? "disabled" : ""
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
            </div>
            <Footer />
          </div>
        </div>
        <ToastContainer position="top-center" autoClose={3000} />
      </div>
    </div>
  );
}
