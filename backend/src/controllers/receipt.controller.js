import PDFDocument from "pdfkit";
import Donation from "../models/donation.models.js";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logoPath = path.join(__dirname, "../assets/logo.png");

// Helper to format date as DD-MMM-YYYY (e.g. 10-Jun-2026)
const getReceiptDateStr = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

// Helper to format date as DD-MM-YYYY (e.g. 10-06-2026)
const getTableDateStr = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

// Generate and stream the transaction receipt PDF matching Image 1
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

    // Create a portrait A4 PDF document with optimized margins to fit on one page
    const doc = new PDFDocument({
      size: "A4",
      layout: "portrait",
      margins: { top: 30, bottom: 30, left: 45, right: 45 },
    });

    // Pipe PDF directly to response stream
    doc.pipe(res);

    const width = doc.page.width;
    const pageMargin = 45;
    const contentWidth = width - 2 * pageMargin;

    // --- LETTERHEAD LOGO IMAGE ---
    const logoWidth = 100;
    const logoHeight = 63;
    const logoX = (width - logoWidth) / 2;
    doc.image(logoPath, logoX, 30, { width: logoWidth, height: logoHeight });

    // Crimson colored line separator under the logo
    const lineY = 105;
    doc
      .lineWidth(1.5)
      .strokeColor("#B91C1C")
      .moveTo(pageMargin, lineY)
      .lineTo(width - pageMargin, lineY)
      .stroke();

    // --- TOP REFERENCE & DATE ---
    const receiptDateStr = getReceiptDateStr(donation.donationDate);
    const refY = lineY + 10;
    
    doc
      .fillColor("#000000")
      .font("Times-Roman")
      .fontSize(9.5);
      
    // Write reference on left and date on right in the same line below the letterhead line
    doc.text("45147/2025-26/L4C", pageMargin, refY, { continued: true });
    doc.text(receiptDateStr, { align: "right" });

    // --- TO ADDRESS BLOCK ---
    doc.y = refY + 15;
    doc.font("Times-Roman").fontSize(9.5);
    doc.text("To,");
    doc.text(donation.donorName);
    doc.text(donation.donorAddress, { width: 300 });

    // --- SALUTATION ---
    doc.y = doc.y + 12;
    doc.text("Dear Sir/Madam,");

    // --- LETTER BODY ---
    doc.y = doc.y + 10;
    doc.text("This is to inform you that your donation has been successfully received.", {
      lineGap: 3
    });
    
    doc.moveDown(0.5);
    doc.text(
      "We at Look4Child Foundation show our absolute gratitude towards the donation made by you for saving a life of a child. Efforts made by you and us will surely bring bright change in one's life.",
      { lineGap: 3, width: contentWidth }
    );
    
    doc.moveDown(0.5);
    doc.text(
      "Thanks for being a part of our project JEEVAN. Indeed it feels great to be a reason for others smiles.",
      { lineGap: 3, width: contentWidth }
    );

    doc.moveDown(0.5);
    doc.text(
      "Further queries will be welcomed by Look For Child Foundation on the following contacts:-",
      { lineGap: 3, width: contentWidth }
    );

    // --- CONTACT DETAILS SINGLE LINE ---
    doc.moveDown(0.5);
    doc.font("Times-Bold").text("Contact NGO: ", { align: "center", continued: true });
    doc.font("Times-Roman").text("Call: +91-9899818585  |  Email: info@look4child.ngo  |  Web: www.look4child.ngo", { align: "center" });

    // --- WARM REGARDS ---
    doc.moveDown(0.8);
    doc.text("With Warm Regards,", pageMargin);
    doc.text("Team ", { continued: true });
    doc.font("Times-Bold").text("Look For Child Foundation.");

    // --- DONATION DETAILS HEADER ---
    doc.moveDown(1.2);
    doc
      .font("Times-Bold")
      .fontSize(10)
      .text("Donation Details", { align: "center", underline: true });

    // Format donation number to match Image 1 L4C-[uniqueCode]
    let donationNumber = donation.transactionId;
    if (donationNumber && donationNumber.startsWith("TXN")) {
      donationNumber = donationNumber.substring(3);
    }
    if (donationNumber && !donationNumber.startsWith("L4C-")) {
      donationNumber = `L4C-${donationNumber}`;
    }

    const tableDateStr = getTableDateStr(donation.donationDate);
    const donationStatus = donation.paymentStatus === "SUCCESS" ? "Paid" : donation.paymentStatus;

    // Table rows data
    const rows = [
      { label: "Donation Number:", value: donationNumber },
      { label: "Donation Date:", value: tableDateStr },
      { label: "Donation Status:", value: donationStatus },
      { label: "Recieved with thanks from", value: donation.donorName },
      { label: "Address", value: donation.donorAddress },
      { label: "E-mail:", value: donation.donorEmail },
      { label: "Pan No.", value: donation.panNo || "" },
      { label: "Phone Number:", value: donation.donorPhone },
      { label: "Payment Mode:", value: (donation.gatewayName || donation.paymentMode || "CASH").toUpperCase() },
      { label: "Reference Number:", value: donation.transactionId || "N/A" },
      { label: "Amount", value: `INR ${donation.amount}/-` },
    ];

    // --- DRAW TABLE ---
    const tableStartY = doc.y + 8;
    let currentY = tableStartY;
    const col1Width = 180;
    const col2Width = contentWidth - col1Width;
    const cellPadding = 4.5;

    rows.forEach((row) => {
      // Calculate height required for text in columns to support wrapping
      const labelHeight = doc.heightOfString(row.label, {
        width: col1Width - 2 * cellPadding,
        font: "Times-Roman",
        fontSize: 9,
      });
      const valueHeight = doc.heightOfString(row.value, {
        width: col2Width - 2 * cellPadding,
        font: "Times-Roman",
        fontSize: 9,
      });
      const rowHeight = Math.max(18, Math.max(labelHeight, valueHeight) + 2 * cellPadding);

      // Draw top line for the row
      doc
        .lineWidth(0.5)
        .strokeColor("#D1D5DB")
        .moveTo(pageMargin, currentY)
        .lineTo(width - pageMargin, currentY)
        .stroke();

      // Write cell text
      doc.fillColor("#000000").font("Times-Roman").fontSize(9);
      doc.text(row.label, pageMargin + cellPadding, currentY + cellPadding, {
        width: col1Width - 2 * cellPadding,
      });
      doc.text(row.value, pageMargin + col1Width + cellPadding, currentY + cellPadding, {
        width: col2Width - 2 * cellPadding,
      });

      currentY += rowHeight;
    });

    // Draw bottom table boundary line
    doc
      .lineWidth(0.5)
      .strokeColor("#D1D5DB")
      .moveTo(pageMargin, currentY)
      .lineTo(width - pageMargin, currentY)
      .stroke();

    // Draw outer boundary rectangle
    doc
      .lineWidth(0.5)
      .strokeColor("#9CA3AF")
      .rect(pageMargin, tableStartY, contentWidth, currentY - tableStartY)
      .stroke();

    // Draw vertical cell division line
    doc
      .lineWidth(0.5)
      .strokeColor("#D1D5DB")
      .moveTo(pageMargin + col1Width, tableStartY)
      .lineTo(pageMargin + col1Width, currentY)
      .stroke();

    // --- TABLE FOOTER (For / PAN) ---
    doc.y = currentY + 10;
    doc
      .fillColor("#000000")
      .font("Times-Bold")
      .fontSize(9.5);

    doc.text("For: Look4Child Foundation.", pageMargin, currentY + 10, { continued: true });
    doc.text("PAN: AAAAL4939Q", { align: "right" });

    // --- DOWNLOAD CERTIFICATE LINK ---
    const appUrl = process.env.VITE_APP_URL || "http://localhost:5000";
    const certificateUrl = `${appUrl}/api/certificate/download-certificate/${donation._id}`;

    doc.y = currentY + 30;
    doc
      .fillColor("#0000FF")
      .font("Times-Roman")
      .fontSize(9.5);

    doc.text("Click here to print your certificate.", {
      align: "center",
      underline: true,
      link: certificateUrl,
    });

    // --- FOOTER ADDRESS BLOCK ---
    const footerY = doc.page.height - 65;

    // Draw thin separator line for footer
    doc
      .lineWidth(0.5)
      .strokeColor("#D1D5DB")
      .moveTo(pageMargin, footerY - 10)
      .lineTo(width - pageMargin, footerY - 10)
      .stroke();

    doc
      .font("Times-Roman")
      .fontSize(8)
      .fillColor("#4B5563")
      .text("Regd. Office: Room No.1, Opp. Sarpanch Anant House, Tigra Village, Sec-57, Gurgaon", pageMargin, footerY, { align: "center", lineGap: 1.5, width: contentWidth })
      .text("Phone: +91 98998 18585  |  Email: info@look4child.ngo  |  Web: www.look4child.ngo", { align: "center", width: contentWidth });

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
