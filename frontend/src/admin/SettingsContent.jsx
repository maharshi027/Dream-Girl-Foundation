import React, { useState } from "react";

export default function SettingsContent() {
  const [settings, setSettings] = useState({
    siteName: "Dream Girl Foundation",
    adminEmail: "admin@dreamgirlfoundation.org",
    autoBackup: true,
    maintenanceMode: false,
    emailNotifications: true,
  });

  const [saved, setSaved] = useState(false);

  const handleSettingChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    console.log("Settings saved:", settings);
  };

  return (
    <div className="settings-content">
      <h2 className="content-title">System Settings</h2>
      <p className="content-subtitle">
        Configure system-wide settings and preferences
      </p>

      {saved && (
        <div className="success-message">✓ Settings saved successfully!</div>
      )}

      <div className="settings-form">
        <div className="settings-section">
          <h3>General Settings</h3>

          <div className="form-group">
            <label htmlFor="siteName">Site Name</label>
            <input
              id="siteName"
              type="text"
              className="form-input"
              value={settings.siteName}
              onChange={(e) => handleSettingChange("siteName", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="adminEmail">Admin Email</label>
            <input
              id="adminEmail"
              type="email"
              className="form-input"
              value={settings.adminEmail}
              onChange={(e) =>
                handleSettingChange("adminEmail", e.target.value)
              }
            />
          </div>
        </div>

        <div className="settings-section">
          <h3>System Features</h3>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={settings.autoBackup}
                onChange={(e) =>
                  handleSettingChange("autoBackup", e.target.checked)
                }
              />
              <span>Enable Automatic Backup</span>
            </label>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) =>
                  handleSettingChange("emailNotifications", e.target.checked)
                }
              />
              <span>Enable Email Notifications</span>
            </label>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) =>
                  handleSettingChange("maintenanceMode", e.target.checked)
                }
              />
              <span>Maintenance Mode</span>
            </label>
          </div>
        </div>

        <div className="settings-actions">
          <button className="btn btn-primary" onClick={handleSave}>
            💾 Save Settings
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => window.location.reload()}
          >
            🔄 Reset
          </button>
        </div>
      </div>

      <div className="settings-info">
        <h3>System Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <p className="info-label">Database Version</p>
            <p className="info-value">MongoDB 5.0</p>
          </div>
          <div className="info-item">
            <p className="info-label">API Version</p>
            <p className="info-value">v1.0.0</p>
          </div>
          <div className="info-item">
            <p className="info-label">Last Backup</p>
            <p className="info-value">2025-05-26 09:00 AM</p>
          </div>
        </div>
      </div>
    </div>
  );
}
