-- CreateTable
CREATE TABLE "CountryIndicator" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "inflationCurrent" DOUBLE PRECISION,
    "inflationPrev" DOUBLE PRECISION,
    "inflationTrend" TEXT,
    "period" TEXT,
    "source" TEXT,
    "fetchedAt" TIMESTAMP(3),
    "forecastValue" DOUBLE PRECISION,
    "forecastYear" INTEGER,
    "forecastSource" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CountryIndicator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CountryIndicator_countryId_key" ON "CountryIndicator"("countryId");

-- AddForeignKey
ALTER TABLE "CountryIndicator" ADD CONSTRAINT "CountryIndicator_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
