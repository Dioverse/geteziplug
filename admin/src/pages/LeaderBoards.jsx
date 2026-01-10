import React, { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Topnav from "../components/Topnav";
import {
  getRequest,
} from "../services/apiServices";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Leaderboards() {
  const [loading, setLoading] = useState(true);
  const [topUsers, setTopUsers] = useState([]);
  const [topTransactions, setTopTransactions] = useState([]);
  const [topTraders, setTopTraders] = useState([]);
  const [stats, setStats] = useState({
    total_users: 0,
    total_transactions: 0,
    total_volume: 0,
    active_users: 0
  });

  const [selectedPeriod, setSelectedPeriod] = useState("month"); // week, month, year, all

  useEffect(() => {
    fetchLeaderboards();
  }, [selectedPeriod]);

  const fetchLeaderboards = async () => {
    setLoading(true);
    try {
      const res = await getRequest(`/leaderboards?period=${selectedPeriod}`);
      const data = res.data?.results?.Data || {};
      
      setTopUsers(data.top_users || []);
      setTopTransactions(data.top_transactions || []);
      setTopTraders(data.top_traders || []);
      setStats(data.stats || {
        total_users: 0,
        total_transactions: 0,
        total_volume: 0,
        active_users: 0
      });
    } catch (err) {
      console.error("Failed to fetch leaderboards:", err);
      toast.error("Failed to load leaderboards");
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  const getMedalIcon = (position) => {
    if (position === 1) return "🥇";
    if (position === 2) return "🥈";
    if (position === 3) return "🥉";
    return `#${position}`;
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return "success";
    if (percentage >= 50) return "info";
    if (percentage >= 30) return "warning";
    return "danger";
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
              {/* Content */}

              <div className="container-xxl flex-grow-1 container-p-y">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="fw-bold py-3 mb-0">
                    <span className="text-muted fw-light">Home /</span> Leaderboards
                  </h4>

                  <div className="btn-group" role="group">
                    <button
                      type="button"
                      className={`btn btn-${selectedPeriod === "week" ? "primary" : "outline-primary"}`}
                      onClick={() => handlePeriodChange("week")}
                    >
                      This Week
                    </button>
                    <button
                      type="button"
                      className={`btn btn-${selectedPeriod === "month" ? "primary" : "outline-primary"}`}
                      onClick={() => handlePeriodChange("month")}
                    >
                      This Month
                    </button>
                    <button
                      type="button"
                      className={`btn btn-${selectedPeriod === "year" ? "primary" : "outline-primary"}`}
                      onClick={() => handlePeriodChange("year")}
                    >
                      This Year
                    </button>
                    <button
                      type="button"
                      className={`btn btn-${selectedPeriod === "all" ? "primary" : "outline-primary"}`}
                      onClick={() => handlePeriodChange("all")}
                    >
                      All Time
                    </button>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="row mb-4">
                  <div className="col-md-3 mb-4">
                    <div className="card">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div className="avatar flex-shrink-0 me-3">
                            <span className="avatar-initial rounded bg-label-primary">
                              <i className="bx bx-user fs-4"></i>
                            </span>
                          </div>
                          <div>
                            <small className="text-muted d-block">Total Users</small>
                            <h4 className="mb-0">{stats.total_users?.toLocaleString()}</h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-3 mb-4">
                    <div className="card">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div className="avatar flex-shrink-0 me-3">
                            <span className="avatar-initial rounded bg-label-success">
                              <i className="bx bx-transfer fs-4"></i>
                            </span>
                          </div>
                          <div>
                            <small className="text-muted d-block">Transactions</small>
                            <h4 className="mb-0">{stats.total_transactions?.toLocaleString()}</h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-3 mb-4">
                    <div className="card">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div className="avatar flex-shrink-0 me-3">
                            <span className="avatar-initial rounded bg-label-warning">
                              <i className="bx bx-money fs-4"></i>
                            </span>
                          </div>
                          <div>
                            <small className="text-muted d-block">Total Volume</small>
                            <h4 className="mb-0">
                              {new Intl.NumberFormat("en-NG", {
                                style: "currency",
                                currency: "NGN",
                                notation: "compact",
                                compactDisplay: "short"
                              }).format(stats.total_volume || 0)}
                            </h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-3 mb-4">
                    <div className="card">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div className="avatar flex-shrink-0 me-3">
                            <span className="avatar-initial rounded bg-label-info">
                              <i className="bx bx-user-check fs-4"></i>
                            </span>
                          </div>
                          <div>
                            <small className="text-muted d-block">Active Users</small>
                            <h4 className="mb-0">{stats.active_users?.toLocaleString()}</h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center p-5">
                    <div
                      className="spinner-border text-primary"
                      role="status"
                      style={{ width: "3rem", height: "3rem" }}>
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <div className="row">
                    {/* Top Users by Transaction Count */}
                    <div className="col-lg-4 mb-4">
                      <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between">
                          <h5 className="card-title mb-0">
                            <i className="bx bx-trophy text-warning me-2"></i>
                            Top Active Users
                          </h5>
                        </div>
                        <div className="card-body">
                          {topUsers.length === 0 ? (
                            <p className="text-center text-muted">No data available</p>
                          ) : (
                            <ul className="list-unstyled mb-0">
                              {topUsers.map((user, index) => (
                                <li key={user.id || index} className="mb-3">
                                  <div className="d-flex align-items-center">
                                    <span className="me-3 fs-4">{getMedalIcon(index + 1)}</span>
                                    <div className="flex-grow-1">
                                      <div className="d-flex justify-content-between mb-1">
                                        <h6 className="mb-0">
                                          {user.firstName && user.lastName
                                            ? `${user.firstName} ${user.lastName}`
                                            : user.username || "Unknown"}
                                        </h6>
                                        <span className="badge bg-label-primary">
                                          {user.transaction_count || 0}
                                        </span>
                                      </div>
                                      <small className="text-muted">{user.email}</small>
                                      <div className="progress mt-2" style={{ height: "6px" }}>
                                        <div
                                          className={`progress-bar bg-${getProgressColor(
                                            (user.transaction_count / (topUsers[0]?.transaction_count || 1)) * 100
                                          )}`}
                                          style={{
                                            width: `${
                                              (user.transaction_count / (topUsers[0]?.transaction_count || 1)) * 100
                                            }%`,
                                          }}
                                        ></div>
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Top Users by Transaction Volume */}
                    <div className="col-lg-4 mb-4">
                      <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between">
                          <h5 className="card-title mb-0">
                            <i className="bx bx-trending-up text-success me-2"></i>
                            Top by Volume
                          </h5>
                        </div>
                        <div className="card-body">
                          {topTransactions.length === 0 ? (
                            <p className="text-center text-muted">No data available</p>
                          ) : (
                            <ul className="list-unstyled mb-0">
                              {topTransactions.map((user, index) => (
                                <li key={user.id || index} className="mb-3">
                                  <div className="d-flex align-items-center">
                                    <span className="me-3 fs-4">{getMedalIcon(index + 1)}</span>
                                    <div className="flex-grow-1">
                                      <div className="d-flex justify-content-between mb-1">
                                        <h6 className="mb-0">
                                          {user.firstName && user.lastName
                                            ? `${user.firstName} ${user.lastName}`
                                            : user.username || "Unknown"}
                                        </h6>
                                        <span className="badge bg-label-success">
                                          {new Intl.NumberFormat("en-NG", {
                                            style: "currency",
                                            currency: "NGN",
                                            notation: "compact",
                                            compactDisplay: "short"
                                          }).format(user.total_volume || 0)}
                                        </span>
                                      </div>
                                      <small className="text-muted">{user.email}</small>
                                      <div className="progress mt-2" style={{ height: "6px" }}>
                                        <div
                                          className={`progress-bar bg-${getProgressColor(
                                            (user.total_volume / (topTransactions[0]?.total_volume || 1)) * 100
                                          )}`}
                                          style={{
                                            width: `${
                                              (user.total_volume / (topTransactions[0]?.total_volume || 1)) * 100
                                            }%`,
                                          }}
                                        ></div>
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Top Crypto Traders */}
                    <div className="col-lg-4 mb-4">
                      <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between">
                          <h5 className="card-title mb-0">
                            <i className="bx bx-bitcoin text-warning me-2"></i>
                            Top Crypto Traders
                          </h5>
                        </div>
                        <div className="card-body">
                          {topTraders.length === 0 ? (
                            <p className="text-center text-muted">No data available</p>
                          ) : (
                            <ul className="list-unstyled mb-0">
                              {topTraders.map((user, index) => (
                                <li key={user.id || index} className="mb-3">
                                  <div className="d-flex align-items-center">
                                    <span className="me-3 fs-4">{getMedalIcon(index + 1)}</span>
                                    <div className="flex-grow-1">
                                      <div className="d-flex justify-content-between mb-1">
                                        <h6 className="mb-0">
                                          {user.firstName && user.lastName
                                            ? `${user.firstName} ${user.lastName}`
                                            : user.username || "Unknown"}
                                        </h6>
                                        <span className="badge bg-label-warning">
                                          {user.crypto_trades || 0} trades
                                        </span>
                                      </div>
                                      <small className="text-muted">{user.email}</small>
                                      <div className="progress mt-2" style={{ height: "6px" }}>
                                        <div
                                          className={`progress-bar bg-${getProgressColor(
                                            (user.crypto_trades / (topTraders[0]?.crypto_trades || 1)) * 100
                                          )}`}
                                          style={{
                                            width: `${
                                              (user.crypto_trades / (topTraders[0]?.crypto_trades || 1)) * 100
                                            }%`,
                                          }}
                                        ></div>
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* / Content */}

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