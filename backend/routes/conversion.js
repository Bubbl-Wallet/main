import express from "express";
const router = express.Router();

import { getConversion } from "../controllers/conversionController.js";

router.get("/", getConversion);

export default router;
