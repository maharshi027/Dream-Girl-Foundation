import React, { useState } from "react";
import axios from "axios";

export default function AdminCashEntry({ onRecordAdded }) {
  const [searchMobile, setSearchMobile] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [cashRecord, setCashRecord] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    panNo: "",
    amount: "",
    donationDate: new Date().toISOString().split("T")[0],
    txnId: "",
    user: "Admin",
    type: "HEALTH CARE",
    gatewayName: "CASH",
    claimStatus: "PENDING",
    paymentStatus: "SUCCESS",
    orderId: "",
    additionalInfo: "",
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
    if (!cashRecord.panNo.trim()) newErrors.panNo = "PAN is required";
    if (!panRegex.test(cashRecord.panNo.toUpperCase()))
      newErrors.panNo = "Invalid PAN format (e.g., ABCDE1234F)";
    if (!cashRecord.amount || parseFloat(cashRecord.amount) <= 0)
      newErrors.amount = "Amount must be > 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = async () => {
    if (!searchMobile.trim()) {
      alert("Please enter a mobile number to search.");
      return;
    }
    setSearchLoading(true);
    try {
      const { data } = await axios.get("/api/donations/all-records");
      const matched = data.find(
        (record) =>
          record.donorPhone &&
          record.donorPhone.replace(/\D/g, "").includes(searchMobile.replace(/\D/g, ""))
      );
      if (matched) {
        setCashRecord((prev) => ({
          ...prev,
          name: matched.donorName,
          email: matched.donorEmail,
          phone: matched.donorPhone,
          address: matched.donorAddress || matched.address || "",
          panNo: matched.panNo || "",
        }));
        alert(`🔍 Found donor: ${matched.donorName}. Form details pre-filled.`);
      } else {
        alert("No donor record found with this mobile number.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to search donor database.");
    } finally {
      setSearchLoading(false);
    }
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
        txnId: cashRecord.txnId,
        user: cashRecord.user,
        type: cashRecord.type,
        gatewayName: cashRecord.gatewayName,
        claimStatus: cashRecord.claimStatus,
        paymentStatus: cashRecord.paymentStatus,
        orderId: cashRecord.orderId,
        additionalInfo: cashRecord.additionalInfo,
      });

      if (data.success) {
        alert("✅ Donation recorded successfully!");
        
        if (onRecordAdded) {
          onRecordAdded();
        }

        // Trigger PDF generation downloads
        window.open(
          `${import.meta.env.VITE_APP_URL}/api/receipt/download-receipt/${data.donationId}`,
          "_blank"
        );
        setTimeout(() => {
          window.open(
            `${import.meta.env.VITE_APP_URL}/api/certificate/download-certificate/${data.donationId}`,
            "_blank"
          );
        }, 600);

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
            txnId: "",
            user: "Admin",
            type: "HEALTH CARE",
            gatewayName: "CASH",
            claimStatus: "PENDING",
            paymentStatus: "SUCCESS",
            orderId: "",
            additionalInfo: "",
          });
          setSearchMobile("");
        } else {
          // Keep structure, clear TXN ID/Order ID for new entry
          setCashRecord((prev) => ({
            ...prev,
            txnId: "",
            orderId: "",
          }));
        }
        setErrors({});
        return true;
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to record donation record.");
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
      {/* Top Search Block */}
      <div className="compact-search-row">
        <input
          type="text"
          className="form-input search-input"
          placeholder="Enter mobile no"
          value={searchMobile}
          onChange={(e) => setSearchMobile(e.target.value)}
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={searchLoading}
          className="search-btn-red"
        >
          {searchLoading ? "..." : "🔍 Search"}
        </button>
      </div>

      {/* Grid Layout form */}
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
              type="text"
              name="phone"
              className={`form-input compact-input ${errors.phone ? "input-error" : ""}`}
              placeholder="Mobile Number"
              value={cashRecord.phone}
              onChange={handleInputChange}
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
            <label>Pan No. <span className="required">*</span></label>
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
            <label>TXN ID</label>
            <input
              type="text"
              name="txnId"
              className="form-input compact-input"
              placeholder="Transaction ID (Auto-generated if empty)"
              value={cashRecord.txnId}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>User</label>
            <select
              name="user"
              className="form-input compact-input select-input"
              value={cashRecord.user}
              onChange={handleInputChange}
            >
              <option value="Admin">Admin</option>
              <option value="Staff">Staff</option>
              <option value="Volunteer">Volunteer</option>
            </select>
          </div>

          {/* Row 5 */}
          <div className="form-group">
            <label>Type</label>
            <select
              name="type"
              className="form-input compact-input select-input"
              value={cashRecord.type}
              onChange={handleInputChange}
            >
              <option value="HEALTH CARE">HEALTH CARE</option>
              <option value="EDUCATION">EDUCATION</option>
              <option value="NUTRITION">NUTRITION</option>
              <option value="GENERAL">GENERAL</option>
            </select>
          </div>
          <div className="form-group">
            <label>Gateway Name</label>
            <select
              name="gatewayName"
              className="form-input compact-input select-input"
              value={cashRecord.gatewayName}
              onChange={handleInputChange}
            >
              <option value="CASH">CASH</option>
              <option value="GOOGLE PAY">GOOGLE PAY</option>
              <option value="PHONEPE">PHONEPE</option>
              <option value="PAYTM">PAYTM</option>
              <option value="NEFT/IMPS">NEFT/IMPS</option>
              <option value="RAZORPAY">RAZORPAY</option>
            </select>
          </div>

          {/* Row 6 */}
          <div className="form-group">
            <label>Claim Status</label>
            <select
              name="claimStatus"
              className="form-input compact-input select-input"
              value={cashRecord.claimStatus}
              onChange={handleInputChange}
            >
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>
          <div className="form-group">
            <label>Payment Status</label>
            <select
              name="paymentStatus"
              className="form-input compact-input select-input"
              value={cashRecord.paymentStatus}
              onChange={handleInputChange}
            >
              <option value="SUCCESS">SUCCESS</option>
              <option value="PENDING">PENDING</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>

          {/* Row 7 */}
          <div className="form-group">
            <label>Order ID</label>
            <input
              type="text"
              name="orderId"
              className="form-input compact-input"
              placeholder="Order ID (Auto-generated if empty)"
              value={cashRecord.orderId}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="donationDate"
              className="form-input compact-input"
              value={cashRecord.donationDate}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        {/* Row 8 */}
        <div className="form-group full-width">
          <label>Additional Information</label>
          <textarea
            name="additionalInfo"
            className="form-input compact-textarea"
            rows="2"
            placeholder="Additional Information"
            value={cashRecord.additionalInfo}
            onChange={handleInputChange}
          />
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
