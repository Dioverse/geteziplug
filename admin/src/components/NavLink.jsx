import { NavLink } from "react-router-dom";
import React, { Component } from 'react';

export default class PricingNavLinks extends Component {
  render() {
    return (
      <div>
        <ul className="nav nav-pills flex-column flex-md-row mb-3">
          <li className="nav-item">
            <NavLink
              to="/admin/pricing/airtime"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <i className="bx bx-link-alt me-1"></i> Airtime Percent
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink
              to="/admin/pricing/cable"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <i className="bx bx-link-alt me-1"></i> Cable Plan
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink
              to="/admin/pricing/crypto"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <i className="bx bx-link-alt me-1"></i> Crypto
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink
              to="/admin/pricing/data"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <i className="bx bx-link-alt me-1"></i> Data Plans
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink
              to="/admin/pricing/giftcards"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <i className="bx bx-link-alt me-1"></i> Giftcards
            </NavLink>
          </li>
        </ul>
      </div>
    );
  }
}
