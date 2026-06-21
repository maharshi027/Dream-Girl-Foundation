import express from "express";
import { downloadTransactionReceipt, getReceiptDetails } from "../controllers/receipt.controller.js";
import { emailReceipt } from "../controllers/donation.controller.js";

const router = express.Router();

// Existing: PDF download
router.get("/download-receipt/:id", downloadTransactionReceipt);

// Missing: Called by OnlineDonation.jsx to render the receipt details on the success screen
router.get("/receipt-details/:id", getReceiptDetails);

// Missing: Called by AdminCashEntry.jsx "Send Email" button
router.post("/email-receipt/:id", emailReceipt);

export default router;
