import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import { getReceiptSerialNumber, getReceiptDateStr, getTableDateStr } from "../controllers/receipt.controller.js";
import { generateCertificatePDFBuffer } from "../controllers/certificate.controller.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logoPath = path.join(__dirname, "../assets/logo.png");

// Globally cached SMTP transporter using connection pooling to reduce handshake latency
let cachedTransporter = null;

const getTransporter = () => {
  if (!cachedTransporter) {
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.SMTP_PORT || "587");
    const user = process.env.SMTP_USER || process.env.ADMIN_EMAIL;
    const pass = process.env.SMTP_PASS || process.env.ADMIN_PASSWORD;

    const isSecure = port === 465 || process.env.SMTP_SECURE === "true";

    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure: isSecure,
      family: 4, // Force IPv4 to bypass Render's unsupported IPv6 network routing
      pool: true, // Use connection pool
      maxConnections: 5,
      maxMessages: 100,
      auth: {
        user,
        pass,
      },
      connectionTimeout: 10000, // 10 seconds timeout for establishing TCP connection
      socketTimeout: 10000,     // 10 seconds idle timeout for socket
      greetingTimeout: 10000,   // 10 seconds timeout for greeting response
    });
  }
  return cachedTransporter;
};


const buildEmailHtml = (donation, donationNumber, receiptDateStr, tableDateStr, donationStatus, paymentMode, backendUrl) => {
  return `
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
                    ${donationNumber}
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
};

/**
 * Common implementation to build attachment and send mail.
 */
const sendMailWithCertificate = async (donation, backendUrl, subject) => {
  const serialNumber = await getReceiptSerialNumber(donation);
  const receiptDateStr = getReceiptDateStr(donation.donationDate);
  const tableDateStr = getTableDateStr(donation.donationDate);
  const donationStatus = donation.paymentStatus === "SUCCESS" ? "Paid" : donation.paymentStatus;
  const paymentMode = (donation.gatewayName || donation.paymentMode || "CASH").toUpperCase();

  const transporter = getTransporter();
  const htmlContent = buildEmailHtml(donation, serialNumber, receiptDateStr, tableDateStr, donationStatus, paymentMode, backendUrl);

  let certificateAttachment;
  try {
    const certBuffer = await generateCertificatePDFBuffer(donation);
    const cleanDonorName = donation.donorName.replace(/[^a-zA-Z0-9]/g, "_");
    certificateAttachment = {
      filename: `Donation_Certificate_${cleanDonorName}.pdf`,
      content: certBuffer,
      contentType: "application/pdf",
    };
  } catch (certErr) {
    console.error("Failed to generate Certificate attachment for email:", certErr);
  }

  const mailOptions = {
    from: `Look For Child Foundation <${process.env.SMTP_USER || process.env.ADMIN_EMAIL}>`,
    to: donation.donorEmail,
    subject: subject,
    html: htmlContent,
    attachments: [
      {
        filename: "logo.png",
        path: logoPath,
        cid: "logo",
      },
    ],
  };

  if (certificateAttachment) {
    mailOptions.attachments.push(certificateAttachment);
  }

  return transporter.sendMail(mailOptions);
};

/**
 * Sends a receipt email for an offline cash/cheque/UPI donation entry.
 */
export const sendOfflineDonationEmail = async (donation, backendUrl) => {
  const subject = `Donation Certificate & Receipt - Look For Child Foundation`;
  return sendMailWithCertificate(donation, backendUrl, subject);
};

/**
 * Sends a receipt email for an online Razorpay donation entry.
 */
export const sendOnlineDonationEmail = async (donation, backendUrl) => {
  const subject = `Donation Certificate & Receipt - Look For Child Foundation`;
  return sendMailWithCertificate(donation, backendUrl, subject);
};

import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOfflineDonationEmail = async (donation, backendUrl) => {
  return resend.emails.send({
    from: "Look For Child Foundation <noreply@look4child.ngo>",
    to: donation.donorEmail,
    subject: "Donation Certificate & Receipt - Look For Child Foundation",
    html: buildEmailHtml(...),   // your existing function
    attachments: [{ filename: "certificate.pdf", content: certBuffer }],
  });
};