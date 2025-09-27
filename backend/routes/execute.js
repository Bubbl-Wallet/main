import express from "express";
const router = express.Router();
import dotenv from "dotenv";
dotenv.config();

import { executeTransaction } from "../controllers/executeController.js";
import { indexTransactions } from "../controllers/executeController.js";

router.post("/", executeTransaction);
router.post("/index", indexTransactions);

export default router;
