import React, { useEffect, useState } from "react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import Topnav from "../../components/Topnav";
import HistoryLink from "../../components/HistoryLink";
import { getRequest } from "../../services/apiServices";

export default function CryptoHistory() {
  const [allData, setAllData] = useState([]); // store all history
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState(""); // "buy" | "sell" | ""
  const pageSize = 10;

  useEffect(() => {
    fetchData();
  }, []);

  
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getRequest(`/histories/crypto`);
      const records = res.data?.results?.Data?.data || [];
      setAllData(records);
    } catch (err) {
      console.error("Failed to fetch crypto history:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on type
  const filteredData = allData.filter((d) =>
    filterType ? d.type === filterType : true
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const startIndex = (page - 1) * pageSize;
  const currentPageData = filteredData.slice(startIndex, startIndex + pageSize);

  // Handle filter change (reset page to 1)
  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
    setPage(1);
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
              <div className="container-xxl flex-grow-1 container-p-y">
                <h4 className="fw-bold py-3 mb-4">
                  <span className="text-muted fw-light">Home /History</span> /
                  Crypto
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
                            value={filterType}
                            onChange={handleFilterChange}>
                            <option value="">All</option>
                            <option value="sell">Sell</option>
                            <option value="buy">Buy</option>
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
                                  <th>Chain</th>
                                  <th>Type</th>
                                  <th>Wallet Add.</th>
                                  <th>Quantity</th>
                                  <th>Amount</th>
                                  <th>Naira</th>
                                  <th>Status</th>
                                  <th>Date</th>
                                </tr>
                              </thead>
                              <tbody className="table-border-bottom-0">
                                {currentPageData.length === 0 ? (
                                  <tr>
                                    <td
                                      colSpan="11"
                                      className="text-center py-4">
                                      No records found for this filter
                                    </td>
                                  </tr>
                                ) : (
                                  currentPageData.map((data, index) => (
                                    <tr key={index}>
                                      <td>{startIndex + index + 1}</td>
                                      <td>{data.transaction_hash}</td>
                                      <td>{data.user.username}</td>
                                      <td>{data.crypto.name}</td>
                                      <td>{data.type}</td>
                                      <td>{data.wallet_address}</td>
                                      <td>{data.amount_crypto}</td>
                                      <td>
                                        {new Intl.NumberFormat("en-US", {
                                          style: "currency",
                                          currency: "USD",
                                        }).format(data.amount)}
                                      </td>
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
              <div className="content-backdrop fade"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
