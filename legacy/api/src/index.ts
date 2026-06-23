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

// NOTE: The former admin routes (/api/admin/cities, /api/admin/regimes,
// /api/admin/tax-configs) were removed — they targeted the pre-v3 schema
// (TaxRegime, HomeTaxConfig, CityDetail, City.translations/isHomeCity), all of
// which no longer exist. Admin CRUD must be rebuilt against the v3 schema
// (SpecialRegime/ExitRule by country, costOfLivingItem, etc.) before re-mounting.

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
