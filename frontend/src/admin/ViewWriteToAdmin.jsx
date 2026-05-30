import React, { useState } from "react";

export default function ViewWriteToAdmin() {
  const [messages] = useState([
    {
      id: 1,
      sender: "John Doe",
      subject: "Database Query Issue",
      priority: "high",
      date: "2025-05-20",
      content: "I'm facing some issues with the donation records...",
      status: "open",
    },
    {
      id: 2,
      sender: "Admin System",
      subject: "System Maintenance Scheduled",
      priority: "normal",
      date: "2025-05-19",
      content: "Scheduled maintenance on May 25th from 2-4 PM",
      status: "closed",
    },
  ]);

  const [selectedMessage, setSelectedMessage] = useState(null);

  return (
    <div className="view-messages-content">
      <h2 className="content-title">Messages & Tickets</h2>
      <p className="content-subtitle">
        View and manage all messages and support tickets
      </p>

      <div className="messages-container">
        <div className="messages-list">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message-item ${
                selectedMessage?.id === msg.id ? "selected" : ""
              } ${msg.status}`}
              onClick={() => setSelectedMessage(msg)}
            >
              <div className="message-header">
                <h4>{msg.subject}</h4>
                <span className={`priority-badge ${msg.priority}`}>
                  {msg.priority.toUpperCase()}
                </span>
              </div>
              <p className="message-sender">{msg.sender}</p>
              <p className="message-date">{msg.date}</p>
            </div>
          ))}
        </div>

        <div className="message-detail">
          {selectedMessage ? (
            <>
              <div className="message-header-detail">
                <h3>{selectedMessage.subject}</h3>
                <span className={`status-badge ${selectedMessage.status}`}>
                  {selectedMessage.status.toUpperCase()}
                </span>
              </div>
              <div className="message-meta">
                <p>
                  <strong>From:</strong> {selectedMessage.sender}
                </p>
                <p>
                  <strong>Date:</strong> {selectedMessage.date}
                </p>
                <p>
                  <strong>Priority:</strong>{" "}
                  <span
                    className={`priority-badge ${selectedMessage.priority}`}
                  >
                    {selectedMessage.priority}
                  </span>
                </p>
              </div>
              <div className="message-body">
                <p>{selectedMessage.content}</p>
              </div>
            </>
          ) : (
            <div className="no-message-selected">
              <p>Select a message to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
