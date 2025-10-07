import React, { useEffect, useState } from "react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import Topnav from "../../components/Topnav";
import HistoryLink from "../../components/HistoryLink";
import { getRequest } from "../../services/apiServices";

export default function DataHistory() {
  const [datas, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState(""); // filter state
  const pageSize = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const LOGO_CDN = {
    MTN: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/MTN_2022_logo.svg/250px-MTN_2022_logo.svg.png",
    AIRTEL: "https://s3-ap-southeast-1.amazonaws.com/bsy/iportal/images/airtel-logo-red-text-horizontal.jpg",
    GLO: "https://upload.wikimedia.org/wikipedia/commons/8/86/Glo_button.png",
    "9MOBILE": "https://9mobile.com.ng/_next/static/media/logos.1d851e63.png",
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getRequest(`/histories/data`);
      const allData = res.data?.results?.Data?.data || [];
      setData(allData);
      setTotalPages(Math.ceil(allData.length / pageSize));
    } catch (err) {
      console.error("Failed to fetch plan:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered records
  const filteredData = datas.filter((d) => {
    if (!filter) return true;
    return d.network?.name?.toLowerCase().includes(filter.toLowerCase());
  });

  // Paginated records after filter
  const startIndex = (page - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);
  const currentTotalPages = Math.ceil(filteredData.length / pageSize);

  const normalizeNetworkKey = (network) => {
    if (!network) return null;
    const s =
      typeof network === "string" ? network : network.name || network.code || "";
    const low = String(s).toLowerCase();
    if (low.includes("mtn")) return "MTN";
    if (low.includes("airtel")) return "AIRTEL";
    if (low.includes("glo")) return "GLO";
    if (low.includes("9") || low.includes("9mobile") || low.includes("t2"))
      return "9MOBILE";
    return null;
  };

    const getNetworkName = (network) => {
    if (!network) return "—";
    if (typeof network === "string") return network;
    return network.name || network.code || "—";
  };

  const getNetworkLogo = (network) => {
    if (!network) return null;
    if (
      typeof network === "object" &&
      (typeof network.logo === "string" || typeof network.logo?.url === "string")
    ) {
      return typeof network.logo === "string" ? network.logo : network.logo.url;
    }
    const key = normalizeNetworkKey(network);
    return key ? LOGO_CDN[key] : null;
  };

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
                  <span className="text-muted fw-light">Home /History</span> / Data
                </h4>

                <div className="row">
                  <div className="col-lg-12 mb-4 order-0">
                    <HistoryLink />
                    <div className="card">
                      <div className="card-header d-flex justify-content-between">
                        <h5 className="mb-0">Filter</h5>
                        <div className="card-header-actions col-4">
                          <select
                            className="form-select"
                            value={filter}
                            onChange={(e) => {
                              setFilter(e.target.value);
                              setPage(1); // reset page when filter changes
                            }}
                          >
                            <option value="">All</option>
                            <option value="MTN">MTN</option>
                            <option value="AIRTEL">Airtel</option>
                            <option value="GLO">Glo</option>
                            <option value="9MOBILE">9mobile</option>
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
                                  <th>Network</th>
                                  <th>Data</th>
                                  <th>Phone</th>
                                  <th>Amount</th>
                                  <th>Status</th>
                                  <th>Date</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody className="table-border-bottom-0">
                                {paginatedData.length > 0 ? (
                                  paginatedData.map((data, index) => {
                                    const networkObj = data.network;
                                    const networkName = getNetworkName(
                                      networkObj
                                    );
                                    const logoUrl = getNetworkLogo(networkObj);
                                    return (
                                    <tr key={index}>
                                      <td>{startIndex + index + 1}</td>
                                      <td>{data.reference}</td>
                                      <td>{data.user?.username}</td>
                                      <td>
                                          <div
                                            style={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 8,
                                            }}
                                          >
                                            {logoUrl ? (
                                              <img
                                                src={logoUrl}
                                                alt={networkName}
                                                style={{
                                                  height: 24,
                                                  objectFit: "contain",
                                                }}
                                              />
                                            ) : null}
                                            <span>{networkName}</span>
                                          </div>
                                        </td>
                                      <td>{data.data_plan?.name}</td>
                                      <td>{data.phone}</td>
                                      <td>₦{data.price}</td>
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
                                      <td>{data.created_at.slice(0, 10)}</td>
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
                                            <button className="dropdown-item">
                                              <i className="bx bx-edit-alt me-1"></i>{" "}
                                              Edit
                                            </button>
                                            <button className="dropdown-item">
                                              <i className="bx bx-trash me-1"></i>{" "}
                                              Delete
                                            </button>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                    );
                                  })
                                ) : (
                                  <tr>
                                    <td colSpan="10" className="text-center">
                                      No records found
                                    </td>
                                  </tr>
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
                      onClick={() => setPage(page - 1)}
                    >
                      Previous
                    </button>
                  </li>
                  {Array.from({ length: currentTotalPages }, (_, i) => (
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
                      page === currentTotalPages ? "disabled" : ""
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

              <Footer />
              <div className="content-backdrop fade"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
