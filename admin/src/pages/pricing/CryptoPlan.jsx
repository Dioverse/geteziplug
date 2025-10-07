import React, { useEffect, useState } from "react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import Topnav from "../../components/Topnav";
import NavLink from "../../components/NavLink";
import { getRequest } from "../../services/apiServices";

export default function CryptoPlan() {
    const [datas, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        fetchData(page);
    }, [page]);
    
    const fetchData = async (pageNum) => {
        setLoading(true);
        try {
            const res = await getRequest(`/pricings/crypto/?page=${pageNum}&limit=${pageSize}`);
            setData(res.data?.results?.Data || []);
            setTotalPages(res.data.results.total);
        } catch (err) {
            console.error("Failed to fetch plan:", err);
        } finally {
            setLoading(false);
        }
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

                            <h4 class="fw-bold py-3 mb-4"><span class="text-muted fw-light">Home /Pricing</span> / Crypto</h4>
                            
                            <div className="row">
                                <div className="col-lg-12 mb-4 order-0">
                                    <NavLink />
                                    <div className="card">
                                        <div className="card-header">
                                            <h5 className="mb-0">Filter Pricing Plans</h5>

                                            <div className="card-header-actions">
                                                <div className="row">
                                                    <div className="col-md-4">
                                                    </div>
                                                    <div className="col-md-8">
                                                        {/* Float this to the right */}
                                                        <div className="float-end">
                                                            <button
                                                            type="button"
                                                            class="btn btn-primary"
                                                            data-bs-toggle="modal"
                                                            data-bs-target="#basicModal"
                                                            >
                                                            Add Plan
                                                            </button>
                                                        </div> 
                                                        <div className="modal fade" id="basicModal" tabindex="-1" aria-hidden="true">
                                                            <div className="modal-dialog" role="document">
                                                                <div className="modal-content">
                                                                    <div className="modal-header">
                                                                        <h5 className="modal-title" id="exampleModalLabel1">Add Plan</h5>
                                                                        <button
                                                                        type="button"
                                                                        className="btn-close"
                                                                        data-bs-dismiss="modal"
                                                                        aria-label="Close"
                                                                        ></button>
                                                                    </div>
                                                                    <div className="modal-body">
                                                                        <div className="row">
                                                                        <div className="col mb-3">
                                                                            <label for="nameBasic" className="form-label">Name</label>
                                                                            <input type="text" id="nameBasic" className="form-select" />
                                                                        </div>
                                                                        </div>
                                                                         <div className="row g-2">
                                                                            <div className="col mb-0">
                                                                                <label for="symbol" className="form-label">Symbol</label>
                                                                                <input type="text" id="symbol" className="form-control" />
                                                                            </div>
                                                                            <div className="col mb-0">
                                                                                <label for="planCode" className="form-label">Logo</label>
                                                                                <input type="file" id="planCode" className="form-control" />
                                                                            </div>
                                                                        </div>
                                                                        <div className="row g-2 mt-2">
                                                                            <div className="col mb-0">
                                                                                <label for="buyPrice" className="form-label">USD Rate</label>
                                                                                <input type="number" id="buyPrice" className="form-control" min={1} max={5} />
                                                                            </div>
                                                                            <div className="col mb-0">
                                                                                <label for="chain" className="form-label">Chain</label>
                                                                                <input type="text" id="chain" className="form-control" />
                                                                            </div>
                                                                            <div className="col mb-0">
                                                                                <label for="ticker" className="form-label">Ticker</label>
                                                                                <input type="text" id="ticker" className="form-control" />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="modal-footer">
                                                                        <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">
                                                                        Close
                                                                        </button>
                                                                        <button type="button" className="btn btn-primary">Save changes</button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
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
                                                    <span className="visually-hidden">Loading...</span>
                                                    </div>
                                                </div>
                                                ) : (
                                                    <table className="table">
                                                        <thead>
                                                            <tr>
                                                            <th width="50">#</th>
                                                            <th>Name</th>
                                                            <th>Symbol</th>
                                                            <th>Rate</th>
                                                            <th>Chain</th>
                                                            <th>Ticker</th>
                                                            <th>Status</th>
                                                            <th>Actions</th>
                                                            </tr>
                                                        </thead>
                                                    <tbody class="table-border-bottom-0">
                                                        {datas.map((data, index) => (
                                                        <tr key={index}>
                                                            <td>{(page-1) * pageSize + index + 1}</td>
                                                            <td>
                                                                {data.name}
                                                            </td>
                                                            <td>{data.symbol}</td>
                                                            <td>{data.usd_rate}</td>
                                                            <td>{data.chain}</td>
                                                            <td>{data.nownode_ticker}</td>
                                                            <td><span class="badge bg-label-primary me-1">Active</span></td>
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
                                                                    <i className="bx bx-edit-alt me-1"></i> Edit
                                                                    </button>
                                                                    <button className="dropdown-item">
                                                                    <i className="bx bx-trash me-1"></i> Delete
                                                                    </button>
                                                                </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* / Content */}
                        
                        {/* Pagination */}
                        <nav className="mt-3">
                            <ul className="pagination justify-content-center">
                            <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                                <button className="page-link" onClick={() => setPage(page - 1)}>Previous</button>
                            </li>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <li key={i} className={`page-item ${page === i + 1 ? "active" : ""}`}>
                                <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
                                </li>
                            ))}
                            <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                                <button className="page-link" onClick={() => setPage(page + 1)}>Next</button>
                            </li>
                            </ul>
                        </nav>
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
