# Look4Child Foundation

<p align="center">
  <img src="./frontend/src/assets/logo.png" alt="Look4Child Foundation Logo" width="220" />
</p>

Look4Child Foundation is a registered NGO dedicated to child protection, supporting girls' education, empowering students, and extending care to needy and underprivileged families. This full-stack web application enables transparent donation processing, secure admin management, and automated receipt and certificate generation to support our social transformation initiatives.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [What We Offer](#-what-we-offer)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation & Running](#-installation--running)
- [Configuration Details](#-configuration-details)
- [Features](#-features)
- [Support & NGO Contacts](#-support--ngo-contacts)
- [License](#-license)

---

## 🎯 Overview

The **Look4Child Foundation** platform acts as a secure bridge between our supporters and the communities we serve. Our organization works tirelessly to address barriers in:
- 👧 **Girls' Education**: Nurturing confidence, literacy, and future careers for young women.
- 📚 **Student Empowerment**: Distributing school kits, coaching resources, and digital literacy.
- 🧸 **Children's Protection**: Offering safe spaces, healthcare camps, and nutritious mid-day meals.
- 🤝 **Help for Needy Families**: Direct outreach programs for food security, emergency aid, and resource distribution.

---

## 🌟 What We Offer

Our platform offers a complete suite of services designed to make donating and managing contributions effortless and transparent:

1. **Secure Online Contributions**: Integrated payment processing for instant and safe transactions.
2. **Transparent Donation Metrics**: Live tracker for public/admin visibility into donor records.
3. **80G Tax Exemption**: Registered under Section 80G of the Income Tax Act, offering instant benefits.
4. **Automated Receipts & Certificates**: Downloadable PDF transaction receipts and official certificates generated on successful donation.
5. **Internal CMS Console**: A secure administrative panel for records tracking, cash entry validation, and database updates.

---

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens) with automated access/refresh cycle
- **PDF Generation**: PDFKit (Vector layout engine)
- **File Management**: Multer

### Frontend
- **Build Tool**: Vite
- **Framework**: React.js
- **Styling**: Modern Vanilla CSS Design System (supporting responsive layout and animations)
- **HTTP Client**: Axios with interceptors

---

## 📁 Project Structure

```
Look4Child/
├── backend/
│   ├── src/
│   │   ├── app.js                    # Core express configurations and routes
│   │   ├── config/
│   │   │   └── db.js                 # Database connector
│   │   ├── models/
│   │   │   └── donation.models.js    # Mongoose data schema
│   │   ├── controllers/
│   │   │   ├── admin.controller.js   # Admin Auth & token controllers
│   │   │   ├── donation.controller.js# Donor operations controllers
│   │   │   ├── receipt.controller.js # Single-page A4 PDF Receipt generator
│   │   │   └── certificate.controller.js # Landscape PDF Certificate generator
│   │   ├── middleware/
│   │   │   └── authMiddleware.js     # Admin verification handlers
│   │   └── utils/
│   │       ├── jwtUtils.js           # JWT token generation
│   │       └── errorHandler.js       # Centralized exception logging
│   └── server.js                     # Backend application entry point
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   │   └── logo.png              # Official brand logo
│   │   ├── utils/
│   │   │   └── axiosConfig.js        # Axios interceptors for JWT
│   │   ├── components/
│   │   │   ├── OnlineDonation.jsx    # Donation form block
│   │   │   └── footer/               # Site footer directory
│   │   ├── admin/
│   │   │   ├── AdminLogin.jsx        # Admin secure login
│   │   │   ├── AdminDashboard.jsx    # Admin dashboard panel
│   │   │   └── AdminCashEntry.jsx    # Offline transaction record form
│   │   ├── donar/
│   │   │   └── DonarList.jsx         # Donor list grid
│   │   ├── App.jsx                   # Primary router & view controller
│   │   └── index.css                 # Premium custom design system styles
│   ├── index.html                    # Single-page index file
│   └── vite.config.js                # Vite development proxy
└── README.md                         # Project documentation
```

---

## 🏃 Installation & Running

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (Local instance or Atlas cloud cluster)

### 1. Repository Setup
```bash
git clone <repository-url>
cd Look4Child
```

### 2. Dependency Installation
Run in both directories:
```bash
# For backend
cd backend
npm install

# For frontend
cd ../frontend
npm install
```

### 3. Execution
```bash
# Start backend API (typically runs on port 5000)
cd backend
npm run dev

# Start frontend application (runs on http://localhost:5173)
cd ../frontend
npm run dev
```

---

## ⚙️ Configuration Details

The application utilizes local environment variables for system coordination. Ensure you create a `.env` configuration file in the `backend/` directory referencing:

- **Database Connectors**: URL to connect to the MongoDB instance.
- **Port Management**: Server port defaults.
- **Security Credentials**: Secret keys used for signing and verifying JSON Web Tokens (JWT) for the Access and Refresh layers, and Admin Panel passwords.
- **Payment Keys**: Keys for authorization with external payment systems.

*Note: Environment variables contain secrets and credentials; they should remain private and never be shared, publicized, or checked into repository version history.*

---

## ✨ Features

- **Double-Token Auth**: Clean JWT validation using access tokens (15-minute life) and refresh tokens (7-day life) with automated refresh requests.
- **PDF Compilation**: Direct compilation of vectors and images using PDFKit to generate standard portrait receipts (single A4 page) and landscape certificates.
- **Custom Design Tokens**: Curated layout styling using dynamic HSL color variables, smooth micro-interactions, and glassmorphism cards.

---

## 📞 Support & NGO Contacts

For organization information or donation inquiries:
- **Office**: Room No.1, Opp. Sarpanch Anant House, Tigra Village, Sec-57, Gurgaon
- **Email**: info@look4child.ngo
- **Phone**: +91 98998 18585
- **Web**: www.look4child.ngo

---

## 📄 License

This project is licensed under the ISC License. All Rights Reserved.
