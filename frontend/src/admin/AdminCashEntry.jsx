import React, { useState } from "react";
import axios from "axios";

export default function AdminCashEntry({ onRecordAdded }) {
  const [cashRecord, setCashRecord] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    panNo: "",
    amount: "",
    donationDate: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

    if (!cashRecord.name.trim()) newErrors.name = "Name is required";
    if (!cashRecord.email.trim()) newErrors.email = "Email is required";
    if (!cashRecord.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      newErrors.email = "Invalid email format";
    if (!cashRecord.phone.trim()) newErrors.phone = "Phone number is required";
    if (!cashRecord.address.trim()) newErrors.address = "Address is required";
    if (!cashRecord.panNo.trim()) newErrors.panNo = "PAN number is required";
    if (!panRegex.test(cashRecord.panNo.toUpperCase()))
      newErrors.panNo = "Invalid PAN format (e.g., ABCDE1234F)";
    if (!cashRecord.amount || parseFloat(cashRecord.amount) <= 0)
      newErrors.amount = "Amount must be greater than 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

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
      });

      if (data.success) {
        alert("✅ Cash Donation Recorded Successfully!");
        // Clear form
        setCashRecord({
          name: "",
          email: "",
          phone: "",
          address: "",
          panNo: "",
          amount: "",
          donationDate: new Date().toISOString().split("T")[0],
        });
        setErrors({});
        e.target.reset();

        // Trigger list refresh in parent dashboard
        if (onRecordAdded) {
          onRecordAdded();
        }

        // Open both receipt and certificate
        window.open(
          `${import.meta.env.VITE_APP_URL}/api/receipt/download-receipt/${data.donationId}`,
          "_blank",
        );
        setTimeout(() => {
          window.open(
            `${import.meta.env.VITE_APP_URL}/api/certificate/download-certificate/${data.donationId}`,
            "_blank",
          );
        }, 500);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error saving cash entry to DB");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCashRecord({ ...cashRecord, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  return (
    <div className="cms-cash-card fade-in">
      <div className="cms-card-header">
        <h3>💰 Record Cash Collection</h3>
        <p>Log offline in-hand donations with complete donor details</p>
      </div>

      <form onSubmit={handleManualSubmit} className="cms-form">
        {/* DONOR INFORMATION SECTION */}
        <div className="form-section">
          <h4 className="section-title">👤 Donor Information</h4>
          <div className="form-grid-2">
            <div className="form-group">
              <label>
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                className={`form-input ${errors.name ? "input-error" : ""}`}
                placeholder="John Doe"
                name="name"
                value={cashRecord.name}
                onChange={handleInputChange}
                required
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>
                Email Address <span className="required">*</span>
              </label>
              <input
                type="email"
                className={`form-input ${errors.email ? "input-error" : ""}`}
                placeholder="john@example.com"
                name="email"
                value={cashRecord.email}
                onChange={handleInputChange}
                required
              />
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label>
                Phone Number <span className="required">*</span>
              </label>
              <input
                type="tel"
                className={`form-input ${errors.phone ? "input-error" : ""}`}
                placeholder="+91 XXXXX XXXXX"
                name="phone"
                value={cashRecord.phone}
                onChange={handleInputChange}
                required
              />
              {errors.phone && (
                <span className="error-text">{errors.phone}</span>
              )}
            </div>

            <div className="form-group">
              <label>
                PAN Number <span className="required">*</span>
              </label>
              <input
                type="text"
                className={`form-input ${errors.panNo ? "input-error" : ""}`}
                placeholder="ABCDE1234F"
                name="panNo"
                value={cashRecord.panNo}
                onChange={(e) =>
                  handleInputChange({
                    target: {
                      name: "panNo",
                      value: e.target.value.toUpperCase(),
                    },
                  })
                }
                required
              />
              {errors.panNo && (
                <span className="error-text">{errors.panNo}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>
              Address <span className="required">*</span>
            </label>
            <textarea
              className={`form-input form-textarea ${
                errors.address ? "input-error" : ""
              }`}
              placeholder="Enter complete address"
              name="address"
              rows="3"
              value={cashRecord.address}
              onChange={handleInputChange}
              required
            />
            {errors.address && (
              <span className="error-text">{errors.address}</span>
            )}
          </div>
        </div>

        {/* PAYMENT INFORMATION SECTION */}
        <div className="form-section">
          <h4 className="section-title">💵 Payment Information</h4>
          <div className="form-grid-2">
            <div className="form-group">
              <label>
                Donation Amount (INR) <span className="required">*</span>
              </label>
              <input
                type="number"
                className={`form-input ${errors.amount ? "input-error" : ""}`}
                placeholder="e.g. 5000"
                name="amount"
                value={cashRecord.amount}
                onChange={handleInputChange}
                required
                min="1"
                step="0.01"
              />
              {errors.amount && (
                <span className="error-text">{errors.amount}</span>
              )}
            </div>

            <div className="form-group">
              <label>
                Date <span className="required">*</span>
              </label>
              <input
                type="date"
                className="form-input"
                name="donationDate"
                value={cashRecord.donationDate}
                onChange={handleInputChange}
                required
              />
              <small className="helper-text">
                Auto-filled with current date
              </small>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-save-cash"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span> Processing...
              </>
            ) : (
              "Submit"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
