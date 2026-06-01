import express from "express";
import { downloadTransactionReceipt } from "../controllers/receipt.controller.js";

const router = express.Router();

router.get("/download-receipt/:id", downloadTransactionReceipt);

export default router;
