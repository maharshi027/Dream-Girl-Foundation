import PDFDocument from "pdfkit";
import Donation from "../models/donation.models.js";
import {
  checkRecordExists,
  handleControllerError,
  BadRequestError,
} from "../utils/errorHandler.js";

// Generate and stream the certificate PDF
export const downloadCertificate = async (req, res) => {
  const { id } = req.params;

  try {
    const donation = await Donation.findById(id);
    checkRecordExists(donation, "Donation");

    if (donation.paymentStatus !== "SUCCESS") {
      throw new BadRequestError(
        "Certificate can only be generated for successful donations",
      );
    }

    // Set response headers to force download as a PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=certificate_${donation._id}.pdf`,
    );

    // Create a landscape A4 PDF document
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
    });

    // Pipe PDF directly to response stream
    doc.pipe(res);

    const width = doc.page.width;
    const height = doc.page.height;

    // --- DECORATIVE BORDERS ---
    // Outer Gold/Bronze Border
    doc.lineWidth(5);
    doc.strokeColor("#D4AF37"); // Gold
    doc.rect(20, 20, width - 40, height - 40).stroke();

    // Inner Thin Dark Red Border
    doc.lineWidth(1.5);
    doc.strokeColor("#991B1B"); // Deep Red/Crimson
    doc.rect(28, 28, width - 56, height - 56).stroke();

    // Elegant Corner Flourishes (Lines)
    const drawCorner = (x, y, xDir, yDir) => {
      doc.lineWidth(1);
      doc.strokeColor("#D4AF37");
      doc
        .moveTo(x, y + yDir * 30)
        .lineTo(x, y)
        .lineTo(x + xDir * 30, y)
        .stroke();
    };
    drawCorner(35, 35, 1, 1);
    drawCorner(width - 35, 35, -1, 1);
    drawCorner(35, height - 35, 1, -1);
    drawCorner(width - 35, height - 35, -1, -1);

    // --- HEADER ---
    doc.y = 55;

    // Organization Sub-badge
    doc
      .fillColor("#991B1B")
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("DREAM GIRL FOUNDATION", { align: "center", characterSpacing: 2 });

    doc.moveDown(0.2);

    doc
      .fillColor("#4B5563")
      .font("Helvetica")
      .fontSize(9)
      .text("Registered NGO | Transforming Lives of Underprivileged Girls", {
        align: "center",
      });

    doc.moveDown(1.2);

    // --- CERTIFICATE TITLE ---
    doc
      .fillColor("#1F2937")
      .font("Times-Bold")
      .fontSize(34)
      .text("CERTIFICATE OF DONATION", { align: "center" });

    // Decorative Line under title
    doc.lineWidth(1.5);
    doc.strokeColor("#D4AF37");
    doc
      .moveTo(width / 2 - 120, doc.y)
      .lineTo(width / 2 + 120, doc.y)
      .stroke();

    doc.moveDown(1.5);

    // --- BODY TEXT ---
    doc
      .fillColor("#374151")
      .font("Times-Italic")
      .fontSize(16)
      .text("This certificate is gratefully awarded to", { align: "center" });

    doc.moveDown(0.8);

    // Donor Name
    doc
      .fillColor("#991B1B")
      .font("Times-Bold")
      .fontSize(28)
      .text(donation.donorName, { align: "center" });

    // Border line under name
    doc.lineWidth(0.5);
    doc.strokeColor("#D1D5DB");
    doc
      .moveTo(width / 2 - 180, doc.y)
      .lineTo(width / 2 + 180, doc.y)
      .stroke();

    doc.moveDown(0.8);

    // Contribution detail
    const formattedAmount = "Rs. " + new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(donation.amount);

    doc
      .fillColor("#374151")
      .font("Times-Italic")
      .fontSize(15)
      .text(`in deep appreciation of their generous contribution of`, {
        align: "center",
      });

    doc.moveDown(0.4);

    doc
      .fillColor("#111827")
      .font("Helvetica-Bold")
      .fontSize(18)
      .text(formattedAmount, { align: "center" });

    doc.moveDown(0.4);

    doc
      .fillColor("#374151")
      .font("Helvetica")
      .fontSize(11)
      .text(
        `towards girls' education, nutrition, healthcare, and empowerment programs.`,
        { align: "center" },
      );

    // --- FOOTER & SIGNATURES ---
    const bottomY = height - 140;

    // Left Signature: Authorized Official
    doc
      .moveTo(80, bottomY)
      .lineTo(240, bottomY)
      .strokeColor("#9CA3AF")
      .lineWidth(0.8)
      .stroke();
    // Simple signature-like script illustration using text
    doc
      .fillColor("#1E3A8A")
      .font("Times-Italic")
      .fontSize(18)
      .text("Aditya Sharma", 85, bottomY - 26, { width: 150, align: "center" });
    doc
      .fillColor("#4B5563")
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("AUTHORITY SIGNATORY", 80, bottomY + 5, {
        width: 160,
        align: "center",
      })
      .font("Helvetica")
      .fontSize(8)
      .text("Dream Girl Foundation", 80, bottomY + 18, {
        width: 160,
        align: "center",
      });

    // Center Details: Date & Certificate ID
    const formattedDate = new Date(donation.createdAt).toLocaleDateString(
      "en-IN",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    );

    const detailsBoxX = width / 2 - 120;
    const detailsBoxY = bottomY - 30;

    // Soft background for details box
    doc.fillColor("#F9FAFB").rect(detailsBoxX, detailsBoxY, 240, 65).fill();
    doc.strokeColor("#E5E7EB").rect(detailsBoxX, detailsBoxY, 240, 65).stroke();

    doc
      .fillColor("#374151")
      .font("Helvetica-Bold")
      .fontSize(7.5)
      .text(`DATE OF LOG:`, detailsBoxX + 10, detailsBoxY + 12)
      .font("Helvetica")
      .text(formattedDate, detailsBoxX + 10, detailsBoxY + 24)
      .font("Helvetica-Bold")
      .text(`PAYMENT MODE:`, detailsBoxX + 10, detailsBoxY + 38)
      .font("Helvetica")
      .text(donation.paymentMode, detailsBoxX + 10, detailsBoxY + 49);

    doc
      .fillColor("#374151")
      .font("Helvetica-Bold")
      .fontSize(7.5)
      .text(`CERTIFICATE ID:`, detailsBoxX + 130, detailsBoxY + 12)
      .font("Helvetica")
      .fontSize(7)
      .text(donation._id.toString(), detailsBoxX + 130, detailsBoxY + 24)
      .font("Helvetica-Bold")
      .fontSize(7.5)
      .text(`STATUS:`, detailsBoxX + 130, detailsBoxY + 38)
      .font("Helvetica-Bold")
      .fillColor("#065F46")
      .text("VERIFIED SUCCESS", detailsBoxX + 130, detailsBoxY + 49);

    // Right Signature: Founder / Board
    doc
      .moveTo(width - 240, bottomY)
      .lineTo(width - 80, bottomY)
      .strokeColor("#9CA3AF")
      .lineWidth(0.8)
      .stroke();
    // Mock signature
    doc
      .fillColor("#1E3A8A")
      .font("Times-Italic")
      .fontSize(18)
      .text("Harshit Gupta", width - 235, bottomY - 26, {
        width: 150,
        align: "center",
      });
    doc
      .fillColor("#4B5563")
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("FOUNDER / CHAIRPERSON", width - 240, bottomY + 5, {
        width: 160,
        align: "center",
      })
      .font("Helvetica")
      .fontSize(8)
      .text("Dream Girl Foundation", width - 240, bottomY + 18, {
        width: 160,
        align: "center",
      });

    // End Document stream
    doc.end();
  } catch (error) {
    handleControllerError(error, res, "Certificate Generation");
  }
};
