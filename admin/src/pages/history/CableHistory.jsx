import React, { useEffect, useState } from "react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import Topnav from "../../components/Topnav";
import HistoryLink from "../../components/HistoryLink";
import api from "../../services/api";

export default function CableHistory() {
  const [datas, setData] = useState([]);          // data from API
  const [filteredData, setFilteredData] = useState([]); // filtered data shown in table
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [planFilter, setPlanFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    fetchData(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    applyFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planFilter, statusFilter, datas]);

  const fetchData = async (pageNum = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/admin/histories/cable?page=${pageNum}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const apiData = res?.data?.results?.Data;

      setData(apiData?.data || []);
      setFilteredData(apiData?.data || []);
      setLastPage(apiData?.last_page || 1);
    } catch (err) {
      console.error("Failed to fetch cable history:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER ================= */
  const applyFilter = () => {
    let temp = [...datas];

    if (planFilter) {
      temp = temp.filter(
        (d) => d.cable?.name.toLowerCase() === planFilter.toLowerCase()
      );
    }

    if (statusFilter) {
      temp = temp.filter(
        (d) => d.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredData(temp);
  };

  /* ================= PAGINATION BUTTONS ================= */
  const renderPageButtons = () => {
    const maxButtons = 7;
    let start = Math.max(1, page - Math.floor(maxButtons / 2));
    let end = Math.min(lastPage, start + maxButtons - 1);

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

    if (end < lastPage) {
      buttons.push(
        <li key="last" className="page-item">
          <button className="page-link" onClick={() => setPage(lastPage)}>
            {lastPage}
          </button>
        </li>
      );
    }

    return buttons;
  };

  /* ================= RENDER ================= */
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
                Cable
              </h4>

              <HistoryLink />

              <div className="card">
                {/* FILTERS */}
                <div className="card-header d-flex gap-2">
                  <select
                    className="form-select"
                    value={planFilter}
                    onChange={(e) => setPlanFilter(e.target.value)}
                  >
                    <option value="">All Plans</option>
                    <option value="GOTV">GOTV</option>
                    <option value="DSTV">DSTV</option>
                    <option value="Startimes">Startimes</option>
                  </select>

                  <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="success">Successful</option>
                    <option value="failed">Failed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                {/* TABLE */}
                <div className="table-responsive">
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
                          <th>TV Plan</th>
                          <th>IUC No.</th>
                          <th>Phone</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.length === 0 ? (
                          <tr>
                            <td colSpan="9" className="text-center py-4">
                              No records found
                            </td>
                          </tr>
                        ) : (
                          filteredData.map((d, idx) => (
                            <tr key={d.id ?? idx}>
                              <td>{idx + 1}</td>
                              <td>{d.reference}</td>
                              <td>{d.user?.username ?? "—"}</td>
                              <td>{d.cable_plan?.name ?? "—"}</td>
                              <td>{d.iuc_number}</td>
                              <td>{d.phone}</td>
                              <td>
                                {new Intl.NumberFormat("en-NG", {
                                  style: "currency",
                                  currency: "NGN",
                                }).format(d.amount)}
                              </td>
                              <td>
                                <span
                                  className={`badge ${
                                    d.status === "success"
                                      ? "bg-label-success"
                                      : d.status === "pending"
                                      ? "bg-label-warning"
                                      : "bg-label-danger"
                                  }`}
                                >
                                  {d.status === "success"
                                    ? "Successful"
                                    : d.status === "pending"
                                    ? "Pending"
                                    : "Failed"}
                                </span>
                              </td>
                              <td>
                                {new Date(d.created_at).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
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
                  <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => setPage(Math.max(1, page - 1))}
                    >
                      Previous
                    </button>
                  </li>

                  {renderPageButtons()}

                  <li
                    className={`page-item ${page === lastPage ? "disabled" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setPage(Math.min(lastPage, page + 1))}
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
  );
}
