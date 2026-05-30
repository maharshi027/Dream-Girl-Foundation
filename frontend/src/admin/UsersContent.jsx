import React, { useState } from "react";

export default function UsersContent() {
  const [users] = useState([
    {
      id: 1,
      name: "Admin User",
      email: "admin@dreamgirlfoundation.org",
      role: "Administrator",
      lastLogin: "2025-05-26 10:30 AM",
      status: "active",
    },
    {
      id: 2,
      name: "Support Staff",
      email: "support@dreamgirlfoundation.org",
      role: "Support",
      lastLogin: "2025-05-25 2:15 PM",
      status: "active",
    },
    {
      id: 3,
      name: "Data Manager",
      email: "data@dreamgirlfoundation.org",
      role: "Manager",
      lastLogin: "2025-05-20 11:00 AM",
      status: "inactive",
    },
  ]);

  return (
    <div className="users-content">
      <h2 className="content-title">User Management</h2>
      <p className="content-subtitle">
        View and manage admin user accounts and access logs
      </p>

      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Last Login</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="user-name">{user.name}</td>
                <td className="user-email">{user.email}</td>
                <td className="user-role">{user.role}</td>
                <td className="user-login">{user.lastLogin}</td>
                <td>
                  <span className={`status-badge ${user.status}`}>
                    {user.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="users-info">
        <p>
          <strong>Total Active Users:</strong> 2
        </p>
        <p>
          <strong>Total Inactive Users:</strong> 1
        </p>
      </div>
    </div>
  );
}
