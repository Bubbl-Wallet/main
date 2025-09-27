import express from "express";
const router = express.Router();

import {
  addTransaction,
  getAllTransactions,
  getTransaction,
} from "../controllers/transactionController.js";

router.post("/:walletAddress", addTransaction);
router.get("/all/:walletAddress", getAllTransactions);
router.get("/get/:walletAddress/:transactionId", getTransaction);

export default router;
