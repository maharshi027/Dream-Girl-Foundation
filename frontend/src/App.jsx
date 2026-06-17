import { useState, useEffect } from "react";
import "./index.css";
import "./styles/admin-login.css";
import "./styles/admin-dashboard.css";
import Footer from "./components/footer/Footer";

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
            <div className="logo-icon">🧸</div>
            <div className="logo-text">
              <h1>Look For Child Foundation</h1>
              <p>For Children's Protection, Education & Care</p>
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
                  Donate Now 💖
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className={activeTab === "admin" ? "admin-fullpage" : ""}>
        {activeTab === "home" && (
          <div className="fade-in">
            {/* Hero Banner */}
            <section className="hero">
              <div className="hero-content">
                <h2>Empower a Child, Shape the Future</h2>
                <p>
                  At Look For Child Foundation, we dedicate our efforts to providing
                  education, healthcare, and equal opportunities to
                  underprivileged children. Join us in making their dreams a
                  reality.
                </p>
                <div className="hero-buttons">
                  <button
                    className="btn btn-primary"
                    onClick={() => setActiveTab("donate")}
                  >
                    Support a Child Today 🤝
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setActiveTab("work")}
                  >
                    Explore Our Initiatives
                  </button>
                </div>
              </div>
              <div className="hero-image-container">
                <div
                  className="hero-backdrop-gradient"
                  style={{
                    width: "100%",
                    height: "380px",
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, #a7f3d0, #0284c7, #4f46e5)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    padding: "2rem",
                    textAlign: "center",
                    boxShadow: "var(--shadow-xl)",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  <div className="glass-panel-accent" style={{
                    position: "absolute",
                    inset: "0",
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(4px)",
                    zIndex: 1
                  }}></div>
                  
                  <div style={{ position: "relative", zIndex: 2 }}>
                    <span style={{ fontSize: "5.5rem", marginBottom: "1rem", display: "block", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.15))" }}>
                      📚🎒👦
                    </span>
                    <h3
                      style={{
                        color: "white",
                        fontSize: "1.85rem",
                        fontWeight: "800",
                        letterSpacing: "0.5px",
                        textShadow: "0 2px 4px rgba(0,0,0,0.2)"
                      }}
                    >
                      Look For Child Center
                    </h3>
                    <p
                      style={{
                        color: "#e0f2fe",
                        fontSize: "0.95rem",
                        maxWidth: "360px",
                        margin: "0.75rem auto 0 auto",
                        textShadow: "0 1px 2px rgba(0,0,0,0.2)"
                      }}
                    >
                      Creating safe, high-quality learning environments that nurture ambition,
                      nutrition, and character.
                    </p>
                  </div>
                </div>
                <div className="hero-badge">
                  <div className="hero-badge-number">8,500+</div>
                  <div className="hero-badge-text">
                    Children Empowered <br />& Educated
                  </div>
                </div>
              </div>
            </section>

            {/* Statistics */}
            <section className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🏢</div>
                <div className="stat-number">24</div>
                <div className="stat-label">Education Centers</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🍱</div>
                <div className="stat-number">400K+</div>
                <div className="stat-label">Nutritious Meals Served</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🩺</div>
                <div className="stat-number">6,200+</div>
                <div className="stat-label">Health & Dental Camps</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🛡️</div>
                <div className="stat-number">100%</div>
                <div className="stat-label">80G Tax Exemption</div>
              </div>
            </section>

            {/* Showcase Programs */}
            <section style={{ marginTop: "4rem" }}>
              <div className="section-header">
                <h2>Our Core Programs</h2>
                <p>
                  We implement robust programs addressing critical barriers in education, 
                  nutrition, and child health to ensure holistic growth.
                </p>
              </div>
              <div className="programs-grid">
                <div className="program-card">
                  <div
                    style={{
                      height: "180px",
                      background: "linear-gradient(135deg, #bae6fd, #0284c7)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "4.5rem",
                    }}
                  >
                    📘
                  </div>
                  <div className="program-body">
                    <span className="program-tag" style={{ background: "#e0f2fe", color: "#0369a1" }}>Primary Education</span>
                    <h3>Project JEEVAN</h3>
                    <p>
                      Providing primary schooling support, digital literacy, school kits, and bridged coaching to enable integration into government schools.
                    </p>
                  </div>
                </div>

                <div className="program-card">
                  <div
                    style={{
                      height: "180px",
                      background: "linear-gradient(135deg, #fef08a, #ca8a04)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "4.5rem",
                    }}
                  >
                    🍎
                  </div>
                  <div className="program-body">
                    <span className="program-tag" style={{ background: "#fef9c3", color: "#854d0e" }}>Nutrition Care</span>
                    <h3>Nutritional Security</h3>
                    <p>
                      Delivering fresh midday meals and daily vitamins, monitoring growth metrics, and fighting severe child malnutrition.
                    </p>
                  </div>
                </div>

                <div className="program-card">
                  <div
                    style={{
                      height: "180px",
                      background: "linear-gradient(135deg, #fbcfe8, #db2777)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "4.5rem",
                    }}
                  >
                    🩺
                  </div>
                  <div className="program-body">
                    <span className="program-tag" style={{ background: "#fce7f3", color: "#9d174d" }}>Health & Hygiene</span>
                    <h3>Healthcare & Camps</h3>
                    <p>
                      Organizing regular pediatric medical checkups, immunizations, oral health camps, and distribution of hygiene kits.
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
              <h2>Community Transformation</h2>
              <p>
                We collaborate directly with rural villages and slum communities to break cycles of poverty.
              </p>
            </div>
            <div
              style={{
                maxWidth: "850px",
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
                  borderRadius: "16px",
                  border: "1px solid var(--border)",
                  alignItems: "center",
                  boxShadow: "var(--shadow-sm)"
                }}
              >
                <span style={{ fontSize: "3.5rem" }}>🎒</span>
                <div>
                  <h3 style={{ marginBottom: "0.5rem" }}>Non-Formal Education Hubs</h3>
                  <p style={{ color: "var(--text-main)", fontSize: "0.95rem" }}>
                    We run transitional classrooms for dropout children and child laborers, providing them 
                    accelerated learning before main school integration.
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "2rem",
                  backgroundColor: "white",
                  padding: "2rem",
                  borderRadius: "16px",
                  border: "1px solid var(--border)",
                  alignItems: "center",
                  boxShadow: "var(--shadow-sm)"
                }}
              >
                <span style={{ fontSize: "3.5rem" }}>💻</span>
                <div>
                  <h3 style={{ marginBottom: "0.5rem" }}>Digital Literacy Programs</h3>
                  <p style={{ color: "var(--text-main)", fontSize: "0.95rem" }}>
                    Educating children in essential computer operations, programming bases, documents, and secure 
                    internet research to bridge the digital divide.
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "2rem",
                  backgroundColor: "white",
                  padding: "2rem",
                  borderRadius: "16px",
                  border: "1px solid var(--border)",
                  alignItems: "center",
                  boxShadow: "var(--shadow-sm)"
                }}
              >
                <span style={{ fontSize: "3.5rem" }}>🎨</span>
                <div>
                  <h3 style={{ marginBottom: "0.5rem" }}>Creative Arts & Skill Workshops</h3>
                  <p style={{ color: "var(--text-main)", fontSize: "0.95rem" }}>
                    Fostering holistic growth with painting, crafts, coding bootcamps, and sports activities 
                    promoting teamwork, focus, and critical thinking.
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
                Look For Child Foundation is a registered NGO under Societies Registration Act. All contributions 
                go directly towards child health programs, coaching resources, nutrition, and safety networks.
              </p>
              <ul className="info-bullet-list">
                <li>
                  <span className="info-bullet-icon">✓</span> Secure PCI-DSS 256-bit encrypted transactions
                </li>
                <li>
                  <span className="info-bullet-icon">✓</span> Tax Exemption Benefits under Section 80G
                </li>
                <li>
                  <span className="info-bullet-icon">✓</span> 100% transparency with quarterly audited balance sheets
                </li>
                <li>
                  <span className="info-bullet-icon">✓</span> Instant Tax Certificates & Transaction Receipts
                </li>
              </ul>
              <div className="tax-badge" style={{ background: "#f0fdf4", border: "1px dashed #10b981", borderRadius: "12px", padding: "1.25rem", display: "flex", gap: "1rem", alignItems: "center" }}>
                <span className="tax-badge-icon" style={{ fontSize: "2rem" }}>🛡️</span>
                <div className="tax-badge-text">
                  <h4 style={{ color: "#065f46", fontSize: "1rem", fontWeight: "700" }}>Government Registered Tax Benefits</h4>
                  <p style={{ color: "#374151", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                    Donations qualify for 50% tax deductions under Sec 80G of the Income Tax Act. 
                    PAN: **AAAAL4939Q**.
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
          <div className="fade-in admin-tab-wrap">
            {!isAdminLoggedIn ? (
              <AdminLogin onLoginSuccess={handleLoginSuccess} />
            ) : (
              <AdminDashboard onLogout={handleLogout} />
            )}
          </div>
        )}
      </main>

      {activeTab !== "admin" && !window?.location?.pathname?.includes("/admin") && (
        <Footer onNav={(tab) => setActiveTab(tab)} />
      )}
    </div>
  );
}

export default App;
