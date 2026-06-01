import React, { useState } from "react";
import DonarList from "../donar/DonarList";
import AdminCashEntry from "./AdminCashEntry";
import AdminStatsDashboard from "./AdminStatsDashboard";

export default function AdminDashboard({ onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRecordAdded = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  const handleLogout = () => {
    localStorage.clear();
    delete window.axios?.defaults.headers.common["Authorization"];
    onLogout();
  };

  const getPageTitle = () => {
    switch (activeMenu) {
      case "dashboard":
        return "Dashboard";
      case "donor-list":
        return "Donor List";
      case "donation-entry":
        return "Record Donation";
      default:
        return "Admin Dashboard";
    }
  };

  return (
    <div className="admin-dashboard-wrapper">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Dream Girl CMS</h2>
        </div>
        <nav className="sidebar-nav">
          <button
            className={`sidebar-item ${activeMenu === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveMenu("dashboard")}
          >
            📊 Dashboard
          </button>
          <button
            className={`sidebar-item ${activeMenu === "donor-list" ? "active" : ""}`}
            onClick={() => setActiveMenu("donor-list")}
          >
            👥 Donor List
          </button>
          <button
            className={`sidebar-item ${activeMenu === "donation-entry" ? "active" : ""}`}
            onClick={() => setActiveMenu("donation-entry")}
          >
            💰 Donation Entry
          </button>
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main-content">
        {/* Top Header */}
        <header className="admin-top-header">
          <button
            className="hamburger-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title="Toggle sidebar"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <h1 className="page-title">{getPageTitle()}</h1>
          <div className="header-right">
            <span className="user-email">
              {localStorage.getItem("adminEmail")}
            </span>
          </div>
        </header>

        {/* Content Area */}
        <main className="admin-content-area">
          {activeMenu === "dashboard" && (
            <div className="content-section fade-in">
              <AdminStatsDashboard />
            </div>
          )}

          {activeMenu === "donor-list" && (
            <div className="content-section fade-in">
              <DonarList key={refreshKey} />
            </div>
          )}

          {activeMenu === "donation-entry" && (
            <div className="content-section fade-in">
              <AdminCashEntry onRecordAdded={handleRecordAdded} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
