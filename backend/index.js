import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import transactionRoute from "./routes/transaction.js";
import executeRoute from "./routes/execute.js";
import conversionRoute from "./routes/conversion.js";

dotenv.config({ path: "./.env" });

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

app.use("/transaction", transactionRoute);
app.use("/execute", executeRoute);
app.use("/conversion", conversionRoute);

app.listen(PORT, () => {
  console.log(`Bubble is initialized on port ${PORT}`);
});
