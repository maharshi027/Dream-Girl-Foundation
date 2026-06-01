import Donation from "../models/donation.models.js";
import Razorpay from "razorpay";
import crypto from "crypto";

// Initiate an online donation order
export const initiateOnline = async (req, res) => {
  const { name, email, phone, amount, address, panNo } = req.body || {};

  try {
    // Validate required fields
    if (!name || !email || !phone || !amount || !address || !panNo) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, phone, amount, address, and PAN number are required",
      });
    }

    // Validate amount
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid donation amount",
      });
    }

    // Validate PAN format
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(panNo.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid PAN format. Format should be: ABCDE1234F",
      });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const isSimulation =
      !keyId || !keySecret || keyId === "" || keySecret === "";

    let order = null;
    let orderId = "";

    if (isSimulation) {
      orderId = "order_mock_" + Math.random().toString(36).substring(2, 15);
      order = {
        id: orderId,
        amount: Math.round(numericAmount * 100),
        currency: "INR",
        mock: true,
      };
    } else {
      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      const options = {
        amount: Math.round(numericAmount * 100),
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      };

      order = await razorpay.orders.create(options);
      orderId = order.id;
    }

    // Generate transaction ID
    const transactionId =
      "TXN" + Date.now() + Math.random().toString(36).substring(2, 11);

    const donation = new Donation({
      donorName: name,
      donorEmail: email,
      donorPhone: phone,
      amount: numericAmount,
      donorAddress: address,
      panNo: panNo.toUpperCase(),
      donationDate: new Date(),
      paymentMode: "ONLINE",
      paymentStatus: "PENDING",
      razorpayOrderId: orderId,
      transactionId: transactionId,
    });

    await donation.save();

    res.status(200).json({
      success: true,
      order,
      donationId: donation._id,
      transactionId: transactionId,
      simulation: isSimulation,
    });
  } catch (error) {
    console.error("Initiate Online Donation Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to initiate online donation",
      error: error.message,
    });
  }
};

// Verify the Razorpay payment signature
export const verifyOnline = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body || {};

  try {
    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({
        success: false,
        message: "Payment parameters missing",
      });
    }

    const isMock = razorpay_order_id.startsWith("order_mock_");

    if (isMock) {
      const donation = await Donation.findOne({
        razorpayOrderId: razorpay_order_id,
      });

      if (!donation) {
        return res.status(404).json({
          success: false,
          message: "Donation not found",
        });
      }

      donation.paymentStatus = "SUCCESS";
      donation.razorpayPaymentId = razorpay_payment_id;
      donation.razorpaySignature = razorpay_signature || "mock_signature";
      await donation.save();

      return res.status(200).json({
        success: true,
        message: "Simulated donation verified successfully",
        donationId: donation._id,
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      const donation = await Donation.findOne({
        razorpayOrderId: razorpay_order_id,
      });

      if (!donation) {
        return res.status(404).json({
          success: false,
          message: "Donation not found",
        });
      }

      donation.paymentStatus = "SUCCESS";
      donation.razorpayPaymentId = razorpay_payment_id;
      donation.razorpaySignature = razorpay_signature;
      await donation.save();

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        donationId: donation._id,
      });
    }

    const donation = await Donation.findOne({
      razorpayOrderId: razorpay_order_id,
    });
    if (donation) {
      donation.paymentStatus = "FAILED";
      await donation.save();
    }

    return res.status(400).json({
      success: false,
      message: "Invalid payment signature",
    });
  } catch (error) {
    console.error("Verify Online Payment Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify payment",
      error: error.message,
    });
  }
};

// Record cash donation
export const recordCash = async (req, res) => {
  const { name, email, phone, amount, address, panNo, donationDate } =
    req.body || {};

  try {
    // Validate required fields
    if (!name || !email || !phone || !amount || !address || !panNo) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, phone, amount, address, and PAN number are required",
      });
    }

    // Validate amount
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid donation amount",
      });
    }

    // Validate PAN format (basic validation)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(panNo.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid PAN format. Format should be: ABCDE1234F",
      });
    }

    // Generate transaction ID
    const transactionId =
      "TXN" + Date.now() + Math.random().toString(36).substring(2, 11);

    const donation = new Donation({
      donorName: name,
      donorEmail: email,
      donorPhone: phone,
      amount: numericAmount,
      donorAddress: address,
      panNo: panNo.toUpperCase(),
      donationDate: donationDate ? new Date(donationDate) : new Date(),
      paymentMode: "CASH",
      paymentStatus: "SUCCESS",
      transactionId: transactionId,
    });

    await donation.save();

    res.status(201).json({
      success: true,
      message: "Cash donation recorded successfully",
      donationId: donation._id,
      transactionId: transactionId,
    });
  } catch (error) {
    console.error("Record Cash Donation Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record cash donation",
      error: error.message,
    });
  }
};

// Retrieve all donation history
export const getAllRecords = async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.status(200).json(donations);
  } catch (error) {
    console.error("Fetch All Donation Records Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch donation records",
      error: error.message,
    });
  }
};

// Update donor record details
export const updateRecord = async (req, res) => {
  const { id } = req.params;
  const {
    donorName,
    donorEmail,
    donorPhone,
    amount,
    paymentMode,
    paymentStatus,
  } = req.body || {};

  try {
    const donation = await Donation.findById(id);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    if (donorName) donation.donorName = donorName;
    if (donorEmail) donation.donorEmail = donorEmail;
    if (donorPhone !== undefined) donation.donorPhone = donorPhone;
    if (amount) {
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid donation amount",
        });
      }
      donation.amount = numericAmount;
    }
    if (paymentMode) donation.paymentMode = paymentMode;
    if (paymentStatus) donation.paymentStatus = paymentStatus;

    await donation.save();

    res.status(200).json({
      success: true,
      message: "Donation record updated successfully",
      donation,
    });
  } catch (error) {
    console.error("Update Donation Record Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update donation record",
      error: error.message,
    });
  }
};

// Delete donor record - DISABLED FOR SECURITY
export const deleteRecord = async (req, res) => {
  return res.status(403).json({
    success: false,
    message:
      "Deletion of donor records is not permitted for security and audit purposes",
  });
};

// Generate transaction receipt
export const generateTransactionReceipt = async (req, res) => {
  const { id } = req.params;

  try {
    const donation = await Donation.findById(id);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation record not found",
      });
    }

    // Return receipt data that will be used to generate PDF on frontend
    res.status(200).json({
      success: true,
      receipt: {
        transactionId: donation.transactionId,
        donorName: donation.donorName,
        donorEmail: donation.donorEmail,
        donorPhone: donation.donorPhone,
        donorAddress: donation.donorAddress,
        panNo: donation.panNo,
        amount: donation.amount,
        paymentMode: donation.paymentMode,
        paymentStatus: donation.paymentStatus,
        donationDate: donation.donationDate,
        recordedDate: donation.createdAt,
        razorpayPaymentId: donation.razorpayPaymentId || "N/A",
        razorpayOrderId: donation.razorpayOrderId || "N/A",
      },
    });
  } catch (error) {
    console.error("Generate Receipt Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate receipt",
      error: error.message,
    });
  }
};
