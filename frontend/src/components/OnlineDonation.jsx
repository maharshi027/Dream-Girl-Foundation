import React, { useState, useEffect } from "react";
import axios from "axios";
import logoImg from "../assets/logo.png";
import { downloadFile } from "../utils/downloadHelper";

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
  const [receiptDetails, setReceiptDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Simulation state
  const [simulationData, setSimulationData] = useState(null);
  const [showSimModal, setShowSimModal] = useState(false);

  useEffect(() => {
    if (successData?.donationId) {
      const fetchReceiptDetails = async () => {
        setLoadingDetails(true);
        try {
          const { data } = await axios.get(
            `/api/receipt/receipt-details/${successData.donationId}`
          );
          if (data.success) {
            setReceiptDetails(data.receipt);
          }
        } catch (error) {
          console.error("Error fetching receipt details:", error);
        } finally {
          setLoadingDetails(false);
        }
      };

      fetchReceiptDetails();

      // Automatically download certificate when transaction is successful
      const autoDownload = () => {
        // Wait 1 second (1000ms) to allow the success screen to fully mount and browser state to settle
        setTimeout(async () => {
          await downloadFile(
            `/api/certificate/download-certificate/${successData.donationId}`,
            `Donation_Certificate_${successData.donationId}.pdf`
          );
        }, 1000);
      };

      autoDownload();
    } else {
      setReceiptDetails(null);
    }
  }, [successData]);

  const presetAmounts = [250, 500, 1000, 2500, 5000];

  const validateForm = () => {
    const newErrors = {};
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      newErrors.email = "Invalid email";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (formData.panNo.trim()) {
      if (!panRegex.test(formData.panNo.toUpperCase()))
        newErrors.panNo = "Invalid PAN format";
    }
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
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: data.order.amount,
            currency: "INR",
            name: "Look For Child Foundation",
            description: "Child Empowerment Initiatives",
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
            theme: { color: "#2563EB" }, // Unified deep blue theme
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
      <div className="success-screen fade-in" style={{ textAlign: "center" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto", padding: "1rem" }}>
          <div className="success-icon" style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🎉</div>
          <h2>Payment Successful!</h2>
          <p style={{ color: "var(--text-light)", marginBottom: "1rem" }}>
            Thank you for your generous contribution to Look For Child Foundation.
          </p>
          <p className="success-details" style={{ fontSize: "0.9rem", color: "var(--text-light)" }}>
            Your transaction has been securely processed and recorded.
            Your certificate is being downloaded automatically. If it didn't start, please{" "}
            <button
              onClick={() => {
                const cleanName = receiptDetails?.donorName ? receiptDetails.donorName.replace(/[^a-zA-Z0-9]/g, "_") : successData.donationId;
                downloadFile(
                  `/api/certificate/download-certificate/${successData.donationId}`,
                  `Donation_Certificate_${cleanName}.pdf`
                );
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--primary)",
                fontWeight: "bold",
                textDecoration: "underline",
                cursor: "pointer",
                padding: 0,
                fontFamily: "inherit",
                fontSize: "inherit"
              }}
            >
              click here to download certificate
            </button>.
          </p>

          {loadingDetails ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-light)" }}>
              <div className="spinner" style={{ margin: "0 auto 1rem auto", width: "40px", height: "40px", border: "4px solid rgba(0,0,0,0.1)", borderLeftColor: "var(--primary)", borderRadius: "50%" }}></div>
              Loading Receipt Details...
            </div>
          ) : receiptDetails ? (
            <div className="receipt-paper">
              <div className="receipt-header" style={{ textAlign: "center", marginBottom: "1rem" }}>
                <img src={logoImg} alt="Look For Child Foundation Logo" style={{ width: "100px", height: "auto", marginBottom: "0.5rem", display: "block", marginLeft: "auto", marginRight: "auto" }} />
                <h3 className="receipt-logo-text" style={{ margin: "5px 0" }}>Look For Child Foundation</h3>
                <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0, fontFamily: "sans-serif" }}>Project JEEVAN</p>
                <div className="receipt-divider"></div>
              </div>

              <div className="receipt-meta">
                <span>Ref No: {receiptDetails.receiptNumber}</span>
                <span>Date: {new Date(receiptDetails.donationDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-")}</span>
              </div>

              <div className="receipt-body">
                <p>To,</p>
                <p><strong>{receiptDetails.donorName}</strong></p>
                <p style={{ whiteSpace: "pre-line", maxWidth: "320px", margin: 0 }}>{receiptDetails.donorAddress}</p>
                
                <p style={{ marginTop: "1rem", marginBottom: "0.5rem" }}>Dear Sir/Madam,</p>
                <p style={{ textIndent: "1.5rem", margin: "0.5rem 0" }}>
                  This is to inform you that your donation has been successfully received.
                </p>
                <p style={{ textIndent: "1.5rem", margin: "0.5rem 0" }}>
                  We at Look4Child Foundation show our absolute gratitude towards the donation made by you for saving a life of a child. Efforts made by you and us will surely bring bright change in one's life.
                </p>
                <p style={{ textIndent: "1.5rem", margin: "0.5rem 0" }}>
                  Thanks for being a part of our project JEEVAN. Indeed it feels great to be a reason for others smiles.
                </p>
                
                <p style={{ marginTop: "1.25rem", marginBottom: 0 }}>With Warm Regards,</p>
                <p><strong>Team Look For Child Foundation.</strong></p>
              </div>

              <h4 style={{ textAlign: "center", textDecoration: "underline", margin: "1.5rem 0 0.75rem 0", fontFamily: "Times-Bold", fontSize: "1.05rem" }}>Donation Details</h4>

              <table className="receipt-table">
                <tbody>
                  <tr>
                    <th>Donation Number:</th>
                    <td>{receiptDetails.receiptNumber}</td>
                  </tr>
                  <tr>
                    <th>Donation Date:</th>
                    <td>{new Date(receiptDetails.donationDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-")}</td>
                  </tr>
                  <tr>
                    <th>Donation Status:</th>
                    <td style={{ color: "green", fontWeight: "bold" }}>
                      {receiptDetails.paymentStatus === "SUCCESS" ? "Paid" : receiptDetails.paymentStatus}
                    </td>
                  </tr>
                  <tr>
                    <th>Received with thanks from:</th>
                    <td>{receiptDetails.donorName}</td>
                  </tr>
                  <tr>
                    <th>Address:</th>
                    <td>{receiptDetails.donorAddress}</td>
                  </tr>
                  <tr>
                    <th>E-mail:</th>
                    <td>{receiptDetails.donorEmail}</td>
                  </tr>
                  <tr>
                    <th>PAN No:</th>
                    <td>{receiptDetails.panNo || "N/A"}</td>
                  </tr>
                  <tr>
                    <th>Phone Number:</th>
                    <td>{receiptDetails.donorPhone}</td>
                  </tr>
                  <tr>
                    <th>Payment Mode:</th>
                    <td>{receiptDetails.paymentMode || "ONLINE"}</td>
                  </tr>
                  <tr>
                    <th>Reference Number:</th>
                    <td>{receiptDetails.transactionId || "N/A"}</td>
                  </tr>
                  <tr>
                    <th>Amount:</th>
                    <td className="receipt-amount">INR {receiptDetails.amount}/-</td>
                  </tr>
                </tbody>
              </table>

              <div className="receipt-footer-meta">
                <span>For: Look4Child Foundation.</span>
                <span>PAN: AAAAL4939Q</span>
              </div>

              <div className="receipt-office-footer">
                Regd. Office: Room No.1, Opp. Sarpanch Anant House, Tigra Village, Sec-57, Gurgaon<br />
                Phone: +91 98998 18585  |  Email: info@look4child.ngo  |  Web: www.look4child.ngo
              </div>
            </div>
          ) : (
            <div style={{ color: "var(--danger)", padding: "1.5rem", textAlign: "center" }}>
              ⚠️ Failed to load receipt layout details.
            </div>
          )}

          <div className="receipt-actions" style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginTop: "1.5rem" }}>
            <button
              onClick={() => {
                const cleanName = receiptDetails?.donorName ? receiptDetails.donorName.replace(/[^a-zA-Z0-9]/g, "_") : successData.donationId;
                downloadFile(
                  `/api/certificate/download-certificate/${successData.donationId}`,
                  `Donation_Certificate_${cleanName}.pdf`
                );
              }}
              className="btn btn-certificate-download"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
            >
              🖨️ Download Certificate
            </button>

            <button
              onClick={() => {
                const cleanName = receiptDetails?.donorName ? receiptDetails.donorName.replace(/[^a-zA-Z0-9]/g, "_") : successData.donationId;
                downloadFile(
                  `/api/receipt/download-receipt/${successData.donationId}`,
                  `Donation_Receipt_${cleanName}.pdf`
                );
              }}
              className="btn btn-primary btn-receipt-download"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#dc2626", borderColor: "#dc2626" }}
            >
              📄 Download Receipt
            </button>
            
            <button
              className="btn btn-secondary btn-new-donation-centered"
              onClick={() => setSuccessData(null)}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
            >
              Make Another Donation
            </button>
          </div>
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
          to underprivileged children.
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
            <label htmlFor="donor-pan">PAN Number</label>
            <div className="input-icon-wrapper">
              <span className="input-icon">🪪</span>
              <input
                id="donor-pan"
                type="text"
                className={`form-input form-input-with-icon ${errors.panNo ? "input-error" : ""}`}
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
              />
            </div>
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
                Testing secure payment execution loop for Look For Child Foundation.
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
                <strong>Look For Child Foundation</strong>
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
