import React, { useEffect, useState } from "react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import Topnav from "../../components/Topnav";
import HistoryLink from "../../components/HistoryLink";
import { getRequest } from "../../services/apiServices";

export default function BillHistory() {
  const [datas, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const [filter, setFilter] = useState(""); // biller
  const [statusFilter, setStatusFilter] = useState(""); // ✅ status

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, statusFilter, datas]);

  useEffect(() => {
    calculatePages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredData]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getRequest(`/histories/bill`);
      const results = res.data?.results?.Data || [];
      setData(results);
      setFilteredData(results);
    } catch (err) {
      console.error("Failed to fetch bill history:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER ================= */
  const applyFilter = () => {
    let tempData = [...datas];

    if (filter) {
      tempData = tempData.filter(
        (d) => String(d.bill?.serviceID) === filter
      );
    }

    if (statusFilter) {
      tempData = tempData.filter(
        (d) => d.status?.toLowerCase() === statusFilter
      );
    }

    setFilteredData(tempData);
    setPage(1);
  };

  /* ================= PAGINATION ================= */
  const calculatePages = () => {
    const total = filteredData.length;
    setTotalPages(Math.ceil(total / pageSize) || 1);
  };

  const paginatedData = filteredData.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <div className="layout-wrapper layout-content-navbar">
      <div className="layout-container">
        <Navbar />

        <div className="layout-page">
          <Topnav />

          <div className="content-wrapper">
            <div className="container-xxl flex-grow-1 container-p-y">
              <h4 className="fw-bold py-3 mb-4">
                <span className="text-muted fw-light">
                  Home / History
                </span>{" "}
                / Bill
              </h4>

              <div className="row">
                <div className="col-lg-12 mb-4 order-0">
                  <HistoryLink />
                  <div className="card">
                    {/* FILTERS */}
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">Filter History</h5>
                      <div className="d-flex gap-2 col-6">
                        <select
                          className="form-select"
                          value={filter}
                          onChange={(e) => setFilter(e.target.value)}
                        >
                          <option value="">All Billers</option>
                          <option value="abuja-electric">AEDC</option>
                          <option value="enugu-electric">EEDC</option>
                          <option value="eko-electric">EKEDC</option>
                          <option value="ibadan-electric">IBEDC</option>
                          <option value="ikeja-electric">IKEDC</option>
                          <option value="jos-electric">JEDC</option>
                          <option value="kano-electric">KEDC</option>
                          <option value="kaduna-electric">KAEDC</option>
                          <option value="portharcourt-electric">PHEDC</option>
                        </select>

                        <select
                          className="form-select"
                          value={statusFilter}
                          onChange={(e) =>
                            setStatusFilter(e.target.value)
                          }
                        >
                          <option value="">All Status</option>
                          <option value="success">Successful</option>
                          <option value="pending">Pending</option>
                          <option value="failed">Failed</option>
                        </select>
                      </div>
                    </div>

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
                      ) : paginatedData.length > 0 ? (
                        <table className="table">
                          <thead>
                            <tr>
                              <th width="50">#</th>
                              <th>Ref</th>
                              <th>User</th>
                              <th>Biller</th>
                              <th>Account No.</th>
                              <th>Phone</th>
                              <th>Amount</th>
                              <th>Status</th>
                              <th>Date</th>
                            </tr>
                          </thead>
                          <tbody className="table-border-bottom-0">
                            {paginatedData.map((data, index) => (
                              <tr key={data.id || index}>
                                <td>
                                  {(page - 1) * pageSize +
                                    index +
                                    1}
                                </td>
                                <td>{data.reference}</td>
                                <td>{data.user?.username}</td>
                                <td>
                                  {data.bill?.serviceID?.toUpperCase()}
                                </td>
                                <td>{data.account_number}</td>
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
                                      data.status === "success"
                                        ? "bg-label-success"
                                        : data.status === "pending"
                                        ? "bg-label-warning"
                                        : "bg-label-danger"
                                    }`}
                                  >
                                    {data.status === "success"
                                      ? "Successful"
                                      : data.status === "pending"
                                      ? "Pending"
                                      : "Failed"}
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
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="text-center p-4">
                          No history found
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <nav className="mt-3">
                <ul className="pagination justify-content-center">
                  <li
                    className={`page-item ${
                      page === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() =>
                        setPage((p) => Math.max(1, p - 1))
                      }
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
                      onClick={() =>
                        setPage((p) =>
                          Math.min(totalPages, p + 1)
                        )
                      }
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            )}

            <Footer />
            <div className="content-backdrop fade"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
