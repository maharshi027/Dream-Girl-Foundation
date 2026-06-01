import React, { useState } from "react";
import axios from "axios";

export default function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Call new JWT login endpoint
      const { data } = await axios.post("/api/auth/login", { email, password });
      if (data.success) {
        // Store JWT tokens in localStorage
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("tokenExpiry", data.expiresIn);
        localStorage.setItem("adminEmail", email);

        // Configure axios to include token in all requests
        axios.defaults.headers.common["Authorization"] =
          `Bearer ${data.accessToken}`;

        // Callback to parent component
        onLoginSuccess();
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Invalid email or password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-background">
        <div className="gradient-blur blur-1"></div>
        <div className="gradient-blur blur-2"></div>
        <div className="gradient-blur blur-3"></div>
      </div>
      <div className="admin-login-container">
        <div className="admin-login-card fade-in-up">
          {/* Logo Section */}
          <div className="login-logo-section">
            <div className="login-icon-circle">👧</div>
            <h1>Dream Girl Foundation</h1>
            <h3 className="login-subtitle">Admin Login</h3>
          </div>

          {/* Form Section */}
          <div className="login-form-section">
            {error && <div className="login-error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="form-group-modern">
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M3 8l9 6 9-6M3 8v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8M3 8l9 6m9-6l-9 6" />
                  </svg>
                  <span className="input-label">Email</span>
                  <input
                    type="email"
                    className="form-input-modern"
                    placeholder="enter admin email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="form-group-modern">
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                  </svg>
                  <span className="input-label">Password</span>
                  <input
                    type="password"
                    className="form-input-modern"
                    placeholder="enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn-login-submit"
                disabled={loading}
              >
                <span className="btn-icon">→</span>
                <span className="btn-text">
                  {loading ? "Signing In..." : "Sign In"}
                </span>
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="login-footer">
            <p>
              <span className="info-icon">ℹ️</span>
              Contact support for access credentials
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
