import express from "express";
import cors from "cors";
import "dotenv/config";

import citiesRouter from "./routes/cities";
import calculateRouter from "./routes/calculate";
import authRouter from "./routes/auth";
import adminCitiesRouter from "./routes/admin/cities";
import adminRegimesRouter from "./routes/admin/regimes";
import adminTaxConfigsRouter from "./routes/admin/taxConfigs";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "*",
  })
);
app.use(express.json());

// Public
app.use("/api/cities", citiesRouter);
app.use("/api/calculate", calculateRouter);
app.use("/api/auth", authRouter);

// Admin
app.use("/api/admin/cities", adminCitiesRouter);
app.use("/api/admin", adminRegimesRouter);
app.use("/api/admin/tax-configs", adminTaxConfigsRouter);

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
