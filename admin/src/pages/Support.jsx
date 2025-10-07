import React from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Topnav from "../components/Topnav";

export default function Support() {
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

                            <h4 className="fw-bold py-3 mb-4"><span className="text-muted fw-light">Home/</span> Support</h4>

                            <div className="row">
                                <div className="col-lg-12 mb-4 order-0">
                                  
                                    <div className="card">
                                        
                                        <div className="d-flex align-items-end row">
                                           <div className="card">
                                                <h5 className="card-header">Social Accounts</h5>
                                                <div className="card-header-actions">
                                                    <div className="float-end">
                                                        <button
                                                        type="button"
                                                        class="btn btn-primary"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#basicModal"
                                                        >
                                                        Add Plan
                                                        </button>
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
                                                                            <label for="nameBasic" className="form-label">Account</label>
                                                                            <select id="nameBasic" className="form-select">
                                                                                <option value="">Select Account</option>
                                                                                <option value="account1">Facebook</option>
                                                                                <option value="account2">Twitter</option>
                                                                                <option value="account2">Instagram</option>
                                                                                <option value="account2">LinkedIn</option>
                                                                            </select>
                                                                        </div>
                                                                        </div>
                                                                            <div className="row g-2">
                                                                            <div className="col mb-0">
                                                                                <label for="symbol" className="form-label">Account Name</label>
                                                                                <input type="text" id="symbol" className="form-control" />
                                                                            </div>
                                                                            <div className="col mb-0">
                                                                                <label for="planCode" className="form-label">Link</label>
                                                                                <input type="text" id="planCode" className="form-control" />
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


                                                <div className="card-body">
                                                    <p>Display content from social accounts on your site</p>
                                                    {/* <!-- Social Accounts --> */}
                                                    <div className="d-flex mb-3">
                                                        <div className="flex-shrink-0">
                                                            <img
                                                                src="../assets/img/icons/brands/facebook.png"
                                                                alt="facebook"
                                                                className="me-3"
                                                                height="30"
                                                            />
                                                        </div>
                                                        <div className="flex-grow-1 row">
                                                            <div className="col-8 col-sm-7 mb-sm-0 mb-2">
                                                                <h6 className="mb-0">Facebook</h6>
                                                                <small className="text-muted">Not Connected</small>
                                                            </div>
                                                            <div className="col-4 col-sm-5 text-end">
                                                                <button type="button" className="btn btn-icon btn-outline-secondary">
                                                                <i className="bx bx-link-alt"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex mb-3">
                                                        <div className="flex-shrink-0">
                                                            <img
                                                                src="../assets/img/icons/brands/twitter.png"
                                                                alt="twitter"
                                                                className="me-3"
                                                                height="30"
                                                            />
                                                        </div>
                                                        <div className="flex-grow-1 row">
                                                            <div className="col-8 col-sm-7 mb-sm-0 mb-2">
                                                                <h6 className="mb-0">Twitter</h6>
                                                                <a href="https://twitter.com/Theme_Selection" target="_blank">@ThemeSelection</a>
                                                            </div>
                                                            <div className="col-4 col-sm-5 text-end">
                                                                <button type="button" className="btn btn-icon btn-outline-danger">
                                                                <i className="bx bx-trash-alt"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex mb-3">
                                                        <div className="flex-shrink-0">
                                                            <img
                                                                src="../assets/img/icons/brands/instagram.png"
                                                                alt="instagram"
                                                                className="me-3"
                                                                height="30"
                                                            />
                                                        </div>
                                                        <div className="flex-grow-1 row">
                                                            <div className="col-8 col-sm-7 mb-sm-0 mb-2">
                                                                <h6 className="mb-0">instagram</h6>
                                                                <a href="https://www.instagram.com/themeselection/" target="_blank">@ThemeSelection</a>
                                                            </div>
                                                            <div className="col-4 col-sm-5 text-end">
                                                                <button type="button" className="btn btn-icon btn-outline-danger">
                                                                <i className="bx bx-trash-alt"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex mb-3">
                                                        <div className="flex-shrink-0">
                                                            <img
                                                                src="../assets/img/icons/brands/dribbble.png"
                                                                alt="dribbble"
                                                                className="me-3"
                                                                height="30"
                                                            />
                                                        </div>
                                                        <div className="flex-grow-1 row">
                                                            <div className="col-8 col-sm-7 mb-sm-0 mb-2">
                                                                <h6 className="mb-0">Dribbble</h6>
                                                                <small className="text-muted">Not Connected</small>
                                                            </div>
                                                            <div className="col-4 col-sm-5 text-end">
                                                                <button type="button" className="btn btn-icon btn-outline-secondary">
                                                                <i className="bx bx-link-alt"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex">
                                                        <div className="flex-shrink-0">
                                                            <img
                                                                src="../assets/img/icons/brands/behance.png"
                                                                alt="behance"
                                                                className="me-3"
                                                                height="30"
                                                            />
                                                        </div>
                                                        <div className="flex-grow-1 row">
                                                            <div className="col-8 col-sm-7 mb-sm-0 mb-2">
                                                                <h6 className="mb-0">Behance</h6>
                                                                <small className="text-muted">Not Connected</small>
                                                            </div>
                                                            <div className="col-4 col-sm-5 text-end">
                                                                <button type="button" className="btn btn-icon btn-outline-secondary">
                                                                <i className="bx bx-link-alt"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
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
