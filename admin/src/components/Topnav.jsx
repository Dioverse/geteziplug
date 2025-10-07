import React, { Component } from 'react'

export default class Topnav extends Component {
  render() {
    return (
      <>
        <nav
            className="layout-navbar container-xxl navbar navbar-expand-xl navbar-detached align-items-center bg-navbar-theme" id="layout-navbar">
            <div className="layout-menu-toggle navbar-nav align-items-xl-center me-3 me-xl-0 d-xl-none">
            <a className="nav-item nav-link px-0 me-xl-4" href="javascript:void(0)">
                <i className="bx bx-menu bx-sm"></i>
            </a>
            </div>

            <div className="navbar-nav-right d-flex align-items-center" id="navbar-collapse">
            {/* Search */}
            <div className="navbar-nav align-items-center">
                <div className="nav-item d-flex align-items-center">
                <i className="bx bx-search fs-4 lh-0"></i>
                <input
                    type="text"
                    className="form-control border-0 shadow-none"
                    placeholder="Search..."
                    aria-label="Search..."
                />
                </div>
            </div>
            {/* /Search */}

            <ul className="navbar-nav flex-row align-items-center ms-auto">
                {/* Place this tag where you want the button to render. */}
                <li className="nav-item lh-1 me-3">
                <a
                    className="github-button"
                    data-size="large"
                    data-show-count="true"
                    >Administrative Dashboard</a
                >
                </li>

                {/* User */}
                <li className="nav-item navbar-dropdown dropdown-user dropdown">
                <a className="nav-link dropdown-toggle hide-arrow" href="javascript:void(0);" data-bs-toggle="dropdown">
                    <div className="avatar avatar-online">
                    <img src="../../assets/img/avatars/1.png" alt className="w-px-40 h-auto rounded-circle" />
                    </div>
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                    <a className="dropdown-item" href="#">
                        <div className="d-flex">
                        <div className="flex-shrink-0 me-3">
                            <div className="avatar avatar-online">
                            <img src="../../assets/img/avatars/1.png" className="w-px-40 h-auto rounded-circle" />
                            </div>
                        </div>
                        <div className="flex-grow-1">
                            <span className="fw-semibold d-block">John Doe</span>
                            <small className="text-muted">Admin</small>
                        </div>
                        </div>
                    </a>
                    </li>
                    <li>
                    <div className="dropdown-divider"></div>
                    </li>
                    <li>
                    <a className="dropdown-item" href="/admin/profile">
                        <i className="bx bx-user me-2"></i>
                        <span className="align-middle">My Profile</span>
                    </a>
                    </li>
                    <li>
                    <a className="dropdown-item" href="/admin/setting">
                        <i className="bx bx-cog me-2"></i>
                        <span className="align-middle">Settings</span>
                    </a>
                    </li>
                    <li>
                    <div className="dropdown-divider"></div>
                    </li>
                    <li>
                    <a className="dropdown-item" href="auth-login-basic.html">
                        <i className="bx bx-power-off me-2"></i>
                        <span className="align-middle">Log Out</span>
                    </a>
                    </li>
                </ul>
                </li>
                {/*/ User */}
            </ul>
            </div>
        </nav>
      </>
    )
  }
}
