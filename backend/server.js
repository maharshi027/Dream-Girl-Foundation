import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import multer from "multer";
import connectDB from "./src/config/db.js";
import {
  setupRootRoute,
  setupAuthRoutes,
  setupDonationRoutes,
  setupCertificateRoutes,
  setupReceiptRoutes,
} from "./src/app.js";

dotenv.config();

connectDB();

// ============================================================================
// EXPRESS APP SETUP
// ============================================================================
const app = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================
// CORS configuration
app.use(cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const upload = multer({ storage: multer.memoryStorage() });
app.use(upload.none());

// Request logging middleware
app.use((req, res, next) => {
  console.log(
    `${req.method} ${req.path} - Content-Type: ${req.headers["content-type"]}`,
  );
  console.log(`Body:`, req.body);
  next();
});

setupRootRoute(app);
setupAuthRoutes(app);
setupDonationRoutes(app);
setupCertificateRoutes(app);
setupReceiptRoutes(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
  );
});
