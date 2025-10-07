import React, { useEffect, useState } from "react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import Topnav from "../../components/Topnav";
import HistoryLink from "../../components/HistoryLink";
import api from "../../services/api";

export default function AirtimeHistory() {
  const [datas, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const [filter, setFilter] = useState("");

  const LOGO_CDN = {
    MTN: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/MTN_2022_logo.svg/250px-MTN_2022_logo.svg.png",
    AIRTEL: "https://s3-ap-southeast-1.amazonaws.com/bsy/iportal/images/airtel-logo-red-text-horizontal.jpg",
    GLO: "https://upload.wikimedia.org/wikipedia/commons/8/86/Glo_button.png",
    "9MOBILE": "https://9mobile.com.ng/_next/static/media/logos.1d851e63.png",
  };

  useEffect(() => {
    fetchData(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    applyFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, datas]);

  useEffect(() => {
    calculatePages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredData]);

  const fetchData = async (pageNum = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(
        `/admin/histories/airtime?page=${pageNum}&limit=${pageSize}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const items =
        res?.data?.results?.Data?.data ||
        res?.data?.results?.data ||
        res?.data?.data ||
        res?.data?.results ||
        [];

      setData(Array.isArray(items) ? items : []);
      setFilteredData(Array.isArray(items) ? items : []); // default

      const totalItems =
        res?.data?.results?.Data?.total ??
        res?.data?.total ??
        res?.data?.count ??
        res?.data?.results?.Data?.count ??
        0;

      const pagesFromApi =
        res?.data?.results?.Data?.pages ??
        res?.data?.results?.Data?.totalPages;

      if (
        pagesFromApi &&
        Number.isInteger(pagesFromApi) &&
        pagesFromApi > 0
      ) {
        setTotalPages(pagesFromApi);
      } else {
        setTotalPages(
          Math.max(1, Math.ceil((Number(totalItems) || items.length) / pageSize))
        );
      }
    } catch (err) {
      console.error("Failed to fetch histories:", err);
    } finally {
      setLoading(false);
    }
  };

  // normalize network
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

  const applyFilter = () => {
    if (!filter) {
      setFilteredData(datas);
    } else {
      setFilteredData(
        datas.filter((d) => normalizeNetworkKey(d.network) === filter)
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

  // paginate filtered data
  const startIndex = (page - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

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
                  Airtime
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
                            <option value="MTN">MTN</option>
                            <option value="AIRTEL">AIRTEL</option>
                            <option value="GLO">GLO</option>
                            <option value="9MOBILE">9MOBILE</option>
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
                                  <th>Phone</th>
                                  <th>Amount</th>
                                  <th>Commission</th>
                                  <th>Status</th>
                                  <th>Date</th>
                                </tr>
                              </thead>

                              <tbody className="table-border-bottom-0">
                                {paginatedData.length === 0 ? (
                                  <tr>
                                    <td colSpan={10} className="text-center py-4">
                                      No records found.
                                    </td>
                                  </tr>
                                ) : (
                                  paginatedData.map((d, index) => {
                                    const idKey =
                                      d.id ?? d._id ?? d.reference ?? index;
                                    const networkObj = d.network;
                                    const networkName = getNetworkName(
                                      networkObj
                                    );
                                    const logoUrl = getNetworkLogo(networkObj);

                                    return (
                                      <tr key={idKey}>
                                        <td>
                                          {(page - 1) * pageSize + index + 1}
                                        </td>
                                        <td>{d.reference}</td>
                                        <td>
                                          {d.user?.username ?? d.user ?? "—"}
                                        </td>
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
                                        <td>{d.phone}</td>
                                        <td>{d.amount}</td>
                                        <td>{d.commission}</td>
                                        <td>
                                          <span
                                            className={`badge ${
                                              d.is_active === 1
                                                ? "bg-label-success"
                                                : "bg-label-danger"
                                            }`}
                                          >
                                            {d.is_active === 1
                                              ? "Active"
                                              : "Failed"}
                                          </span>
                                        </td>
                                        <td>{d.created_at.split("T")[0]}</td>
                                      </tr>
                                    );
                                  })
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
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </button>
                  </li>

                  {renderPageButtons()}

                  <li
                    className={`page-item ${
                      page === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
