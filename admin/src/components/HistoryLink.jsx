import { NavLink } from "react-router-dom";
import React from 'react';

export default function HistoryLink() {
  const historyLinks = [
    {
      to: "/admin/history/fund",
      icon: "bx bx-wallet",
      label: "Fund",
      color: "primary"
    },
    {
      to: "/admin/history/airtime",
      icon: "bx bx-phone",
      label: "Airtime",
      color: "success"
    },
    {
      to: "/admin/history/data",
      icon: "bx bx-data",
      label: "Data",
      color: "info"
    },
    {
      to: "/admin/history/bill",
      icon: "bx bx-receipt",
      label: "Bills",
      color: "warning"
    },
    {
      to: "/admin/history/cable",
      icon: "bx bx-tv",
      label: "Cable",
      color: "danger"
    },
    {
      to: "/admin/history/crypto",
      icon: "bx bxl-bitcoin",
      label: "Crypto",
      color: "dark"
    },
    {
      to: "/admin/history/giftcards",
      icon: "bx bx-gift",
      label: "Gift Cards",
      color: "primary"
    },
    {
      to: "/admin/history/giftuser",
      icon: "bx bx-user-plus",
      label: "Gift Users",
      color: "success"
    },
    {
      to: "/admin/history/airtimeswap",
      icon: "bx bx-transfer",
      label: "Airtime Swap",
      color: "info"
    }
  ];

  return (
    <div className="mb-4">
      <div className="card border-0 shadow-sm">
        <div className="card-body p-3">
          {/* Desktop view - horizontal scrollable */}
          <div className="d-none d-lg-block">
            <div className="d-flex gap-2 overflow-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
              {historyLinks.map((link, index) => (
                <NavLink
                  key={index}
                  to={link.to}
                  className={({ isActive }) =>
                    `btn btn-sm d-flex align-items-center gap-2 text-nowrap px-3 py-2 ${
                      isActive 
                        ? `btn-${link.color} shadow-sm` 
                        : 'btn-outline-secondary'
                    }`
                  }
                  style={{ 
                    transition: 'all 0.2s ease',
                    minWidth: 'fit-content'
                  }}
                >
                  {({ isActive }) => (
                    <>
                      <i className={`${link.icon} ${isActive ? '' : 'text-muted'}`} 
                         style={{ fontSize: '1.1rem' }}></i>
                      <span className={isActive ? 'fw-semibold' : ''}>{link.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Tablet view - wrapped layout */}
          <div className="d-none d-md-block d-lg-none">
            <div className="d-flex flex-wrap gap-2">
              {historyLinks.map((link, index) => (
                <NavLink
                  key={index}
                  to={link.to}
                  className={({ isActive }) =>
                    `btn btn-sm d-flex align-items-center gap-2 ${
                      isActive 
                        ? `btn-${link.color} shadow-sm` 
                        : 'btn-outline-secondary'
                    }`
                  }
                  style={{ transition: 'all 0.2s ease' }}
                >
                  {({ isActive }) => (
                    <>
                      <i className={`${link.icon} ${isActive ? '' : 'text-muted'}`}></i>
                      <span className={isActive ? 'fw-semibold' : ''}>{link.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Mobile view - dropdown */}
          <div className="d-block d-md-none">
            <div className="dropdown">
              <button
                className="btn btn-primary w-100 d-flex align-items-center justify-content-between dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <span className="d-flex align-items-center gap-2">
                  <i className="bx bx-history"></i>
                  <span>History Categories</span>
                </span>
              </button>
              <ul className="dropdown-menu w-100 shadow">
                {historyLinks.map((link, index) => (
                  <li key={index}>
                    <NavLink
                      to={link.to}
                      className={({ isActive }) =>
                        `dropdown-item d-flex align-items-center gap-2 py-2 ${
                          isActive ? 'active' : ''
                        }`
                      }
                    >
                      <i className={link.icon}></i>
                      <span>{link.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .overflow-auto::-webkit-scrollbar {
          height: 6px;
        }
        .overflow-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .overflow-auto::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .overflow-auto::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
}