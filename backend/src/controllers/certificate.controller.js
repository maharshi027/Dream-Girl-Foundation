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

export const generateCertificatePDF = async (doc, donation) => {
  const W = doc.page.width;   // 841.89 pt
  const H = doc.page.height;  // 595.28 pt

  // ── Background ────────────────────────────────────────────
  doc.image(certificateBgPath, 0, 0, { width: W, height: H });

  // ── Serial number — top left ──────────────────────────────
  const serialNumber = await getReceiptSerialNumber(donation);
  doc
    .font("Times-Roman")
    .fontSize(10)
    .fillColor("#000000")
    .text(serialNumber, 52, 50, { lineBreak: false });

  // ── Donor name — centered between the two decorative lines ─
  // Uses absolute Y so it never shifts when other font sizes change
  doc
    .font("Times-Bold")
    .fontSize(30)
    .fillColor("#000000")
    .text(donation.donorName.toUpperCase(), 0, 252, {
      width: W,
      align: "center",
      lineBreak: false,
    });

  // ── All detail fields at font size 14 ─────────────────────
  // Every field uses an explicit x,y so nothing flows or shifts.
  doc.font("Times-Bold").fontSize(14).fillColor("#000000");

  // Row 1 — "Donated Rs. ___  PAN No. ___"
  // Amount value (after the printed "Donated Rs." label)
  doc.text(`${donation.amount}/-`, 255, 318, { lineBreak: false });
  // PAN value (after the printed "PAN No." label)
  doc.text(donation.panNo || "N/A", 560, 318, { lineBreak: false });

  // Row 2 — "For account of ___ donated via ___ having reference"
  const accountType = (donation.type || "HEALTH CARE").toUpperCase();
  doc.text(accountType, 250, 349, { lineBreak: false });

  const paymentModeLabel =
    donation.paymentMode === "CASH"
      ? (donation.gatewayName || "CASH").toUpperCase()
      : (donation.gatewayName || "NEFT/IMPS").toUpperCase();
  doc.text(paymentModeLabel, 512, 349, { lineBreak: false });

  // Row 3 — "no. ___ drawn ___ dated ___"
  doc.text(serialNumber, 155, 380, { lineBreak: false });

  const drawnSource = (
    donation.gatewayName ||
    (donation.paymentMode === "ONLINE" ? "GOOGLE PAY" : "OFFICE")
  ).toUpperCase();
  doc.text(drawnSource, 382, 380, { lineBreak: false });

  doc.text(getTableDateStr(donation.donationDate), 530, 380, {
    lineBreak: false,
  });
};

// ─────────────────────────────────────────────────────────────
// Buffer version — used by email attachment generator
// ─────────────────────────────────────────────────────────────
export const generateCertificatePDFBuffer = async (donation) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
      });

      const buffers = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      await generateCertificatePDF(doc, donation);
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// ─────────────────────────────────────────────────────────────
// Download endpoint — streams PDF directly to browser
// ─────────────────────────────────────────────────────────────
export const downloadCertificate = async (req, res) => {
  const { id } = req.params;

  try {
    const donation = await Donation.findById(id);
    if (!donation) {
      return res
        .status(404)
        .json({ success: false, message: "Donation not found" });
    }

    if (donation.paymentStatus !== "SUCCESS") {
      return res.status(400).json({
        success: false,
        message: "Certificate can only be generated for successful donations",
      });
    }

    const cleanDonorName = donation.donorName.replace(/[^a-zA-Z0-9]/g, "_");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Donation_Certificate_${cleanDonorName}.pdf"`
    );

    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
    });

    doc.pipe(res);
    await generateCertificatePDF(doc, donation);
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