import React, { useEffect, useState } from "react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import Topnav from "../../components/Topnav";
import HistoryLink from "../../components/HistoryLink";
import { getRequest } from "../../services/apiServices";

export default function CableHistory() {
  const [datas, setData] = useState([]);          // full data from API
  const [filtered, setFiltered] = useState([]);   // filtered data for table
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  // re-apply filter whenever filter or datas change
  useEffect(() => {
    applyFilter();
  }, [filter, datas]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getRequest(`/histories/cable`);
      const items = res.data?.results?.Data?.data || [];
      setData(items);
    } catch (err) {
      console.error("Failed to fetch plan:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let result = datas;
    if (filter) {
      result = datas.filter((d) =>
        d?.cable_plan?.name?.toLowerCase().includes(filter.toLowerCase())
      );
    }
    setFiltered(result);

    // recalc pages
    setTotalPages(Math.max(1, Math.ceil(result.length / pageSize)));
    setPage(1); // reset to page 1 after filter
  };

  const paginatedData = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

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
                  <span className="text-muted fw-light">Home /History</span> /
                  Cable
                </h4>

                <div className="row">
                  <div className="col-lg-12 mb-4 order-0">
                    <HistoryLink />
                    <div className="card">
                      <div className="card-header d-flex justify-content-between">
                        <h5 className="mb-0">Filter History</h5>
                        <div className="card-header-actions col-4">
                          <select
                            className="form-select"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                          >
                            <option value="">All</option>
                            <option value="GOTV">GOTV</option>
                            <option value="DSTV">DSTV</option>
                            <option value="Startimes">Startimes</option>
                          </select>
                        </div>
                      </div>
                      <div className="d-flex align-items-end card">
                        <div className="container">
                          <div className="table-responsive text-nowrap">
                            {loading ? (
                              <div className="text-center p-4">
                                <div
                                  className="spinner-border text-primary"
                                  role="status"
                                  style={{ width: "3rem", height: "3rem" }}
                                >
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
                                    <th>TV Plan</th>
                                    <th>IUC No.</th>
                                    <th>Phone</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                  </tr>
                                </thead>
                                <tbody className="table-border-bottom-0">
                                  {paginatedData.length === 0 ? (
                                    <tr>
                                      <td
                                        colSpan={9}
                                        className="text-center py-4"
                                      >
                                        No records found.
                                      </td>
                                    </tr>
                                  ) : (
                                    paginatedData.map((data, index) => (
                                      <tr key={index}>
                                        <td>
                                          {(page - 1) * pageSize + index + 1}
                                        </td>
                                        <td>{data.reference}</td>
                                        <td>{data.user.username}</td>
                                        <td>{data.cable_plan.name}</td>
                                        <td>{data.iuc_number}</td>
                                        <td>{data.phone}</td>
                                        <td>
                                          {new Intl.NumberFormat("en-NG", {
                                            style: "currency",
                                            currency: "NGN",
                                          }).format(data.amount)}
                                        </td>
                                        <td>
                                          <span
                                            className={`badge ${
                                              data.status === "approved"
                                                ? "bg-label-success"
                                                : data.status === "pending"
                                                ? "bg-label-warning"
                                                : "bg-label-danger"
                                            }`}
                                          >
                                            {data.status === "approved"
                                              ? "Approved"
                                              : data.status === "pending"
                                              ? "Pending"
                                              : "Rejected"}
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
              {/* Footer */}
              <Footer />
              <div className="content-backdrop fade"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
