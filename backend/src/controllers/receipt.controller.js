import PDFDocument from "pdfkit";
import Donation from "../models/donation.models.js";
import { fileURLToPath } from "url";
import path from "path";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logoPath = path.join(__dirname, "../assets/logo.png");

// Helper to format date as DD-MMM-YYYY (e.g. 10-Jun-2026)
export const getReceiptDateStr = (date) => {
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
export const getTableDateStr = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

// Helper to calculate the sequential receipt serial number
export const getReceiptSerialNumber = async (donation) => {
  const count = await Donation.countDocuments({
    createdAt: { $lt: donation.createdAt },
  });
  const baseNumber = 45147;
  const serialNo = baseNumber + count;

  // Financial year calculation
  const date = new Date(donation.donationDate);
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed, so April is 3
  let fy = "";
  if (month >= 3) { // April or later
    fy = `${year}-${String(year + 1).slice(-2)}`;
  } else {
    fy = `${year - 1}-${String(year).slice(-2)}`;
  }
  return `${serialNo}/${fy}/L4C`;
};

// Extracted PDF drawing function to allow reuse
export const generateReceiptPDF = async (doc, donation) => {
  const width = doc.page.width;
  const height = doc.page.height;
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
  const serialNumber = await getReceiptSerialNumber(donation);
  const refY = lineY + 10;
  
  doc
    .fillColor("#000000")
    .font("Times-Roman")
    .fontSize(9.5);
    
  // Write reference on left and date on right in the same line below the letterhead line
  doc.text(serialNumber, pageMargin, refY, { continued: true });
  doc.text(receiptDateStr, { align: "right" });

  // --- TO ADDRESS BLOCK ---
  doc.y = refY + 20;
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

  for (const row of rows) {
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
  }

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
};

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

    const cleanDonorName = donation.donorName.replace(/[^a-zA-Z0-9]/g, "_");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Donation Receipt_${cleanDonorName}.pdf"`,
    );

    // Create a portrait A4 PDF document
    const doc = new PDFDocument({
      size: "A4",
      layout: "portrait",
      margins: { top: 30, bottom: 30, left: 45, right: 45 },
    });

    // Pipe PDF directly to response stream
    doc.pipe(res);

    // Draw the receipt content
    await generateReceiptPDF(doc, donation);

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

// Generate PDF receipt as Buffer for attachments
export const generateReceiptPDFBuffer = async (donation) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        layout: "portrait",
        margins: { top: 30, bottom: 30, left: 45, right: 45 },
      });

      const buffers = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      await generateReceiptPDF(doc, donation);
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Create transporter for sending emails using SMTP credentials
const createTransporter = () => {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER || process.env.ADMIN_EMAIL;
  const pass = process.env.SMTP_PASS || process.env.ADMIN_PASSWORD;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
};

// Generate and email the receipt to the donor using beautiful HTML format
export const sendHtmlReceiptEmailInternal = async (donation) => {
  const serialNumber = await getReceiptSerialNumber(donation);
  const receiptDateStr = getReceiptDateStr(donation.donationDate);
  const tableDateStr = getTableDateStr(donation.donationDate);
  const donationStatus = donation.paymentStatus === "SUCCESS" ? "Paid" : donation.paymentStatus;

  // Format donation number to match Image 1 L4C-[uniqueCode]
  let donationNumber = donation.transactionId;
  if (donationNumber && donationNumber.startsWith("TXN")) {
    donationNumber = donationNumber.substring(3);
  }
  if (donationNumber && !donationNumber.startsWith("L4C-")) {
    donationNumber = `L4C-${donationNumber}`;
  }

  const paymentMode = (donation.gatewayName || donation.paymentMode || "CASH").toUpperCase();
  const transporter = createTransporter();
  const backendUrl = process.env.BACKEND_URL || "https://dream-girl-foundation.onrender.com";

  const htmlContent = `
<div style="font-family: 'Times New Roman', Times, serif; color: #333333; margin: 0; padding: 20px; background-color: #f9f9f9;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f9f9f9; padding: 20px 0;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Logo & Header -->
          <tr>
            <td align="center" style="padding-bottom: 15px;">
              <img src="cid:logo" alt="Look For Child Foundation Logo" style="width: 100px; height: auto; margin-bottom: 15px; display: block;" />
              <h2 style="color: #b91c1c; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">Look For Child Foundation</h2>
            </td>
          </tr>
          <!-- Crimson Line -->
          <tr>
            <td style="border-bottom: 2px solid #b91c1c; padding-bottom: 10px;"></td>
          </tr>
          <!-- Serial Number & Date -->
          <tr>
            <td style="padding-top: 15px; padding-bottom: 20px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="left" style="font-size: 13px; font-weight: bold; color: #555555;">
                    ${serialNumber}
                  </td>
                  <td align="right" style="font-size: 13px; font-weight: bold; color: #555555;">
                    Date: ${receiptDateStr}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Salutation & Body -->
          <tr>
            <td style="font-size: 14px; line-height: 1.6; color: #333333; padding-bottom: 20px;">
              <p>To,<br><strong>${donation.donorName}</strong><br>${donation.donorAddress}</p>
              <p>Dear Sir/Madam,</p>
              <p>This is to inform you that your donation has been successfully received.</p>
              <p>We at Look4Child Foundation show our absolute gratitude towards the donation made by you for saving the life of a child. Efforts made by you and us will surely bring bright change in one's life.</p>
              <p>Thanks for being a part of our project JEEVAN. Indeed it feels great to be a reason for others smiles.</p>
              
              <!-- Download Certificate Button Link -->
              <div style="text-align: center; margin: 25px 0;">
                <a href="${backendUrl}/api/certificate/download-certificate/${donation._id}" 
                   style="background-color: #b91c1c; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-family: Arial, sans-serif; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  📥 Download Donation Certificate
                </a>
              </div>

              <p>With Warm Regards,<br><strong>Team Look For Child Foundation.</strong></p>
            </td>
          </tr>
          <!-- Table Header -->
          <tr>
            <td align="center" style="font-size: 16px; font-weight: bold; text-decoration: underline; padding-bottom: 15px;">
              Donation Details
            </td>
          </tr>
          <!-- Table -->
          <tr>
            <td>
              <table cellpadding="8" cellspacing="0" border="1" width="100%" style="border-collapse: collapse; border-color: #d1d5db; font-size: 13px;">
                <tr>
                  <td width="35%" style="background-color: #f3f4f6; font-weight: bold;">Donation Number:</td>
                  <td>${donationNumber}</td>
                </tr>
                <tr>
                  <td style="background-color: #f3f4f6; font-weight: bold;">Donation Date:</td>
                  <td>${tableDateStr}</td>
                </tr>
                <tr>
                  <td style="background-color: #f3f4f6; font-weight: bold;">Donation Status:</td>
                  <td style="color: #10B981; font-weight: bold;">${donationStatus}</td>
                </tr>
                <tr>
                  <td style="background-color: #f3f4f6; font-weight: bold;">Received with thanks from:</td>
                  <td>${donation.donorName}</td>
                </tr>
                <tr>
                  <td style="background-color: #f3f4f6; font-weight: bold;">Address:</td>
                  <td>${donation.donorAddress}</td>
                </tr>
                <tr>
                  <td style="background-color: #f3f4f6; font-weight: bold;">E-mail:</td>
                  <td>${donation.donorEmail}</td>
                </tr>
                <tr>
                  <td style="background-color: #f3f4f6; font-weight: bold;">PAN No:</td>
                  <td>${donation.panNo || "N/A"}</td>
                </tr>
                <tr>
                  <td style="background-color: #f3f4f6; font-weight: bold;">Phone Number:</td>
                  <td>${donation.donorPhone}</td>
                </tr>
                <tr>
                  <td style="background-color: #f3f4f6; font-weight: bold;">Payment Mode:</td>
                  <td>${paymentMode}</td>
                </tr>
                <tr>
                  <td style="background-color: #f3f4f6; font-weight: bold;">Reference Number:</td>
                  <td>${donation.transactionId || "N/A"}</td>
                </tr>
                <tr>
                  <td style="background-color: #f3f4f6; font-weight: bold;">Amount:</td>
                  <td style="font-weight: bold; color: #b91c1c;">INR ${donation.amount}/-</td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- PAN Details -->
          <tr>
            <td style="padding-top: 15px; font-size: 13px; font-weight: bold;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="left">For: Look4Child Foundation.</td>
                  <td align="right">PAN: AAAAL4939Q</td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer Address -->
          <tr>
            <td style="border-top: 1px solid #d1d5db; margin-top: 30px; padding-top: 15px; font-size: 11px; color: #4b5563; text-align: center; line-height: 1.5;">
              Regd. Office: Room No.1, Opp. Sarpanch Anant House, Tigra Village, Sec-57, Gurgaon<br>
              Phone: +91 98998 18585 | Email: info@look4child.ngo | Web: www.look4child.ngo
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</div>
`;

  let pdfAttachment;
  try {
    const pdfBuffer = await generateReceiptPDFBuffer(donation);
    const cleanDonorName = donation.donorName.replace(/[^a-zA-Z0-9]/g, "_");
    pdfAttachment = {
      filename: `Donation_Receipt_${cleanDonorName}.pdf`,
      content: pdfBuffer,
      contentType: "application/pdf"
    };
  } catch (pdfErr) {
    console.error("Failed to generate PDF attachment for email:", pdfErr);
  }

  const mailOptions = {
    from: `Look For Child Foundation <${process.env.SMTP_USER || process.env.ADMIN_EMAIL}>`,
    to: donation.donorEmail,
    subject: `Donation Receipt - Look For Child Foundation`,
    html: htmlContent,
    attachments: [
      {
        filename: "logo.png",
        path: logoPath,
        cid: "logo",
      },
    ],
  };

  if (pdfAttachment) {
    mailOptions.attachments.push(pdfAttachment);
  }

  await transporter.sendMail(mailOptions);
};

// Generate and email the receipt to the donor (API route wrapper)
export const emailTransactionReceipt = async (req, res) => {
  const { id } = req.params;

  try {
    const donation = await Donation.findById(id);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation record not found",
      });
    }

    await sendHtmlReceiptEmailInternal(donation);

    res.status(200).json({
      success: true,
      message: "Receipt emailed successfully to donor",
    });
  } catch (error) {
    console.error("Email Receipt Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to email donation receipt",
      error: error.message,
    });
  }
};