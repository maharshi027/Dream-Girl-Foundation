import PDFDocument from "pdfkit";
import Donation from "../models/donation.models.js";

// Helper to format date as DD-MM-YYYY (e.g. 10-06-2026)
const getTableDateStr = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

// Helper to draw the double border and corner flourishes
const drawCertificateBorders = (doc, width, height) => {
  const crimsonRed = "#B91C1C";
  
  // 1. Outer thin border
  doc
    .lineWidth(2.5)
    .strokeColor(crimsonRed)
    .rect(30, 30, width - 60, height - 60)
    .stroke();

  // 2. Inner dashed border
  doc
    .lineWidth(1)
    .strokeColor(crimsonRed)
    .rect(38, 38, width - 76, height - 76)
    .dash(2, { space: 2 })
    .stroke();
    
  // Important: always reset dash style after drawing dashed lines
  doc.undash();

  // 3. Corner flourishes
  const cornerLength = 20;
  doc.lineWidth(1.5).strokeColor(crimsonRed);
  
  // Top Left
  doc.moveTo(46, 46 + cornerLength).lineTo(46, 46).lineTo(46 + cornerLength, 46).stroke();
  // Top Right
  doc.moveTo(width - 46, 46 + cornerLength).lineTo(width - 46, 46).lineTo(width - 46 - cornerLength, 46).stroke();
  // Bottom Left
  doc.moveTo(46, height - 46 - cornerLength).lineTo(46, height - 46).lineTo(46 + cornerLength, height - 46).stroke();
  // Bottom Right
  doc.moveTo(width - 46, height - 46 - cornerLength).lineTo(width - 46, height - 46).lineTo(width - 46 - cornerLength, height - 46).stroke();
};

// Generate and stream the certificate PDF
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

    // Set response headers to force download as a PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=certificate_${donation._id}.pdf`,
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

    // --- DRAW DECORATIVE BORDERS ---
    drawCertificateBorders(doc, width, height);

    // --- TOP REFERENCE & PAN ---
    doc
      .fillColor("#000000")
      .font("Times-Roman")
      .fontSize(9.5);

    doc.text("45147/2025-26/L4C", 54, 52, { continued: true });
    doc.text("PAN : AAAAL4939Q", { align: "right" });

    // --- LOGO (Look Child Foundation) ---
    doc.y = 65;
    doc
      .font("Times-BoldItalic")
      .fontSize(22)
      .fillColor("#059669")
      .text("Look ", { align: "center", continued: true });
      
    doc
      .fillColor("#2563EB")
      .text("child", { continued: true });
      
    doc
      .font("Times-Roman")
      .fontSize(9)
      .fillColor("#4B5563")
      .text("\nFoundation", { align: "center" });

    // --- CERTIFICATE OF DONATION TITLE ---
    doc.moveDown(1.5);
    doc
      .font("Times-Bold")
      .fontSize(26)
      .fillColor("#B91C1C")
      .text("CERTIFICATE OF DONATION", { align: "center" });

    // --- CERTIFICATION SUBTEXT ---
    doc.moveDown(0.6);
    doc
      .font("Times-Italic")
      .fontSize(13)
      .fillColor("#4B5563")
      .text("This is to certify that", { align: "center" });

    // --- DIVIDER LINE WITH DIAMOND 1 ---
    const lineY1 = doc.y + 12;
    doc
      .lineWidth(0.8)
      .strokeColor("#B91C1C")
      .moveTo(width / 2 - 160, lineY1)
      .lineTo(width / 2 + 160, lineY1)
      .stroke();
    
    doc
      .fillColor("#B91C1C")
      .rect(width / 2 - 4, lineY1 - 4, 8, 8)
      .fill();

    // --- DONOR NAME ---
    doc.y = lineY1 + 18;
    doc
      .font("Times-Bold")
      .fontSize(22)
      .fillColor("#1F2937")
      .text(donation.donorName.toUpperCase(), { align: "center" });

    // --- DIVIDER LINE WITH DIAMOND 2 ---
    const lineY2 = doc.y + 12;
    doc
      .lineWidth(0.8)
      .strokeColor("#B91C1C")
      .moveTo(width / 2 - 160, lineY2)
      .lineTo(width / 2 + 160, lineY2)
      .stroke();
    
    doc
      .fillColor("#B91C1C")
      .rect(width / 2 - 4, lineY2 - 4, 8, 8)
      .fill();

    // --- DETAILS INPUT UNDERLINES GRID ---
    doc.y = lineY2 + 25;
    
    // Line 1
    doc
      .font("Times-Italic")
      .fontSize(12)
      .fillColor("#374151");
      
    doc.text("Donated Rs. ", 80, lineY2 + 25, { continued: true });
    doc.font("Times-Bold").text(`  ${donation.amount}/-  `, { underline: true, continued: true });
    doc.font("Times-Italic").text("         PAN No. ", { underline: false, continued: true });
    doc.font("Times-Bold").text(`  ${donation.panNo || "                    "}  `, { underline: true });

    // Line 2
    doc.y = lineY2 + 55;
    doc.font("Times-Italic");
    doc.text("For account of ", 80, lineY2 + 55, { continued: true });
    
    const accountType = (donation.type || "HEALTH CARE").toUpperCase();
    doc.font("Times-Bold").text(`  ${accountType}  `, { underline: true, continued: true });
    doc.font("Times-Italic").text(" donated via ", { underline: false, continued: true });
    
    const paymentModeLabel = donation.paymentMode === "CASH" ? (donation.gatewayName || "CASH").toUpperCase() : "NEFT/IMPS";
    doc.font("Times-Bold").text(`  ${paymentModeLabel}  `, { underline: true, continued: true });
    
    doc.font("Times-Italic").text(" having reference no. ", { underline: false, continued: true });
    const refNo = donation.transactionId || donation.razorpayPaymentId || "--NA--";
    doc.font("Times-Bold").text(`  ${refNo}  `, { underline: true, continued: true });
    
    doc.font("Times-Italic").text(" drawn ", { underline: false, continued: true });
    const drawnSource = (donation.gatewayName || (donation.paymentMode === "ONLINE" ? "GOOGLE PAY" : "OFFICE")).toUpperCase();
    doc.font("Times-Bold").text(`  ${drawnSource}  `, { underline: true, continued: true });
    
    doc.font("Times-Italic").text(" dated ", { underline: false, continued: true });
    doc.font("Times-Bold").text(`  ${getTableDateStr(donation.donationDate)}  `, { underline: true });

    // --- 80G REGISTRATION & EXEMPTION INFO ---
    doc.y = lineY2 + 100;
    doc
      .font("Times-Roman")
      .fontSize(9)
      .fillColor("#4B5563")
      .text("Registered u/s 80G of Income Tax Act, Vide Reg. No. AAAAL4939QE20211", { align: "center" });

    doc.moveDown(0.2);
    doc
      .font("Times-Bold")
      .fontSize(10)
      .fillColor("#B91C1C")
      .text("Donation is Exempted u/s 80G of IT act, 1961", { align: "center" });

    // --- BOTTOM CONTACTS (LEFT) ---
    const footerY = height - 120;
    
    doc.y = footerY;
    doc
      .font("Times-Bold")
      .fontSize(9.5)
      .fillColor("#000000")
      .text("Look For Child Foundation", 60, footerY);

    doc
      .font("Times-Roman")
      .fontSize(8)
      .fillColor("#4B5563")
      .text("Address: Room No.1, Opp. Sarpanch Anant House,", { lineGap: 2 });
    doc.text("         Tigra Village, Sec-57, Gurgaon", { lineGap: 2 });
    doc.text("Phone  : +91 98998 18585", { lineGap: 2 });
    doc.text("Email  : info@look4child.ngo");

    // --- BOTTOM SIGNATURE (RIGHT) ---
    doc.y = footerY;
    doc
      .font("Times-Bold")
      .fontSize(9)
      .fillColor("#4B5563")
      .text("For LOOK FOR CHILD FOUNDATION", width - 260, footerY, { align: "center", width: 200 });

    doc.y = footerY + 28;
    doc
      .font("Times-BoldItalic")
      .fontSize(16)
      .fillColor("#1E3A8A")
      .text("M. Lal", width - 260, footerY + 28, { align: "center", width: 200 });

    doc.y = footerY + 54;
    doc
      .font("Times-Roman")
      .fontSize(8)
      .fillColor("#4B5563")
      .text("President  Gen. Secretary  Treasurer", width - 260, footerY + 54, { align: "center", width: 200 });
      
    doc.fontSize(7).text("[SIGNATURE]", { align: "center", width: 200 });

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
