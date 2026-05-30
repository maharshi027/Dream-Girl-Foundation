// src/admin/AdminStatsDashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AdminStatsDashboard() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/donations/all-records");
      setDonations(response.data);
    } catch (error) {
      console.error("Error fetching donor data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  // Metrics calculations (Only on successful transactions)
  const successfulDonations = donations.filter(
    (d) => d.paymentStatus === "SUCCESS"
  );
  const totalRaised = successfulDonations.reduce(
    (acc, curr) => acc + curr.amount,
    0
  );
  const numDonors = successfulDonations.length;
  const averageDonation =
    numDonors > 0 ? Math.round(totalRaised / numDonors) : 0;

  const cashTotal = successfulDonations
    .filter((d) => d.paymentMode === "CASH")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const onlineTotal = successfulDonations
    .filter((d) => d.paymentMode === "ONLINE")
    .reduce((acc, curr) => acc + curr.amount, 0);

  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "3rem",
          fontSize: "1.1rem",
          color: "#6b7280",
        }}
      >
        Loading Dashboard Statistics...
      </div>
    );
  }

  return (
    <div className="admin-stats-dashboard">
      {/* Page Title */}
      <div className="dashboard-header">
        <h2>Dashboard Overview</h2>
        <p>Real-time analytics from your donor database</p>
      </div>

      {/* Statistics Cards Grid */}
      <div className="cms-metrics">
        {/* Card 1: Total Raised */}
        <div className="metric-card">
          <div
            className="metric-icon-bg"
            style={{ backgroundColor: "#ecfdf5", color: "#059669" }}
          >
            🪙
          </div>
          <div className="metric-details">
            <p>Total Raised</p>
            <h3>
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              }).format(totalRaised)}
            </h3>
          </div>
        </div>

        {/* Card 2: Active Donors */}
        <div className="metric-card">
          <div
            className="metric-icon-bg"
            style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}
          >
            👥
          </div>
          <div className="metric-details">
            <p>Active Donors</p>
            <h3>{numDonors}</h3>
          </div>
        </div>

        {/* Card 3: Average Ticket */}
        <div className="metric-card">
          <div
            className="metric-icon-bg"
            style={{ backgroundColor: "#fef3c7", color: "#d97706" }}
          >
            📈
          </div>
          <div className="metric-details">
            <p>Average Ticket</p>
            <h3>₹{averageDonation}</h3>
          </div>
        </div>

        {/* Card 4: Online vs Cash */}
        <div className="metric-card">
          <div
            className="metric-icon-bg"
            style={{ backgroundColor: "#fdf2f8", color: "#db2777" }}
          >
            📊
          </div>
          <div className="metric-details">
            <p>Online vs Cash</p>
            <h3 style={{ fontSize: "1.1rem" }}>
              ₹{onlineTotal} / ₹{cashTotal}
            </h3>
          </div>
        </div>
      </div>

      {/* Additional Info Cards */}
      <div className="dashboard-info-section">
        <div className="info-card">
          <div className="info-icon" style={{ color: "#2563eb" }}>
            💳
          </div>
          <div className="info-content">
            <h4>Online Donations</h4>
            <p className="info-value">₹{onlineTotal}</p>
            <p className="info-label">
              {successfulDonations.filter((d) => d.paymentMode === "ONLINE")
                .length}{" "}
              transactions
            </p>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon" style={{ color: "#059669" }}>
            💵
          </div>
          <div className="info-content">
            <h4>Cash Donations</h4>
            <p className="info-value">₹{cashTotal}</p>
            <p className="info-label">
              {successfulDonations.filter((d) => d.paymentMode === "CASH")
                .length}{" "}
              transactions
            </p>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon" style={{ color: "#d97706" }}>
            📋
          </div>
          <div className="info-content">
            <h4>Total Transactions</h4>
            <p className="info-value">{donations.length}</p>
            <p className="info-label">
              {successfulDonations.length} successful
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
