import React, { useState } from "react";
import axios from "axios";
import { downloadFile } from "../utils/downloadHelper";

export default function AdminCashEntry({ onRecordAdded }) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [lastSaved, setLastSaved] = useState(null);
  const [cashRecord, setCashRecord] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    panNo: "",
    amount: "",
    donationDate: new Date().toISOString().split("T")[0],
    gatewayName: "CASH",
    referenceNumber: "",
  });

  const validateForm = () => {
    const newErrors = {};
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

    if (!cashRecord.name.trim()) newErrors.name = "Name is required";
    if (!cashRecord.email.trim()) newErrors.email = "Email is required";
    if (!cashRecord.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      newErrors.email = "Invalid email format";
    if (!cashRecord.phone.trim()) newErrors.phone = "Phone is required";
    if (!cashRecord.address.trim()) newErrors.address = "Address is required";
    if (cashRecord.panNo.trim()) {
      if (!panRegex.test(cashRecord.panNo.toUpperCase()))
        newErrors.panNo = "Invalid PAN format (e.g., ABCDE1234F)";
    }
    if (!cashRecord.amount || parseFloat(cashRecord.amount) <= 0)
      newErrors.amount = "Amount must be > 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveRecord = async (keepValues = false) => {
    if (!validateForm()) return false;
    setLoading(true);
    try {
      const { data } = await axios.post("/api/donations/record-cash", {
        name: cashRecord.name,
        email: cashRecord.email,
        phone: cashRecord.phone,
        address: cashRecord.address,
        panNo: cashRecord.panNo,
        amount: cashRecord.amount,
        donationDate: cashRecord.donationDate,
        paymentMode: cashRecord.gatewayName === "CASH" ? "CASH" : "ONLINE",
        gatewayName: cashRecord.gatewayName,
        txnId: cashRecord.referenceNumber,
      });

      if (data.success) {
        alert("✅ Donation recorded successfully!");
        
        if (onRecordAdded) {
          onRecordAdded();
        }

        setLastSaved({
          id: data.donationId,
          name: cashRecord.name,
          email: cashRecord.email,
          amount: cashRecord.amount
        });

        if (!keepValues) {
          // Clear form fully
          setCashRecord({
            name: "",
            email: "",
            phone: "",
            address: "",
            panNo: "",
            amount: "",
            donationDate: new Date().toISOString().split("T")[0],
            gatewayName: "CASH",
            referenceNumber: "",
          });
        } else {
          // Keep common values but clear reference number
          setCashRecord(prev => ({
            ...prev,
            referenceNumber: "",
          }));
        }
        setErrors({});
        return true;
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to record donation.");
    } finally {
      setLoading(false);
    }
    return false;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCashRecord({ ...cashRecord, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  return (
    <div className="cms-cash-card compact-card fade-in">
      {lastSaved && (
        <div className="last-saved-banner fade-in" style={{
          backgroundColor: "#F0FDF4",
          border: "1px solid #BBF7D0",
          borderRadius: "8px",
          padding: "1rem",
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem"
        }}>
          <div>
            <h4 style={{ margin: 0, color: "#166534", fontSize: "0.95rem" }}>
              ✅ Donation Saved: <strong>{lastSaved.name}</strong> (₹{lastSaved.amount})
            </h4>
            <p style={{ margin: "2px 0 0 0", color: "#1E3A8A", fontSize: "0.8rem" }}>
              Actions for this entry:
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => {
                const cleanName = lastSaved.name ? lastSaved.name.replace(/[^a-zA-Z0-9]/g, "_") : lastSaved.id;
                downloadFile(`/api/receipt/download-receipt/${lastSaved.id}`, `Donation_Receipt_${cleanName}.pdf`);
              }}
              className="action-btn-red"
              style={{ textDecoration: "none", fontSize: "0.85rem", padding: "6px 12px", borderRadius: "4px", border: "none", cursor: "pointer" }}
            >
              Generate Receipt
            </button>
            <button
              type="button"
              onClick={() => {
                const cleanName = lastSaved.name ? lastSaved.name.replace(/[^a-zA-Z0-9]/g, "_") : lastSaved.id;
                downloadFile(`/api/certificate/download-certificate/${lastSaved.id}`, `Donation_Certificate_${cleanName}.pdf`);
              }}
              className="action-btn-blue"
              style={{ textDecoration: "none", fontSize: "0.85rem", padding: "6px 12px", borderRadius: "4px", border: "none", cursor: "pointer" }}
            >
              Generate Certificate
            </button>
            <button
              type="button"
              disabled={loading || cashRecord.sendingEmail}
              onClick={async () => {
                setCashRecord(prev => ({ ...prev, sendingEmail: true }));
                try {
                  const { data } = await axios.post(`/api/receipt/email-receipt/${lastSaved.id}`);
                  if (data.success) {
                    alert("📧 Receipt emailed successfully to donor!");
                  }
                } catch (err) {
                  console.error(err);
                  const errMsg = err.response?.data?.message || "Failed to send email.";
                  const errDetails = err.response?.data?.error ? `\nDetails: ${err.response.data.error}` : "";
                  alert(`${errMsg}${errDetails}`);
                } finally {
                  setCashRecord(prev => ({ ...prev, sendingEmail: false }));
                }
              }}
              className="action-btn-green"
              style={{
                fontSize: "0.85rem",
                padding: "6px 12px",
                borderRadius: "4px",
                cursor: (loading || cashRecord.sendingEmail) ? "wait" : "pointer",
                border: "none",
                opacity: (loading || cashRecord.sendingEmail) ? 0.7 : 1,
                transition: "all 0.3s ease",
                backgroundColor: "#166534",
                color: "white"
              }}
              onMouseEnter={(e) => {
                if (!loading && !cashRecord.sendingEmail) e.target.style.backgroundColor = "#14532d";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#166534";
              }}
            >
              {cashRecord.sendingEmail ? "Sending..." : "Send Email"}
            </button>
            <button
              type="button"
              onClick={() => setLastSaved(null)}
              style={{
                background: "none",
                border: "none",
                fontSize: "1.2rem",
                color: "#9CA3AF",
                cursor: "pointer",
                padding: "0 5px"
              }}
              title="Close Banner"
            >
              ×
            </button>
          </div>
        </div>
      )}
      <form onSubmit={(e) => { e.preventDefault(); saveRecord(false); }} className="compact-form">
        <div className="compact-grid">
          {/* Row 1 */}
          <div className="form-group">
            <label>Full Name <span className="required">*</span></label>
            <input
              type="text"
              name="name"
              className={`form-input compact-input ${errors.name ? "input-error" : ""}`}
              placeholder="Full Name"
              value={cashRecord.name}
              onChange={handleInputChange}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label>Address <span className="required">*</span></label>
            <input
              type="text"
              name="address"
              className={`form-input compact-input ${errors.address ? "input-error" : ""}`}
              placeholder="Address"
              value={cashRecord.address}
              onChange={handleInputChange}
            />
            {errors.address && <span className="error-text">{errors.address}</span>}
          </div>

          {/* Row 2 */}
          <div className="form-group">
            <label>Amount <span className="required">*</span></label>
            <input
              type="number"
              name="amount"
              maxlength="10"
              className={`form-input compact-input ${errors.amount ? "input-error" : ""}`}
              placeholder="Amount"
              value={cashRecord.amount}
              onChange={handleInputChange}
            />
            {errors.amount && <span className="error-text">{errors.amount}</span>}
          </div>
          <div className="form-group">
            <label>Mobile Number <span className="required">*</span></label>
            <input
              type="tel"
              name="phone"
              maxLength="10"
              pattern="[0-9]*"
              className={`form-input compact-input ${errors.phone ? "input-error" : ""}`}
              placeholder="Mobile Number"
              value={cashRecord.phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                handleInputChange({ target: { name: "phone", value: val } });
              }}
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>

          {/* Row 3 */}
          <div className="form-group">
            <label>Email Id <span className="required">*</span></label>
            <input
              type="email"
              name="email"
              className={`form-input compact-input ${errors.email ? "input-error" : ""}`}
              placeholder="Email Id"
              value={cashRecord.email}
              onChange={handleInputChange}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label>Pan No.</label>
            <input
              type="text"
              name="panNo"
              className={`form-input compact-input ${errors.panNo ? "input-error" : ""}`}
              placeholder="Enter Your Pan No."
              value={cashRecord.panNo}
              onChange={(e) =>
                handleInputChange({
                  target: {
                    name: "panNo",
                    value: e.target.value.toUpperCase(),
                  },
                })
              }
            />
            {errors.panNo && <span className="error-text">{errors.panNo}</span>}
          </div>

          {/* Row 4 */}
          <div className="form-group">
            <label>Date <span className="required">*</span></label>
            <input
              type="date"
              name="donationDate"
              className="form-input compact-input"
              value={cashRecord.donationDate}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Mode of Payment <span className="required">*</span></label>
            <select
              name="gatewayName"
              className="form-input compact-input"
              value={cashRecord.gatewayName}
              onChange={handleInputChange}
            >
              <option value="CASH">Cash</option>
              <option value="UPI">UPI</option>
              <option value="CHEQUE">Cheque</option>
              <option value="BANK TRANSFER">Bank Transfer</option>
              <option value="NEFT">NEFT</option>
            </select>
          </div>

          {/* Row 5 */}
          <div className="form-group full-width">
            <label>Reference Number (Optional)</label>
            <input
              type="text"
              name="referenceNumber"
              className={`form-input compact-input ${errors.referenceNumber ? "input-error" : ""}`}
              placeholder="Reference Number / Txn ID (Optional)"
              value={cashRecord.referenceNumber}
              onChange={handleInputChange}
            />
            {errors.referenceNumber && <span className="error-text">{errors.referenceNumber}</span>}
          </div>
        </div>

        {/* Color-coded Action Buttons */}
        <div className="compact-actions">
          <button
            type="submit"
            disabled={loading}
            className="action-btn-red submit-btn"
          >
            {loading ? "..." : "✓ Save"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => saveRecord(false)}
            className="action-btn-blue submit-btn"
          >
            {loading ? "..." : "✓ Save & Next"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => saveRecord(true)}
            className="action-btn-green submit-btn"
          >
            {loading ? "..." : "✓ Save & Copy"}
          </button>
        </div>
      </form>
    </div>
  );
}
