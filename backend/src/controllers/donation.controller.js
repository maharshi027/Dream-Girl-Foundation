import Donation from "../models/donation.models.js";
import Razorpay from "razorpay";
import crypto from "crypto";

// Initiate an online donation order
export const initiateOnline = async (req, res) => {
  const { name, email, phone, amount } = req.body || {};

  try {
    // Validate required fields
    if (!name || !email || !amount) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and amount are required",
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

    const donation = new Donation({
      donorName: name,
      donorEmail: email,
      donorPhone: phone || "",
      amount: numericAmount,
      paymentMode: "ONLINE",
      paymentStatus: "PENDING",
      razorpayOrderId: orderId,
    });

    await donation.save();

    res.status(200).json({
      success: true,
      order,
      donationId: donation._id,
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
  const { name, email, phone, amount } = req.body || {};

  try {
    // Validate required fields
    if (!name || !email || !amount) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and amount are required",
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

    const donation = new Donation({
      donorName: name,
      donorEmail: email,
      donorPhone: phone || "",
      amount: numericAmount,
      paymentMode: "CASH",
      paymentStatus: "SUCCESS",
    });

    await donation.save();

    res.status(201).json({
      success: true,
      message: "Cash donation recorded successfully",
      donationId: donation._id,
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

// Delete donor record
export const deleteRecord = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await Donation.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Donation record deleted successfully",
    });
  } catch (error) {
    console.error("Delete Donation Record Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete donation record",
      error: error.message,
    });
  }
};
