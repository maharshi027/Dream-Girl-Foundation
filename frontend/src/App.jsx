import { useState, useEffect } from "react";
import "./index.css";
import "./styles/admin-login.css";
import "./styles/admin-dashboard.css";
import OnlineDonation from "./components/OnlineDonation";
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import {
  setupAxiosInterceptors,
  initializeJWTToken,
  clearJWTToken,
} from "./utils/axiosConfig";

function App() {
  const [activeTab, setActiveTab] = useState(() => {
    const path = window.location.pathname;
    if (path.includes("/admin")) return "admin";
    if (path.includes("/donate")) return "donate";
    return "home";
  });
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem("admin_session") === "true";
  });

  // Initialize JWT interceptors on app mount
  useEffect(() => {
    setupAxiosInterceptors();
    initializeJWTToken();

    // Listen to URL changes
    const handlePathChange = () => {
      const path = window.location.pathname;
      if (path.includes("/admin")) setActiveTab("admin");
      else if (path.includes("/donate")) setActiveTab("donate");
      else setActiveTab("home");
    };

    window.addEventListener("popstate", handlePathChange);
    return () => window.removeEventListener("popstate", handlePathChange);
  }, []);

  const handleLoginSuccess = () => {
    sessionStorage.setItem("admin_session", "true");
    setIsAdminLoggedIn(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_session");
    clearJWTToken();
    setIsAdminLoggedIn(false);
  };

  return (
    <div className="app-container">
      {/* Header & Navigation */}
      <header>
        <div className="nav-wrapper">
          <a href="#" className="logo" onClick={() => setActiveTab("home")}>
            <div className="logo-icon">👧</div>
            <div className="logo-text">
              <h1>Dream Girl Foundation</h1>
              <p>For Girls' Protection & Education</p>
            </div>
          </a>
          <nav>
            <ul>
              <li>
                <button
                  className={`nav-btn ${activeTab === "home" ? "active" : ""}`}
                  onClick={() => setActiveTab("home")}
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  className={`nav-btn ${activeTab === "work" ? "active" : ""}`}
                  onClick={() => setActiveTab("work")}
                >
                  Our Work
                </button>
              </li>
              <li>
                <button
                  className={`nav-btn ${activeTab === "admin" ? "active" : ""}`}
                  onClick={() => setActiveTab("admin")}
                >
                  Admin CMS
                </button>
              </li>
              <li>
                <button
                  className={`nav-btn nav-btn-donate ${activeTab === "donate" ? "active" : ""}`}
                  onClick={() => setActiveTab("donate")}
                >
                  Donate Now
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main>
        {activeTab === "home" && (
          <div className="fade-in">
            {/* Hero Banner */}
            <section className="hero">
              <div className="hero-content">
                <h2>Empower a Girl, Transform the Future</h2>
                <p>
                  At Dream Girl Foundation, we dedicate our efforts to providing
                  education, healthcare, and equal opportunities to
                  underprivileged girls. Join us in making their dreams a
                  reality.
                </p>
                <div className="hero-buttons">
                  <button
                    className="btn btn-primary"
                    onClick={() => setActiveTab("donate")}
                  >
                    Support a Girl Today 💖
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setActiveTab("work")}
                  >
                    Learn About Our Initiatives
                  </button>
                </div>
              </div>
              <div className="hero-image-container">
                {/* Custom Gradient Illustration styled via CSS to represent happy kids */}
                <div
                  style={{
                    width: "100%",
                    height: "380px",
                    borderRadius: "12px",
                    background:
                      "linear-gradient(135deg, #fda4af, #f43f5e, #db2777)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    padding: "2rem",
                    textAlign: "center",
                    boxShadow: "var(--shadow-xl)",
                  }}
                >
                  <span style={{ fontSize: "5rem", marginBottom: "1rem" }}>
                    🎒🏫👧
                  </span>
                  <h3
                    style={{
                      color: "white",
                      fontSize: "1.75rem",
                      fontWeight: "800",
                    }}
                  >
                    Dream Girl Center
                  </h3>
                  <p
                    style={{
                      color: "#ffe4e6",
                      fontSize: "0.95rem",
                      maxWidth: "340px",
                      marginTop: "0.5rem",
                    }}
                  >
                    Fostering learning environments that nurture ambition,
                    safety, and confidence.
                  </p>
                </div>
                <div className="hero-badge">
                  <div className="hero-badge-number">5,200+</div>
                  <div className="hero-badge-text">
                    Girls Educated <br />& Protected
                  </div>
                </div>
              </div>
            </section>

            {/* Statistics */}
            <section className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🏫</div>
                <div className="stat-number">18</div>
                <div className="stat-label">Education Centers</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🍱</div>
                <div className="stat-number">250K+</div>
                <div className="stat-label">Midday Meals Served</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👩‍⚕️</div>
                <div className="stat-number">4,500+</div>
                <div className="stat-label">Health Screenings</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🧾</div>
                <div className="stat-number">100%</div>
                <div className="stat-label">80G Tax Exemption</div>
              </div>
            </section>

            {/* Showcase Programs */}
            <section>
              <div className="section-header">
                <h2>Our Key Focus Areas</h2>
                <p>
                  We work holistically to ensure every child gets the standard
                  of life she deserves.
                </p>
              </div>
              <div className="programs-grid">
                <div className="program-card">
                  <div
                    style={{
                      height: "180px",
                      background: "linear-gradient(135deg, #fed7aa, #f97316)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "4rem",
                    }}
                  >
                    📖
                  </div>
                  <div className="program-body">
                    <span className="program-tag">Primary Education</span>
                    <h3>Academic Empowerment</h3>
                    <p>
                      Providing basic schooling, books, uniforms, and digital
                      literacy to enable independence.
                    </p>
                  </div>
                </div>
                <div className="program-card">
                  <div
                    style={{
                      height: "180px",
                      background: "linear-gradient(135deg, #fed7a6, #fbbf24)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "4rem",
                    }}
                  >
                    🍎
                  </div>
                  <div className="program-body">
                    <span className="program-tag">Nutrition</span>
                    <h3>Nutritional Security</h3>
                    <p>
                      Fighting malnutrition with daily healthy meals, vitamins,
                      and regular health tracking.
                    </p>
                  </div>
                </div>
                <div className="program-card">
                  <div
                    style={{
                      height: "180px",
                      background: "linear-gradient(135deg, #fbcfe8, #ec4899)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "4rem",
                    }}
                  >
                    🩹
                  </div>
                  <div className="program-body">
                    <span className="program-tag">Healthcare</span>
                    <h3>Hygiene & Medical Support</h3>
                    <p>
                      Providing sanitary kits, health counseling, immunizations,
                      and clean drinking water facilities.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === "work" && (
          <div className="fade-in">
            <div className="section-header">
              <h2>Transforming Communities</h2>
              <p>
                Through community learning centers and specialized medical
                camps, we drive social progress.
              </p>
            </div>
            <div
              style={{
                maxWidth: "800px",
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                gap: "2rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "2rem",
                  backgroundColor: "white",
                  padding: "2rem",
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "3rem" }}>🎒</span>
                <div>
                  <h3 style={{ marginBottom: "0.5rem" }}>
                    Non-Formal Education Centers
                  </h3>
                  <p>
                    For children who are dropouts or have never attended school,
                    we run bridging courses that prepare them to integrate
                    directly into local government schools.
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "2rem",
                  backgroundColor: "white",
                  padding: "2rem",
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "3rem" }}>💻</span>
                <div>
                  <h3 style={{ marginBottom: "0.5rem" }}>
                    Computer Literacy Initiatives
                  </h3>
                  <p>
                    In the digital age, tech skills are non-negotiable. Our
                    computer labs teach girls base coding, spreadsheets,
                    document processing, and internet navigation skills.
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "2rem",
                  backgroundColor: "white",
                  padding: "2rem",
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "3rem" }}>🎨</span>
                <div>
                  <h3 style={{ marginBottom: "0.5rem" }}>
                    Vocational Training & Crafts
                  </h3>
                  <p>
                    We run skill development workshops (sewing, drawing,
                    crafting) for older girls and young mothers, creating
                    livelihood opportunities in their local areas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "donate" && (
          <div className="donation-page-container fade-in">
            <div className="donation-info">
              <h2>Your Support Changes Everything</h2>
              <p>
                Dream Girl Foundation is a registered charity. All contributions
                go directly toward managing girls' programs, operating learning
                centers, and providing nutrition.
              </p>
              <ul className="info-bullet-list">
                <li>
                  <span className="info-bullet-icon">✓</span> Secure 256-bit
                  encrypted transactions
                </li>
                <li>
                  <span className="info-bullet-icon">✓</span> Tax Exemption
                  Exemption under Section 80G
                </li>
                <li>
                  <span className="info-bullet-icon">✓</span> 100% transparency
                  with quarterly audited reports
                </li>
                <li>
                  <span className="info-bullet-icon">✓</span> Instant
                  downloadable, valid Tax Certificates
                </li>
              </ul>
              <div className="tax-badge">
                <span className="tax-badge-icon">🛡️</span>
                <div className="tax-badge-text">
                  <h4>Government Registered Tax Benefits</h4>
                  <p>
                    Donations to Dream Girl Foundation qualify for 50% tax
                    deductions under Sec 80G of the Income Tax Act.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <OnlineDonation />
            </div>
          </div>
        )}

        {activeTab === "admin" && (
          <div className="fade-in">
            {!isAdminLoggedIn ? (
              <AdminLogin onLoginSuccess={handleLoginSuccess} />
            ) : (
              <AdminDashboard onLogout={handleLogout} />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer>
        <div className="footer-grid">
          <div className="footer-col">
            <h3
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <span>👧</span> Dream Girl Foundation
            </h3>
            <p>
              Dedicated to establishing a protective, healthy, and highly
              supportive social environment that enables girls to acquire skills
              and lead an independent life.
            </p>
            <p style={{ fontSize: "0.8rem", color: "var(--text-light)" }}>
              Reg No. S/68593/2010
            </p>
          </div>
          <div className="footer-col">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li>
                <a href="#" onClick={() => setActiveTab("home")}>
                  Home & Statistics
                </a>
              </li>
              <li>
                <a href="#" onClick={() => setActiveTab("work")}>
                  Our Programs
                </a>
              </li>
              <li>
                <a href="#" onClick={() => setActiveTab("donate")}>
                  Secure Donation
                </a>
              </li>
              <li>
                <a href="#" onClick={() => setActiveTab("admin")}>
                  Internal CMS Console
                </a>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h3>Contact NGO</h3>
            <ul className="footer-contact">
              <li>
                <span>📍</span> Sector 9, Gurugram, Haryana - 122001, India
              </li>
              <li>
                <span>✉️</span> contact@dreamgirlfoundation.org.in
              </li>
              <li>
                <span>📞</span> +91-9873001122
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} Dream Girl Foundation. All Rights
            Reserved.
          </div>
          <div style={{ color: "var(--text-light)" }}>
            Registered under Societies Registration Act XXI of 1860.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
