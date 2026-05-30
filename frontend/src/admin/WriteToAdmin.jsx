import React, { useState } from "react";

export default function WriteToAdmin() {
  const [message, setMessage] = useState({
    subject: "",
    content: "",
    priority: "normal",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send to backend
    console.log("Message submitted:", message);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setMessage({ subject: "", content: "", priority: "normal" });
    }, 3000);
  };

  return (
    <div className="write-to-admin-content">
      <h2 className="content-title">Write to Administrator</h2>
      <p className="content-subtitle">
        Send messages, tickets, or inquiries to the system administrator
      </p>

      {submitted && (
        <div className="success-message">
          ✓ Your message has been sent successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-message-form">
        <div className="form-group">
          <label htmlFor="subject">Subject</label>
          <input
            id="subject"
            type="text"
            className="form-input"
            placeholder="Enter message subject..."
            value={message.subject}
            onChange={(e) =>
              setMessage({ ...message, subject: e.target.value })
            }
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            className="form-select"
            value={message.priority}
            onChange={(e) =>
              setMessage({ ...message, priority: e.target.value })
            }
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="content">Message Content</label>
          <textarea
            id="content"
            className="form-textarea"
            placeholder="Type your message here..."
            rows="8"
            value={message.content}
            onChange={(e) =>
              setMessage({ ...message, content: e.target.value })
            }
            required
          ></textarea>
        </div>

        <button type="submit" className="btn btn-primary">
          📤 Send Message
        </button>
      </form>
    </div>
  );
}
