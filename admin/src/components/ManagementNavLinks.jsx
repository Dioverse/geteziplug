import { NavLink } from "react-router-dom";
import React, { Component } from 'react';

export default class ManagementNavLinks extends Component {
  render() {
    return (
      <div>
        <ul className="nav nav-pills flex-column flex-md-row mb-3">
          <li className="nav-item">
            <NavLink
              to="/admin/management/bonuses"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <i className="bx bx-gift me-1"></i> Bonuses
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink
              to="/admin/management/payouts"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <i className="bx bx-money me-1"></i> Payout Requests
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink
              to="/admin/management/virtual-accounts"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <i className="bx bx-credit-card me-1"></i> Virtual Accounts
            </NavLink>
          </li>
        </ul>
      </div>
    );
  }
}