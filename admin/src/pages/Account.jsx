import React, { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Topnav from "../components/Topnav";
import axios from "axios";
import { API_BASE } from "../services/apiServices";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend
} from "recharts";


export default function Account() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch statistics
  const fetchStats = async (start = "", end = "") => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/api/admin/accounting`,
        { start_date: start, end_date: end },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching account stats:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats(); // initial load
  }, []);

  const handleFilter = () => {
    fetchStats(startDate, endDate);
  };

    // Prepare chart data from API response
  const chartData = stats
    ? [
        { name: "Giftcard", value: stats.giftcard_sales },
        { name: "Crypto", value: stats.crypto_sales },
        { name: "Airtime", value: stats.airtime_sales },
        { name: "Data", value: stats.data_sales },
      ]
    : [];

  const progressData = stats
    ? [
        { name: "Payments", value: parseFloat(stats.payments) },
        { name: "Profit", value: parseFloat(stats.profit) },
      ]
    : [];

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
                <h4 className="fw-bold py-3 mb-4">
                  <span className="text-muted fw-light">Home /</span> Accounting
                </h4>

                <div className="row">
                  <div className="col-lg-12 mb-4 order-0">
                    
                    <div className="card">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Accounting Statistics</h5>
                        <div className="d-flex gap-2">
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="form-control"
                          />
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="form-control"
                          />
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleFilter}
                          >
                            Calculate
                          </button>
                        </div>
                      </div>

                      <div className="card-body">
                        {loading ? (
                          <p>Loading...</p>
                        ) : stats ? (
                          <>
                            {/* Summary Cards */}
                            <div className="row mb-4">
                              <div className="col-md-3">
                                <div className="card text-center p-3 shadow-sm">
                                  <h6>Total Sales</h6>
                                  <h4>₦{stats.total_sales}</h4>
                                </div>
                              </div>
                              <div className="col-md-3">
                                <div className="card text-center p-3 shadow-sm">
                                  <h6>Payments</h6>
                                  <h4>₦{stats.payments}</h4>
                                </div>
                              </div>
                              <div className="col-md-3">
                                <div className="card text-center p-3 shadow-sm">
                                  <h6>Profit</h6>
                                  <h4
                                    className={
                                      stats.profit >= 0
                                        ? "text-success"
                                        : "text-danger"
                                    }
                                  >
                                    ₦{stats.profit}
                                  </h4>
                                </div>
                              </div>
                              <div className="col-md-3">
                                <div className="card text-center p-3 shadow-sm">
                                  <h6>New Users</h6>
                                  <h4>{stats.new_users}</h4>
                                </div>
                              </div>
                            </div>

                            {/* Breakdown Table */}
                            <table className="table table-bordered">
                              <thead>
                                <tr>
                                  <th>Giftcard Sales</th>
                                  <th>Crypto Sales</th>
                                  <th>Airtime Sales</th>
                                  <th>Data Sales</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td>₦{stats.giftcard_sales}</td>
                                  <td>₦{stats.crypto_sales}</td>
                                  <td>₦{stats.airtime_sales}</td>
                                  <td>₦{stats.data_sales}</td>
                                </tr>
                              </tbody>
                            </table>

                            {/* Sales Breakdown Chart */}
                            <h6 className="mt-4">Sales Breakdown</h6>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={chartData}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#4e73df" />
                              </BarChart>
                            </ResponsiveContainer>

                            {/* Payments vs Profit Chart */}
                            <h6 className="mt-4">Payments vs Profit</h6>
                            <ResponsiveContainer width="100%" height={300}>
                              <LineChart data={progressData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="value" stroke="#1cc88a" />
                              </LineChart>
                            </ResponsiveContainer>

                        

                            {/* Date Range Info */}
                            <p className="mt-3 text-muted">
                              Date Range:{" "}
                              {stats.date_range?.[0]} to {stats.date_range?.[1]}
                            </p>
                          </>
                        ) : (
                          <p>No data available</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
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
      </div>
    </>
  );
}
