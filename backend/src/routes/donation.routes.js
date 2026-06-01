import express from "express";
import {
  initiateOnline,
  verifyOnline,
  recordCash,
  getAllRecords,
  updateRecord,
  deleteRecord,
  generateTransactionReceipt,
} from "../controllers/donation.controller.js";

const router = express.Router();

router.post("/initiate-online", initiateOnline);
router.post("/verify-online", verifyOnline);
router.post("/record-cash", recordCash);
router.get("/all-records", getAllRecords);
router.put("/update/:id", updateRecord);
router.get("/receipt/:id", generateTransactionReceipt);
router.delete("/delete/:id", deleteRecord);

export default router;
