import express from "express";
import cors from "cors";
import "dotenv/config";

// Fail fast — these must be set before any request is served
if (!process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET environment variable must be set");
  process.exit(1);
}
if (!process.env.CORS_ORIGIN) {
  console.error("FATAL: CORS_ORIGIN environment variable must be set");
  process.exit(1);
}

import citiesRouter from "./routes/cities";
import calculateRouter from "./routes/calculate";
import authRouter from "./routes/auth";
import adminCitiesRouter from "./routes/admin/cities";
import adminRegimesRouter from "./routes/admin/regimes";
import adminTaxConfigsRouter from "./routes/admin/taxConfigs";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);
app.use(express.json({ limit: "100kb" }));

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
