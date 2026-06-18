import PDFDocument from "pdfkit";
import Donation from "../models/donation.models.js";
import { fileURLToPath } from "url";
import path from "path";
import { getReceiptSerialNumber } from "./receipt.controller.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const certificateBgPath = path.join(__dirname, "../assets/certificate.jpeg");


const getTableDateStr = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

export const downloadCertificate = async (req, res) => {
  const { id } = req.params;

  try {
    const donation = await Donation.findById(id);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    if (donation.paymentStatus !== "SUCCESS") {
      return res.status(400).json({
        success: false,
        message: "Certificate can only be generated for successful donations",
      });
    }

    const cleanDonorName = donation.donorName.replace(/[^a-zA-Z0-9]/g, "_");
    // Set response headers to force download as a PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Donation Certificate_${cleanDonorName}.pdf"`,
    );

    // Create a landscape A4 PDF document (841.89 x 595.28 points)
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
    });

    // Pipe PDF directly to response stream
    doc.pipe(res);

    const width = doc.page.width;
    const height = doc.page.height;

    // --- DRAW BACKGROUND IMAGE ---
    doc.image(certificateBgPath, 0, 0, { width, height });

    // --- TOP REFERENCE NUMBER ---
    const serialNumber = await getReceiptSerialNumber(donation);
    doc.font("Times-Roman").fontSize(9.5).fillColor("#000000");
    doc.text(serialNumber, 60, 52);

    // --- DONOR NAME ---
    doc.y = 250;
    doc.font("Times-Bold")
       .fontSize(32)
       .fillColor("#000000") // black colour
       .text(donation.donorName.toUpperCase(), { align: "center" });

    // --- DETAILS INPUT OVERLAYS ---
    doc.fillColor("#000000").font("Times-Bold").fontSize(11);
    
    // Donated Rs. Value (Line 3, Y = 315, X = 260)
    doc.text(`${donation.amount}/-`, 260, 315, { width: 200, align: "left" });
    // PAN No Value (Line 3, Y = 315, X = 560)
    doc.text(donation.panNo || "N/A", 560, 315, { width: 250, align: "left" });

    // Line 4: For account of ___________ donated via __________ having reference no. __________
    const accountType = (donation.type || "HEALTH CARE").toUpperCase();
    doc.text(accountType, 250, 345, { width: 200, align: "left" });
    
    const paymentModeLabel = donation.paymentMode === "CASH" ? (donation.gatewayName || "CASH").toUpperCase() : "NEFT/IMPS";
    doc.text(paymentModeLabel, 510, 345, { width: 200, align: "left" });
    
    // Line 5: no. _______________ drawn _______________ dated _______________
    const refNo = donation.transactionId || donation.razorpayPaymentId || "--NA--";
    doc.text(refNo, 190, 375, { width: 200, align: "left" });
    
    const drawnSource = (donation.gatewayName || (donation.paymentMode === "ONLINE" ? "GOOGLE PAY" : "OFFICE")).toUpperCase();
    doc.text(drawnSource, 380, 375, { width: 200, align: "left" });
    
    doc.text(getTableDateStr(donation.donationDate), 520, 375, { width: 200, align: "left" });

    // End Document stream
    doc.end();
  } catch (error) {
    console.error("Certificate Generation Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate certificate",
      error: error.message,
    });
  }
};
