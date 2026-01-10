import React, { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Topnav from "../components/Topnav";
import { API_BASE } from "../services/apiServices";

export default function Dashboard() {

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE}/api/admin/dashboard`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
      .then(res => {
        setDashboard(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-5 text-center">Loading...</div>;

  // Chart data
  const revenueData = [
    { name: "Airtime", value: parseFloat(dashboard.airtime_total) },
    { name: "Data", value: parseFloat(dashboard.data_total) },
    { name: "Giftcards", value: parseFloat(dashboard.giftcard_total) },
    { name: "Crypto", value: parseFloat(dashboard.crypto_total) },
    { name: "Wallet", value: parseFloat(dashboard.wallet_total) },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#845EC2"];



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
                        <div className="row">
                            <div className="col-lg-8 mb-4 order-0">
                            <div className="card">
                                <div className="d-flex align-items-end row">
                                <div className="col-sm-7">
                                    <div className="card-body">
                                    <h5 className="card-title text-primary">Congratulations John! 🎉</h5>
                                    <p className="mb-4">
                                        You have done <span className="fw-bold">72%</span> more sales today. Check your new badge in
                                        your profile.
                                    </p>

                                    <a href="javascript:;" className="btn btn-sm btn-outline-primary">View Badges</a>
                                    </div>
                                </div>
                                <div className="col-sm-5 text-center text-sm-left">
                                    <div className="card-body pb-0 px-0 px-md-4">
                                    <img
                                        src="../assets/img/illustrations/man-with-laptop-light.png"
                                        height="140"
                                        alt="View Badge User"
                                        data-app-dark-img="illustrations/man-with-laptop-dark.png"
                                        data-app-light-img="illustrations/man-with-laptop-light.png"
                                    />
                                    </div>
                                </div>
                                </div>
                            </div>
                            </div>
                            <div className="col-lg-4 col-md-4 order-1">
                            <div className="row">
                                <div className="col-lg-6 col-md-12 col-6 mb-4">
                                <div className="card">
                                    <div className="card-body">
                                    <div className="card-title d-flex align-items-start justify-content-between">
                                        <div className="avatar flex-shrink-0">
                                        <img
                                            src="../assets/img/icons/unicons/chart-success.png"
                                            alt="chart success"
                                            className="rounded"
                                        />
                                        </div>
                                    </div>
                                    <span className="fw-semibold d-block mb-1">Profit</span>
                                    <h3 className="card-sub-title mb-2"><small>₦{dashboard.profit.toLocaleString()}</small></h3>
                                    <small className="text-success fw-semibold"><i className="bx bx-up-arrow-alt"></i> + Growth</small>
                                    </div>
                                </div>
                                </div>
                                <div className="col-lg-6 col-md-12 col-6 mb-4">
                                    <div className="card">
                                        <div className="card-body">
                                        <div className="card-title d-flex align-items-start justify-content-between">
                                            <div className="avatar flex-shrink-0">
                                            <img
                                                src="../assets/img/icons/unicons/wallet-info.png"
                                                alt="Credit Card"
                                                className="rounded"
                                            />
                                            </div>
                                        </div>
                                        <span>Sales</span>
                                        <h3 className="card-title text-nowrap mb-1"><small>₦{dashboard.total_sale.toLocaleString()}</small></h3>
                                        <small className="text-success fw-semibold"><i className="bx bx-up-arrow-alt"></i> Growth</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            </div>
                            {/* Total Revenue */}
                            <div className="col-12 col-lg-7 order-2 order-md-3 order-lg-2 mb-4">
                            <div className="card">
                                <div className="row row-bordered g-0">
                                    <div className="col-md-12">
                                        <h5 className="card-header m-0 me-2 pb-3">Total Revenue</h5>
                                        <div className="card-body" style={{ height: "300px" }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                        data={revenueData}
                                                        cx="50%"
                                                        cy="50%"
                                                        outerRadius={100}
                                                        fill="#8884d8"
                                                        dataKey="value"
                                                        label
                                                        >
                                                        {revenueData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                        </Pie>
                                                        <Tooltip />
                                                    </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            </div>
                            {/*/ Total Revenue */}
                            <div className="col-12 col-md-5 col-lg-5 order-3 order-md-2">
                           
                                <div className="card">
                                    <div className="card-body">
                                        <div className="card-body" style={{ height: "300px" }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={revenueData}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="name" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Bar dataKey="value" fill="#0088FE" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                                {/* <div className="col-6 mb-4">
                                <div className="card">
                                    <div className="card-body">
                                    <div className="card-title d-flex align-items-start justify-content-between">
                                        <div className="avatar flex-shrink-0">
                                        <img src="../assets/img/icons/unicons/cc-primary.png" alt="Credit Card" className="rounded" />
                                        </div>
                                        <div className="dropdown">
                                        <button
                                            className="btn p-0"
                                            type="button"
                                            id="cardOpt1"
                                            data-bs-toggle="dropdown"
                                            aria-haspopup="true"
                                            aria-expanded="false"
                                        >
                                            <i className="bx bx-dots-vertical-rounded"></i>
                                        </button>
                                        <div className="dropdown-menu" aria-labelledby="cardOpt1">
                                            <a className="dropdown-item" href="javascript:void(0);">View More</a>
                                            <a className="dropdown-item" href="javascript:void(0);">Delete</a>
                                        </div>
                                        </div>
                                    </div>
                                    <span className="fw-semibold d-block mb-1">Transactions</span>
                                    <h3 className="card-title mb-2">$14,857</h3>
                                    <small className="text-success fw-semibold"><i className="bx bx-up-arrow-alt"></i> +28.14%</small>
                                    </div>
                                </div>
                                </div> */}
                            </div>
                        </div>
                        <div className="row">
                            {/* Recent users */}
                            <div className="col-md-8 mb-4">
                                <div className="card">
                                <h5 className="card-header">Recent Registrations</h5>
                                <div className="table-responsive text-nowrap">
                                    <table className="table">
                                    <thead>
                                        <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                        <th>Wallet ₦</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dashboard.recent_user.slice(0, 5).map(user => (
                                        <tr key={user.id}>
                                            <td>{user.firstName} {user.lastName}</td>
                                            <td>{user.email}</td>
                                            <td>
                                            <span className={`badge ${user.status === "active" ? "bg-success" : "bg-danger"}`}>
                                                {user.status}
                                            </span>
                                            </td>
                                            <td>₦{parseFloat(user.wallet_naira).toLocaleString()}</td>
                                        </tr>
                                        ))}
                                    </tbody>
                                    </table>
                                </div>
                                </div>
                            </div>
                            {/*/ Recent users */}

                            {/* Transactions */}
                            <div className="col-md-4 mb-4">
                                <div className="card h-100">
                                <h5 className="card-header">Wallet Transactions</h5>
                                <div className="card-body">
                                    <ul className="list-unstyled">
                                    {dashboard.recent.slice(0, 5).map(tx => (
                                        <li key={tx.id} className="mb-3 border-bottom pb-2">
                                        <strong>{tx.description}</strong>
                                        <div className="d-flex justify-content-between small text-muted">
                                            <span>{tx.amount} {tx.currency}</span>
                                            <span>{tx.status}</span>
                                        </div>
                                        </li>
                                    ))}
                                    </ul>
                                </div>
                                </div>
                            </div>
                            {/*/ Transactions */}
                        </div>
                        </div>
                        {/* / Content */}

                        {/* Footer */}
                        <Footer/>
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
