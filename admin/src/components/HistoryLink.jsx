import { NavLink } from "react-router-dom";
import React, { Component } from 'react';

export default class HistoryLink extends Component {
  render() {
    return (
      <>
        <ul className="nav nav-pills flex-nowrap mb-3">
          <li className="nav-item">
            <NavLink
              to="/admin/history/airtime"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <i className="bx bx-link-alt me-1"></i> Airtime History
            </NavLink>
          </li>

               <li className="nav-item">
            <NavLink
              to="/admin/history/giftuser"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <i className="bx bx-link-alt me-1"></i> Gift Users
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink
              to="/admin/history/bill"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <i className="bx bx-link-alt me-1"></i> Bill History
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/admin/history/cable"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <i className="bx bx-link-alt me-1"></i> Cable History
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/admin/history/crypto"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <i className="bx bx-link-alt me-1"></i> Crypto History
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/admin/history/data"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <i className="bx bx-link-alt me-1"></i> Data History
            </NavLink>
          </li>
          
          <li className="nav-item">
            <NavLink
              to="/admin/history/giftcards"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <i className="bx bx-link-alt me-1"></i> Gift cards
            </NavLink>
          </li>
          
            <li className="nav-item">
            <NavLink
              to="/admin/history/fund"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <i className="bx bx-link-alt me-1"></i> Fund History
            </NavLink>
          </li>

           <li className="nav-item">
            <NavLink
              to="/admin/history/airtimeswap"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <i className="bx bx-link-alt me-1"></i> Airtime Swap History
            </NavLink>
          </li>

        </ul>
      </>
    );
  }
}
