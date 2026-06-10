-- Trends-page boolean filter flags on Country (NOT scores; 0/1 filters).
-- All nullable: null = "Daten ausstehend" (no reliable source yet). Each flag
-- carries its own sourceUrl. Additive + nullable → safe, no backfill required.
ALTER TABLE "Country" ADD COLUMN "dbaGermany" BOOLEAN;
ALTER TABLE "Country" ADD COLUMN "dbaGermanySourceUrl" TEXT;
ALTER TABLE "Country" ADD COLUMN "euEea" BOOLEAN;
ALTER TABLE "Country" ADD COLUMN "euEeaSourceUrl" TEXT;
ALTER TABLE "Country" ADD COLUMN "nomadVisa" BOOLEAN;
ALTER TABLE "Country" ADD COLUMN "nomadVisaSourceUrl" TEXT;
