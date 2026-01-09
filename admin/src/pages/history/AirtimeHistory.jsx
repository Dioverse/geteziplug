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
  const [statusFilter, setStatusFilter] = useState("");
  const [searchRef, setSearchRef] = useState("");

  const LOGO_CDN = {
    MTN: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/MTN_2022_logo.svg/250px-MTN_2022_logo.svg.png",
    AIRTEL:
      "https://s3-ap-southeast-1.amazonaws.com/bsy/iportal/images/airtel-logo-red-text-horizontal.jpg",
    GLO: "https://upload.wikimedia.org/wikipedia/commons/8/86/Glo_button.png",
    "9MOBILE":
      "https://9mobile.com.ng/_next/static/media/logos.1d851e63.png",
  };

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    fetchData(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    applyFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, statusFilter, searchRef, datas]);

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

      const apiData = res?.data?.results?.Data;

      setData(apiData?.data || []);
      setFilteredData(apiData?.data || []);
      setTotalPages(apiData?.last_page || 1);
    } catch (err) {
      console.error("Failed to fetch histories:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= HELPERS ================= */
  const normalizeNetworkKey = (network) => {
    if (!network) return null;
    const s =
      typeof network === "string"
        ? network
        : network.name || network.code || "";
    const low = String(s).toLowerCase();
    if (low.includes("mtn")) return "MTN";
    if (low.includes("airtel")) return "AIRTEL";
    if (low.includes("glo")) return "GLO";
    if (low.includes("9")) return "9MOBILE";
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
      (typeof network.logo === "string" ||
        typeof network.logo?.url === "string")
    ) {
      return typeof network.logo === "string"
        ? network.logo
        : network.logo.url;
    }
    const key = normalizeNetworkKey(network);
    return key ? LOGO_CDN[key] : null;
  };

  /* ================= FILTER ================= */
  const applyFilter = () => {
    let tempData = [...datas];

    // Network filter
    if (filter) {
      tempData = tempData.filter(
        (d) => normalizeNetworkKey(d.network) === filter
      );
    }

    // Status filter
    if (statusFilter) {
      tempData = tempData.filter(
        (d) => d.status?.toLowerCase() === statusFilter
      );
    }

    // Reference search (client-side)
    if (searchRef.trim()) {
      const q = searchRef.toLowerCase();
      tempData = tempData.filter((d) =>
        d.reference?.toLowerCase().includes(q)
      );
    }

    setFilteredData(tempData);
  };

  /* ================= PAGINATION ================= */
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

  /* ================= RENDER ================= */
  return (
    <div className="layout-wrapper layout-content-navbar">
      <div className="layout-container">
        <Navbar />
        <div className="layout-page">
          <Topnav />
          <div className="content-wrapper">
            <div className="container-xxl container-p-y">
              <h4 className="fw-bold py-3 mb-4">
                <span className="text-muted fw-light">Home / History</span> /
                Airtime
              </h4>

              <HistoryLink />

              <div className="card">
                {/* FILTERS */}
                <div className="card-header row g-2">
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by Reference ID"
                      value={searchRef}
                      onChange={(e) => setSearchRef(e.target.value)}
                    />
                  </div>

                  <div className="col-md-4">
                    <select
                      className="form-select"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      <option value="">All Networks</option>
                      <option value="MTN">MTN</option>
                      <option value="AIRTEL">AIRTEL</option>
                      <option value="GLO">GLO</option>
                      <option value="9MOBILE">9MOBILE</option>
                    </select>
                  </div>

                  <div className="col-md-4">
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
                          <th>Network</th>
                          <th>Phone</th>
                          <th>Amount</th>
                          <th>Commission</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.length === 0 ? (
                          <tr>
                            <td colSpan="9" className="text-center">
                              No records found
                            </td>
                          </tr>
                        ) : (
                          filteredData.map((d, index) => (
                            <tr key={d.id ?? d.reference ?? index}>
                              <td>{index + 1}</td>
                              <td>{d.reference}</td>
                              <td>{d.user?.username ?? "—"}</td>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  {getNetworkLogo(d.network) && (
                                    <img
                                      src={getNetworkLogo(d.network)}
                                      alt={getNetworkName(d.network)}
                                      height="24"
                                    />
                                  )}
                                  {getNetworkName(d.network)}
                                </div>
                              </td>
                              <td>{d.phone}</td>
                              <td>{d.amount}</td>
                              <td>{d.commission}</td>
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
                              <td>{d.created_at?.split("T")[0]}</td>
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
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
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
