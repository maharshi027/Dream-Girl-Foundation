import React, { useState, useEffect } from "react";
import axios from "axios";

export default function DashboardContent() {
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalAmount: 0,
    cashDonations: 0,
    onlineDonations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get("/api/donations/all-records");
      const donations = response.data;

      let totalAmount = 0;
      let cashCount = 0;
      let onlineCount = 0;

      donations.forEach((donation) => {
        totalAmount += donation.amount || 0;
        if (donation.paymentMode === "CASH") cashCount++;
        if (donation.paymentMode === "ONLINE") onlineCount++;
      });

      setStats({
        totalDonations: donations.length,
        totalAmount,
        cashDonations: cashCount,
        onlineDonations: onlineCount,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-content">
      <h2 className="content-title">Dashboard Overview</h2>
      <p className="content-subtitle">
        Real-time statistics and insights of donor management system
      </p>

      {loading ? (
        <div className="loading-spinner">Loading statistics...</div>
      ) : (
        <div className="stats-grid">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <p className="stat-label">Total Donations</p>
              <h3 className="stat-value">{stats.totalDonations}</h3>
              <p className="stat-description">Donor records</p>
            </div>
          </div>

          <div className="stat-card stat-card-success">
            <div className="stat-icon">💵</div>
            <div className="stat-content">
              <p className="stat-label">Total Amount</p>
              <h3 className="stat-value">
                ₹{stats.totalAmount.toLocaleString()}
              </h3>
              <p className="stat-description">Collected so far</p>
            </div>
          </div>

          <div className="stat-card stat-card-warning">
            <div className="stat-icon">🏧</div>
            <div className="stat-content">
              <p className="stat-label">Cash Donations</p>
              <h3 className="stat-value">{stats.cashDonations}</h3>
              <p className="stat-description">Offline entries</p>
            </div>
          </div>

          <div className="stat-card stat-card-info">
            <div className="stat-icon">💳</div>
            <div className="stat-content">
              <p className="stat-label">Online Donations</p>
              <h3 className="stat-value">{stats.onlineDonations}</h3>
              <p className="stat-description">Razorpay payments</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <a href="#data-insert" className="action-btn action-btn-primary">
            ➕ Add New Donation
          </a>
          <a href="#data-view" className="action-btn action-btn-secondary">
            👁️ View All Records
          </a>
          <a href="#settings" className="action-btn action-btn-tertiary">
            ⚙️ System Settings
          </a>
        </div>
      </div>
    </div>
  );
}
