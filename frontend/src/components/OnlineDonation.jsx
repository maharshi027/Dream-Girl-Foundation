import React, { useState } from "react";
import axios from "axios";

export default function OnlineDonation() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    panNo: "",
    amount: "",
  });
  const [loading, setLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [errors, setErrors] = useState({});
  const [successData, setSuccessData] = useState(null);

  // Simulation state
  const [simulationData, setSimulationData] = useState(null);
  const [showSimModal, setShowSimModal] = useState(false);

  const presetAmounts = [250, 500, 1000, 2500, 5000];

  const validateForm = () => {
    const newErrors = {};
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      newErrors.email = "Invalid email";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.panNo.trim()) newErrors.panNo = "PAN number is required";
    if (!panRegex.test(formData.panNo.toUpperCase()))
      newErrors.panNo = "Invalid PAN format";
    if (!formData.amount || parseFloat(formData.amount) <= 0)
      newErrors.amount = "Amount must be > 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePresetSelect = (amount) => {
    setSelectedPreset(amount);
    setFormData({ ...formData, amount: amount.toString() });
  };

  const handleAmountChange = (e) => {
    setSelectedPreset(null);
    setFormData({ ...formData, amount: e.target.value });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      // 1. Create order
      const { data } = await axios.post(
        "/api/donations/initiate-online",
        formData,
      );

      if (data.success) {
        if (data.simulation) {
          // Trigger developer simulation modal
          setSimulationData({
            order: data.order,
            donationId: data.donationId,
          });
          setShowSimModal(true);
        } else {
          // Real Razorpay flow
          const options = {
            key: "YOUR_RAZORPAY_KEY_ID",
            amount: data.order.amount,
            currency: "INR",
            name: "Dream Girl Foundation",
            description: "Girl Empowerment Initiatives",
            order_id: data.order.id,
            handler: async function (response) {
              try {
                const verifyRes = await axios.post(
                  "/api/donations/verify-online",
                  response,
                );
                if (verifyRes.data.success) {
                  setSuccessData({
                    donationId: verifyRes.data.donationId,
                  });
                  setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    address: "",
                    panNo: "",
                    amount: "",
                  });
                  setSelectedPreset(null);
                }
              } catch (err) {
                alert("Payment verification failed");
              }
            },
            prefill: {
              name: formData.name,
              email: formData.email,
              contact: formData.phone,
            },
            theme: { color: "#F43F5E" },
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        }
      }
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
          "Failed to initiate payment gateway connection.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Simulated validation loop
  const handleSimulatePayment = async (status) => {
    if (status === "cancel") {
      setShowSimModal(false);
      setSimulationData(null);
      alert("Payment simulation cancelled.");
      return;
    }

    setLoading(true);
    setShowSimModal(false);

    try {
      const mockPayload = {
        razorpay_order_id: simulationData.order.id,
        razorpay_payment_id:
          "pay_sim_" + Math.random().toString(36).substring(2, 10),
        razorpay_signature: "mock_signature_approved",
      };

      const verifyRes = await axios.post(
        "/api/donations/verify-online",
        mockPayload,
      );

      if (verifyRes.data.success) {
        setSuccessData({
          donationId: verifyRes.data.donationId,
        });
        setFormData({
          name: "",
          email: "",
          phone: "",
          address: "",
          panNo: "",
          amount: "",
        });
        setSelectedPreset(null);
      }
    } catch (error) {
      console.error(error);
      alert("Verification of simulated payment failed.");
    } finally {
      setLoading(false);
      setSimulationData(null);
    }
  };

  // Success screen with download options
  if (successData) {
    return (
      <div className="success-screen fade-in">
        <div className="success-card">
          <div className="success-icon">✅</div>
          <h2>Payment Successful!</h2>
          <p>Thank you for your generous donation to Dream Girl Foundation.</p>
          <p className="success-details">
            Your transaction has been completed and recorded securely.
          </p>

          <div className="download-actions">
            <a
              href={`${import.meta.env.VITE_APP_URL}/api/certificate/download-certificate/${successData.donationId}`}
              className="btn btn-download-certificate"
              download
            >
              🖨️ Download Tax Exemption Certificate
            </a>
          </div>

          <button
            className="btn btn-new-donation"
            onClick={() => setSuccessData(null)}
          >
            Make Another Donation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <form onSubmit={handlePaySubmit} className="donation-form fade-in">
        <h2>Make a Secure Contribution</h2>
        <p className="donation-form-subtitle">
          Your donation helps us provide education, nutrition, and medical help
          to underprivileged girls.
        </p>

        {/* AMOUNT SECTION */}
        <div className="form-section">
          <h4 className="section-title">💵 Donation Amount</h4>

          <div className="form-group">
            <label>Select Donation Amount (INR)</label>
            <div className="amount-selector">
              {presetAmounts.map((amt) => (
                <div
                  key={amt}
                  className={`amount-chip ${selectedPreset === amt ? "selected" : ""}`}
                  onClick={() => handlePresetSelect(amt)}
                >
                  ₹{amt}
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="custom-amount">
              Or Enter Custom Amount (INR) *
            </label>
            <div className="input-icon-wrapper">
              <span className="input-icon">₹</span>
              <input
                id="custom-amount"
                type="number"
                className={`form-input form-input-with-icon ${errors.amount ? "input-error" : ""}`}
                placeholder="Other amount..."
                name="amount"
                value={formData.amount}
                onChange={handleAmountChange}
                required
                min="1"
              />
            </div>
            {errors.amount && (
              <span className="error-text">{errors.amount}</span>
            )}
          </div>
        </div>

        {/* DONOR INFORMATION SECTION */}
        <div className="form-section">
          <h4 className="section-title">👤 Your Information</h4>

          <div className="form-group">
            <label htmlFor="donor-name">Full Name *</label>
            <div className="input-icon-wrapper">
              <span className="input-icon">👤</span>
              <input
                id="donor-name"
                type="text"
                className={`form-input form-input-with-icon ${errors.name ? "input-error" : ""}`}
                placeholder="Enter full name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="donor-email">Email Address *</label>
            <div className="input-icon-wrapper">
              <span className="input-icon">✉️</span>
              <input
                id="donor-email"
                type="email"
                className={`form-input form-input-with-icon ${errors.email ? "input-error" : ""}`}
                placeholder="donor@example.com"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="donor-phone">Phone Number *</label>
            <div className="input-icon-wrapper">
              <span className="input-icon">📞</span>
              <input
                id="donor-phone"
                type="tel"
                className={`form-input form-input-with-icon ${errors.phone ? "input-error" : ""}`}
                placeholder="+91 XXXXX XXXXX"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="donor-address">Address *</label>
            <textarea
              id="donor-address"
              className={`form-input form-textarea ${errors.address ? "input-error" : ""}`}
              placeholder="Enter complete address"
              name="address"
              rows="2"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
            {errors.address && (
              <span className="error-text">{errors.address}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="donor-pan">PAN Number *</label>
            <input
              id="donor-pan"
              type="text"
              className={`form-input ${errors.panNo ? "input-error" : ""}`}
              placeholder="ABCDE1234F"
              name="panNo"
              value={formData.panNo}
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
            {errors.panNo && <span className="error-text">{errors.panNo}</span>}
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-donate-submit"
          disabled={loading}
        >
          {loading
            ? "Processing Securely..."
            : `Proceed to Payment: ₹${formData.amount || "0"}`}
        </button>
      </form>

      {/* Simulated Razorpay Checkout Modal (Developer Sandbox) */}
      {showSimModal && simulationData && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: "440px" }}>
            <div className="simulation-banner">
              <div className="simulation-banner-title">
                <span>🛠️</span> Sandbox Mode (Simulation Active)
              </div>
              <div>
                Razorpay credentials are not defined in the environment. We have
                triggered a mock payment sequence.
              </div>
            </div>

            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>💳</div>
              <h3 style={{ fontSize: "1.25rem" }}>
                Simulated Checkout Gateway
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-light)" }}>
                Testing secure payment execution loop for Dream Girl Foundation.
              </p>
            </div>

            <div
              style={{
                backgroundColor: "var(--light-gray)",
                padding: "1rem",
                borderRadius: "8px",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.9rem",
                  marginBottom: "0.5rem",
                }}
              >
                <span>Order ID:</span>
                <strong
                  style={{ fontSize: "0.75rem", fontFamily: "monospace" }}
                >
                  {simulationData.order.id}
                </strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.9rem",
                  marginBottom: "0.5rem",
                }}
              >
                <span>Recipient:</span>
                <strong>Dream Girl Foundation</strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.9rem",
                  borderTop: "1px solid var(--border)",
                  paddingTop: "0.5rem",
                  marginTop: "0.5rem",
                }}
              >
                <span>Total Amount:</span>
                <strong style={{ color: "var(--primary)" }}>
                  ₹{simulationData.order.amount / 100}
                </strong>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handleSimulatePayment("cancel")}
                style={{ justifyContent: "center" }}
              >
                Decline Test
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleSimulatePayment("success")}
                style={{
                  justifyContent: "center",
                  backgroundColor: "var(--success)",
                }}
              >
                Approve Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
