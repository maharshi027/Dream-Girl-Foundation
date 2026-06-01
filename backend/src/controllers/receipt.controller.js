import PDFDocument from "pdfkit";
import Donation from "../models/donation.models.js";

// Generate and stream the transaction receipt PDF
export const downloadTransactionReceipt = async (req, res) => {
  const { id } = req.params;

  try {
    const donation = await Donation.findById(id);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation record not found",
      });
    }

    // Set response headers to force download as a PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=transaction_receipt_${donation.transactionId}.pdf`,
    );

    // Create a portrait A4 PDF document
    const doc = new PDFDocument({
      size: "A4",
      layout: "portrait",
      margins: { top: 30, bottom: 30, left: 30, right: 30 },
    });

    // Pipe PDF directly to response stream
    doc.pipe(res);

    const width = doc.page.width;
    const pageMargin = 30;
    const contentWidth = width - 2 * pageMargin;

    // --- DECORATIVE TOP BORDER ---
    doc.lineWidth(3);
    doc.strokeColor("#2563EB"); // Blue
    doc
      .moveTo(pageMargin, 25)
      .lineTo(width - pageMargin, 25)
      .stroke();

    // --- HEADER ---
    doc.y = 40;

    doc
      .fillColor("#1F2937")
      .font("Helvetica-Bold")
      .fontSize(16)
      .text("DREAM GIRL FOUNDATION", { align: "center" });

    doc
      .fillColor("#4B5563")
      .font("Helvetica")
      .fontSize(9)
      .text("Registered NGO | Transforming Lives of Underprivileged Girls", {
        align: "center",
      });

    doc.moveDown(0.8);

    // --- RECEIPT TITLE ---
    doc
      .fillColor("#2563EB")
      .font("Helvetica-Bold")
      .fontSize(14)
      .text("TRANSACTION RECEIPT", { align: "center" });

    doc.moveDown(0.8);

    // --- RECEIPT DETAILS BOX ---
    const boxY = doc.y;
    const boxHeight = 20;

    doc
      .strokeColor("#E5E7EB")
      .lineWidth(1)
      .rect(pageMargin, boxY, contentWidth, boxHeight)
      .stroke();

    doc
      .fillColor("#F3F4F6")
      .rect(pageMargin, boxY, contentWidth, boxHeight)
      .fill();

    doc
      .fillColor("#1F2937")
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(
        `Receipt ID: ${donation.transactionId}`,
        pageMargin + 10,
        boxY + 5,
        {
          width: contentWidth / 2,
        },
      )
      .text(
        `Date: ${new Date(donation.donationDate).toLocaleDateString("en-IN")}`,
        pageMargin + contentWidth / 2 + 10,
        boxY + 5,
        { width: contentWidth / 2 - 20 },
      );

    doc.moveDown(2);

    // --- DONOR INFORMATION SECTION ---
    doc
      .fillColor("#1F2937")
      .font("Helvetica-Bold")
      .fontSize(11)
      .text("DONOR INFORMATION", pageMargin, doc.y);

    doc.moveDown(0.3);

    // Donor details box
    const donorBoxY = doc.y;
    doc
      .strokeColor("#2563EB")
      .lineWidth(1.5)
      .rect(pageMargin, donorBoxY - 5, contentWidth, 90)
      .stroke();

    doc
      .fillColor("#EFF6FF")
      .rect(pageMargin, donorBoxY - 5, contentWidth, 90)
      .fill();

    doc
      .fillColor("#374151")
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("Name:", pageMargin + 10, donorBoxY, { width: 80 })
      .fillColor("#1F2937")
      .font("Helvetica")
      .fontSize(9)
      .text(donation.donorName, pageMargin + 100, donorBoxY, {
        width: contentWidth - 120,
      });

    doc
      .fillColor("#374151")
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("Email:", pageMargin + 10, donorBoxY + 18, { width: 80 })
      .fillColor("#1F2937")
      .font("Helvetica")
      .fontSize(9)
      .text(donation.donorEmail, pageMargin + 100, donorBoxY + 18, {
        width: contentWidth - 120,
      });

    doc
      .fillColor("#374151")
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("Phone:", pageMargin + 10, donorBoxY + 36, { width: 80 })
      .fillColor("#1F2937")
      .font("Helvetica")
      .fontSize(9)
      .text(donation.donorPhone, pageMargin + 100, donorBoxY + 36, {
        width: contentWidth - 120,
      });

    doc
      .fillColor("#374151")
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("Address:", pageMargin + 10, donorBoxY + 54, { width: 80 })
      .fillColor("#1F2937")
      .font("Helvetica")
      .fontSize(9)
      .text(donation.donorAddress, pageMargin + 100, donorBoxY + 54, {
        width: contentWidth - 120,
      });

    doc
      .fillColor("#374151")
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("PAN No.:", pageMargin + 10, donorBoxY + 72, { width: 80 })
      .fillColor("#1F2937")
      .font("Helvetica")
      .fontSize(9)
      .text(donation.panNo, pageMargin + 100, donorBoxY + 72, {
        width: contentWidth - 120,
      });

    doc.y = donorBoxY + 95;
    doc.moveDown(0.3);

    // --- TRANSACTION DETAILS SECTION ---
    doc
      .fillColor("#1F2937")
      .font("Helvetica-Bold")
      .fontSize(11)
      .text("TRANSACTION DETAILS", pageMargin, doc.y);

    doc.moveDown(0.3);

    // Transaction details table
    const tableY = doc.y;
    const col1X = pageMargin + 10;
    const col2X = pageMargin + contentWidth / 2 + 10;

    // Light background for table
    doc
      .fillColor("#F9FAFB")
      .rect(pageMargin, tableY - 5, contentWidth, 100)
      .fill();

    doc
      .strokeColor("#E5E7EB")
      .lineWidth(0.5)
      .rect(pageMargin, tableY - 5, contentWidth, 100)
      .stroke();

    let tableRowY = tableY;

    // Row 1
    doc
      .fillColor("#374151")
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("Payment Mode:", col1X, tableRowY)
      .fillColor("#1F2937")
      .font("Helvetica")
      .text(
        donation.paymentMode === "CASH" ? "💵 Cash" : "🌐 Online",
        col2X,
        tableRowY,
      );

    tableRowY += 18;

    // Row 2
    doc
      .fillColor("#374151")
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("Payment Status:", col1X, tableRowY);

    const statusColor =
      donation.paymentStatus === "SUCCESS" ? "#059669" : "#DC2626";
    doc
      .fillColor(statusColor)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text(donation.paymentStatus, col2X, tableRowY);

    tableRowY += 18;

    // Row 3
    doc
      .fillColor("#374151")
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("Donation Amount:", col1X, tableRowY)
      .fillColor("#1F2937")
      .font("Helvetica-Bold")
      .fontSize(11)
      .text(`₹ ${donation.amount.toLocaleString("en-IN")}`, col2X, tableRowY);

    tableRowY += 18;

    // Row 4
    doc
      .fillColor("#374151")
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("Transaction ID:", col1X, tableRowY)
      .fillColor("#1F2937")
      .font("Helvetica")
      .fontSize(8)
      .text(donation.transactionId, col2X, tableRowY);

    tableRowY += 18;

    // Row 5 (Razorpay details if online)
    if (donation.paymentMode === "ONLINE") {
      doc
        .fillColor("#374151")
        .font("Helvetica-Bold")
        .fontSize(9)
        .text("Order ID:", col1X, tableRowY)
        .fillColor("#1F2937")
        .font("Helvetica")
        .fontSize(8)
        .text(donation.razorpayOrderId || "N/A", col2X, tableRowY);

      tableRowY += 18;

      doc
        .fillColor("#374151")
        .font("Helvetica-Bold")
        .fontSize(9)
        .text("Payment ID:", col1X, tableRowY)
        .fillColor("#1F2937")
        .font("Helvetica")
        .fontSize(8)
        .text(donation.razorpayPaymentId || "N/A", col2X, tableRowY);
    }

    doc.y = tableY + 105;

    // --- THANK YOU MESSAGE ---
    doc.moveDown(1);

    doc
      .fillColor("#2563EB")
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("THANK YOU FOR YOUR DONATION!", { align: "center" });

    doc
      .fillColor("#4B5563")
      .font("Helvetica")
      .fontSize(9)
      .text(
        "Your generous contribution helps us empower underprivileged girls.",
        { align: "center" },
      );

    doc.moveDown(0.8);

    // --- FOOTER ---
    const footerY = doc.page.height - 60;
    doc.y = footerY;

    doc
      .strokeColor("#E5E7EB")
      .lineWidth(0.5)
      .moveTo(pageMargin, footerY)
      .lineTo(width - pageMargin, footerY)
      .stroke();

    doc
      .fillColor("#6B7280")
      .font("Helvetica")
      .fontSize(8)
      .text("Dream Girl Foundation | www.dreamgirlfoundation.org", {
        align: "center",
      })
      .text("For queries, contact us at: support@dreamgirlfoundation.org", {
        align: "center",
      })
      .text(
        `Receipt Generated: ${new Date().toLocaleString("en-IN")} | Reference: ${donation._id}`,
        { align: "center" },
      );

    // End Document stream
    doc.end();
  } catch (error) {
    console.error("Receipt Generation Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate transaction receipt",
      error: error.message,
    });
  }
};
