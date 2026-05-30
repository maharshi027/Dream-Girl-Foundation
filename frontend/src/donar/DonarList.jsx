// src/donar/DonarList.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function DonarList() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("date-desc");

  // Edit modal state
  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm, setEditForm] = useState({
    donorName: "",
    donorEmail: "",
    donorPhone: "",
    amount: "",
    paymentMode: "",
    paymentStatus: "",
    address: "",
    panNo: "",
    txnId: "",
    user: "",
    type: "",
    gatewayName: "",
    claimStatus: "",
    orderId: "",
    date: "",
    additionalInfo: "",
  });

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/donations/all-records");
      setDonations(response.data);
    } catch (error) {
      console.error("Error fetching donor history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete this donor record?",
      )
    ) {
      try {
        await axios.delete(`/api/donations/delete/${id}`);
        alert("Record deleted successfully.");
        fetchDonations();
      } catch (err) {
        console.error(err);
        alert("Failed to delete record.");
      }
    }
  };

  const handleEditClick = (record) => {
    setEditingRecord(record);
    setEditForm({
      donorName: record.donorName,
      donorEmail: record.donorEmail,
      donorPhone: record.donorPhone || "",
      amount: record.amount,
      paymentMode: record.paymentMode,
      paymentStatus: record.paymentStatus,
      address: record.address || "",
      panNo: record.panNo || "",
      txnId: record.txnId || "",
      user: record.user || "",
      type: record.type || "",
      gatewayName: record.gatewayName || "",
      claimStatus: record.claimStatus || "",
      orderId: record.orderId || "",
      date: record.date || "",
      additionalInfo: record.additionalInfo || "",
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(
        `/api/donations/update/${editingRecord._id}`,
        editForm,
      );
      if (data.success) {
        alert("Record updated successfully!");
        setEditingRecord(null);
        fetchDonations();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update donor record.");
    }
  };

  // Metrics calculations (Only on successful transactions)
  const successfulDonations = donations.filter(
    (d) => d.paymentStatus === "SUCCESS",
  );
  const totalRaised = successfulDonations.reduce(
    (acc, curr) => acc + curr.amount,
    0,
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

  // Filtering & Sorting logic
  const filteredDonations = donations
    .filter((d) => {
      const matchSearch =
        d.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.donorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.donorPhone && d.donorPhone.includes(searchTerm));

      const matchMode = filterMode === "ALL" || d.paymentMode === filterMode;
      const matchStatus =
        filterStatus === "ALL" || d.paymentStatus === filterStatus;

      return matchSearch && matchMode && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "date-desc") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === "date-asc") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === "amount-desc") {
        return b.amount - a.amount;
      } else if (sortBy === "amount-asc") {
        return a.amount - b.amount;
      }
      return 0;
    });

  if (loading && donations.length === 0) {
    return (
      <div
        className="cms-loading"
        style={{ textAlign: "center", padding: "3rem" }}
      >
        Loading Donor Records Database...
      </div>
    );
  }

  return (
    <div className="cms-container fade-in">
      {/* Main Database Table Panel */}
      <div className="cms-records-panel">
        <div className="cms-toolbar">
          <div className="cms-search-wrapper">
            <input
              type="text"
              placeholder="Search donor name, email or contact..."
              className="form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingRight: "2.5rem" }}
            />
            <span
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-light)",
              }}
            >
              🔍
            </span>
          </div>

          <select
            className="cms-toolbar-select"
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
          >
            <option value="ALL">All Modes</option>
            <option value="CASH">Cash Only</option>
            <option value="ONLINE">Online Only</option>
          </select>

          <select
            className="cms-toolbar-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="SUCCESS">Success</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>

          <select
            className="cms-toolbar-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
        </div>

        <div className="cms-table-container">
          {filteredDonations.length === 0 ? (
            <div className="cms-empty-state">
              <div className="cms-empty-icon">📁</div>
              <h3>No donor records match your parameters</h3>
              <p>
                Try refining your search or log a cash entry on the right pane.
              </p>
            </div>
          ) : (
            <table className="cms-table">
              <thead>
                <tr>
                  <th>Donor Profile</th>
                  <th>Contact & Address</th>
                  <th>Amount & Date</th>
                  <th>Payment Details</th>
                  <th>Tax & Claim Info</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.map((d) => (
                  <tr key={d._id} className="fade-in">
                    <td>
                      <div className="donor-name-cell">{d.donorName}</div>
                      <div className="donor-subinfo">{d.donorEmail}</div>
                    </td>
                    <td>
                      {d.donorPhone && (
                        <div className="donor-subinfo">📞 {d.donorPhone}</div>
                      )}
                      {d.address && (
                        <div
                          className="donor-subinfo"
                          style={{ fontSize: "0.75rem" }}
                        >
                          📍 {d.address.substring(0, 30)}...
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="amount-cell">₹{d.amount}</div>
                      <div
                        className="donor-subinfo"
                        style={{ fontSize: "0.75rem" }}
                      >
                        {d.date ||
                          new Date(d.createdAt).toLocaleDateString("en-IN")}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge badge-${d.paymentMode.toLowerCase()}`}
                      >
                        {d.paymentMode === "CASH" ? "💵 Cash" : "🌐 Online"}
                      </span>
                      <br />
                      <span
                        className={`badge badge-${d.paymentStatus.toLowerCase()}`}
                        style={{ marginTop: "0.3rem" }}
                      >
                        {d.paymentStatus}
                      </span>
                    </td>
                    <td>
                      {d.panNo && (
                        <div className="donor-subinfo">PAN: {d.panNo}</div>
                      )}
                      {d.claimStatus && (
                        <div className="donor-subinfo">
                          Claim: {d.claimStatus}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="cms-actions">
                        {d.paymentStatus === "SUCCESS" ? (
                          <a
                            href={`${import.meta.env.VITE_APP_URL}/api/certificate/download-certificate/${d._id}`}
                            className="action-btn action-btn-print"
                            title="Download Certificate"
                            target="_blank"
                            rel="noreferrer"
                          >
                            🖨️
                          </a>
                        ) : (
                          <button
                            className="action-btn"
                            style={{ opacity: 0.3, cursor: "not-allowed" }}
                            disabled
                          >
                            🖨️
                          </button>
                        )}
                        <button
                          className="action-btn action-btn-edit"
                          title="Edit Record"
                          onClick={() => handleEditClick(d)}
                        >
                          ✏️
                        </button>
                        <button
                          className="action-btn action-btn-delete"
                          title="Delete Record"
                          onClick={() => handleDelete(d._id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingRecord && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Donor Record</h3>
              <button
                className="modal-close-btn"
                onClick={() => setEditingRecord(null)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              {/* Basic Info */}
              <div className="form-group">
                <label>Donor Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.donorName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, donorName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={editForm.donorEmail}
                  onChange={(e) =>
                    setEditForm({ ...editForm, donorEmail: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Contact Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.donorPhone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, donorPhone: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea
                  className="form-input"
                  rows="2"
                  value={editForm.address}
                  onChange={(e) =>
                    setEditForm({ ...editForm, address: e.target.value })
                  }
                />
              </div>

              {/* Payment Info */}
              <div className="form-group">
                <label>Donation Amount (INR)</label>
                <input
                  type="number"
                  className="form-input"
                  value={editForm.amount}
                  onChange={(e) =>
                    setEditForm({ ...editForm, amount: e.target.value })
                  }
                  required
                />
              </div>
              <div
                className="form-group"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <label>Mode</label>
                  <select
                    className="form-input"
                    value={editForm.paymentMode}
                    onChange={(e) =>
                      setEditForm({ ...editForm, paymentMode: e.target.value })
                    }
                  >
                    <option value="CASH">CASH</option>
                    <option value="ONLINE">ONLINE</option>
                  </select>
                </div>
                <div>
                  <label>Status</label>
                  <select
                    className="form-input"
                    value={editForm.paymentStatus}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        paymentStatus: e.target.value,
                      })
                    }
                  >
                    <option value="SUCCESS">SUCCESS</option>
                    <option value="PENDING">PENDING</option>
                    <option value="FAILED">FAILED</option>
                  </select>
                </div>
              </div>

              {/* Tax & Transaction Info */}
              <div className="form-group">
                <label>PAN Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.panNo}
                  onChange={(e) =>
                    setEditForm({ ...editForm, panNo: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Transaction ID</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.txnId}
                  onChange={(e) =>
                    setEditForm({ ...editForm, txnId: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Order ID</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.orderId}
                  onChange={(e) =>
                    setEditForm({ ...editForm, orderId: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Payment Type</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.type}
                  onChange={(e) =>
                    setEditForm({ ...editForm, type: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Gateway Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.gatewayName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, gatewayName: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Claim Status</label>
                <select
                  className="form-input"
                  value={editForm.claimStatus}
                  onChange={(e) =>
                    setEditForm({ ...editForm, claimStatus: e.target.value })
                  }
                >
                  <option value="">Select Status</option>
                  <option value="PENDING">PENDING</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>
              <div className="form-group">
                <label>User Reference</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.user}
                  onChange={(e) =>
                    setEditForm({ ...editForm, user: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={editForm.date}
                  onChange={(e) =>
                    setEditForm({ ...editForm, date: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Additional Information</label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={editForm.additionalInfo}
                  onChange={(e) =>
                    setEditForm({ ...editForm, additionalInfo: e.target.value })
                  }
                />
              </div>

              <div className="modal-buttons">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingRecord(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
