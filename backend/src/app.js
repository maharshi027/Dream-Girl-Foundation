import {
  verifyPassword,
  login,
  refreshAccessToken,
} from "./controllers/admin.controller.js";
import {
  initiateOnline,
  verifyOnline,
  recordCash,
  getAllRecords,
  updateRecord,
  deleteRecord,
} from "./controllers/donation.controller.js";
import { downloadCertificate } from "./controllers/certificate.controller.js";
import { downloadTransactionReceipt } from "./controllers/receipt.controller.js";

// ============================================================================
// ROOT ROUTE
// ============================================================================
export const setupRootRoute = (app) => {
  app.get("/", (req, res) => {
    res.send("Dream Girl Foundation Backend API is running...");
  });
};

// ============================================================================
// AUTH ROUTES
// ============================================================================
export const setupAuthRoutes = (app) => {
  app.post("/api/auth/login", login);
  app.post("/api/auth/refresh-token", refreshAccessToken);
  app.post("/api/auth/verify-password", verifyPassword);
};

// ============================================================================
// DONATION ROUTES
// ============================================================================
export const setupDonationRoutes = (app) => {
  app.post("/api/donations/initiate-online", initiateOnline);
  app.post("/api/donations/verify-online", verifyOnline);
  app.post("/api/donations/record-cash", recordCash);
  app.get("/api/donations/all-records", getAllRecords);
  app.put("/api/donations/update/:id", updateRecord);
  app.delete("/api/donations/delete/:id", deleteRecord);
};

// ============================================================================
// CERTIFICATE ROUTES
// ============================================================================
export const setupCertificateRoutes = (app) => {
  app.get("/api/certificate/download-certificate/:id", downloadCertificate);
};

// ============================================================================
// RECEIPT ROUTES
// ============================================================================
export const setupReceiptRoutes = (app) => {
  app.get("/api/receipt/download-receipt/:id", downloadTransactionReceipt);
};
// ============================================================================
// ERROR HANDLER
// ============================================================================
