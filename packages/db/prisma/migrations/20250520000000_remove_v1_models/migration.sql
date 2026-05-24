-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "monthlyLimit" INTEGER NOT NULL DEFAULT 10000,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Calculation" (
    "id" TEXT NOT NULL,
    "shareToken" TEXT NOT NULL,
    "fromCityId" TEXT NOT NULL,
    "toCityId" TEXT NOT NULL,
    "inputData" JSONB NOT NULL,
    "outputData" JSONB NOT NULL,
    "isApproximate" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'de',
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "isSaved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Calculation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "flag" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "countryId" TEXT,
    "nameDE" TEXT,
    "nameEN" TEXT,
    "currency" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "timezone" TEXT,
    "mapboxId" TEXT,
    "isCapital" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CityLifestyle" (
    "id" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "descriptionDE" TEXT,
    "descriptionEN" TEXT,
    "source" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CityLifestyle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CityPOI" (
    "id" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "priceRange" INTEGER,
    "district" TEXT,
    "website" TEXT,

    CONSTRAINT "CityPOI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CitySearch" (
    "id" TEXT NOT NULL,
    "fromCityId" TEXT NOT NULL,
    "toCityId" TEXT NOT NULL,
    "grossRange" TEXT NOT NULL,
    "employment" TEXT,
    "lifestyle" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'de',
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CitySearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CitySearchAggregate" (
    "id" TEXT NOT NULL,
    "fromCityId" TEXT NOT NULL,
    "toCityId" TEXT NOT NULL,
    "searchCount" INTEGER NOT NULL DEFAULT 0,
    "period" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CitySearchAggregate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CityWeather" (
    "id" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "sunshineDays" INTEGER NOT NULL,
    "rainyDays" INTEGER NOT NULL,
    "avgTempSummer" DOUBLE PRECISION NOT NULL,
    "avgTempWinter" DOUBLE PRECISION NOT NULL,
    "humidityIndex" INTEGER NOT NULL,
    "weatherType" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CityWeather_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostOfLivingItem" (
    "id" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CostOfLivingItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameDE" TEXT NOT NULL,
    "nameEN" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "taxType" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sourceUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountryProfile" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "metaDescription" TEXT NOT NULL,
    "introText" TEXT NOT NULL,
    "keyFacts" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CountryProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deduction" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION,
    "percentage" DOUBLE PRECISION,
    "condition" TEXT,
    "year" INTEGER NOT NULL,

    CONSTRAINT "Deduction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "District" (
    "id" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEN" TEXT,
    "rent1BRLow" DOUBLE PRECISION,
    "rent1BRHigh" DOUBLE PRECISION,
    "safetyScore" INTEGER,
    "vibe" TEXT,
    "geoJson" JSONB,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExchangeRate" (
    "id" TEXT NOT NULL,
    "fromCurrency" TEXT NOT NULL,
    "toCurrency" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovingGuide" (
    "id" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "phase" TEXT NOT NULL,
    "titleDE" TEXT NOT NULL,
    "titleEN" TEXT NOT NULL,
    "subtitleDE" TEXT,
    "subtitleEN" TEXT,
    "timingDE" TEXT NOT NULL,
    "timingEN" TEXT NOT NULL,
    "isWarning" BOOLEAN NOT NULL DEFAULT false,
    "documents" JSONB NOT NULL,
    "infoBoxDE" TEXT,
    "infoBoxEN" TEXT,
    "infoBoxType" TEXT,
    "tags" JSONB,
    "forEmployed" BOOLEAN NOT NULL DEFAULT true,
    "forFreelancer" BOOLEAN NOT NULL DEFAULT true,
    "forFounder" BOOLEAN NOT NULL DEFAULT true,
    "forFamily" BOOLEAN NOT NULL DEFAULT true,
    "forPassive" BOOLEAN NOT NULL DEFAULT true,
    "forPair" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MovingGuide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovingPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fromCityId" TEXT NOT NULL,
    "toCityId" TEXT NOT NULL,
    "employment" TEXT NOT NULL,
    "situation" TEXT NOT NULL,
    "assets" JSONB NOT NULL,
    "nationality" TEXT NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'de',
    "completedStepIds" JSONB NOT NULL DEFAULT '[]',
    "skippedStepIds" JSONB NOT NULL DEFAULT '[]',
    "budgetItems" JSONB NOT NULL,
    "documents" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MovingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OneShot" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "stripePaymentId" TEXT NOT NULL,
    "fromCityId" TEXT NOT NULL,
    "toCityId" TEXT NOT NULL,
    "inputData" JSONB NOT NULL,
    "reportUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OneShot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryBenchmark" (
    "id" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "p25" DOUBLE PRECISION NOT NULL,
    "median" DOUBLE PRECISION NOT NULL,
    "p75" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryBenchmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialContribution" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "ceiling" DOUBLE PRECISION,
    "employeeSide" BOOLEAN NOT NULL,
    "year" INTEGER NOT NULL,

    CONSTRAINT "SocialContribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecialRegime" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameDE" TEXT NOT NULL,
    "nameEN" TEXT NOT NULL,
    "flatRate" DOUBLE PRECISION NOT NULL,
    "durationYears" INTEGER NOT NULL,
    "qualifications" JSONB NOT NULL,
    "conditionsDE" TEXT NOT NULL,
    "conditionsEN" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3),
    "sourceUrl" TEXT NOT NULL,
    "sourceDE" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpecialRegime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxBracket" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "fromAmount" DOUBLE PRECISION NOT NULL,
    "toAmount" DOUBLE PRECISION,
    "rate" DOUBLE PRECISION NOT NULL,
    "year" INTEGER NOT NULL,
    "employmentType" TEXT NOT NULL,

    CONSTRAINT "TaxBracket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "planExpiresAt" TIMESTAMP(3),
    "onboardingDone" BOOLEAN NOT NULL DEFAULT false,
    "grossAnnual" DOUBLE PRECISION,
    "employment" TEXT,
    "familyStatus" TEXT,
    "childrenCount" INTEGER DEFAULT 0,
    "childrenAges" JSONB,
    "kvType" TEXT,
    "taxResidency" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisaRule" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "fromNationality" TEXT NOT NULL,
    "visaType" TEXT NOT NULL,
    "nameDE" TEXT NOT NULL,
    "nameEN" TEXT NOT NULL,
    "requirementsDE" TEXT NOT NULL,
    "requirementsEN" TEXT NOT NULL,
    "processingDays" TEXT NOT NULL,
    "costEUR" INTEGER,
    "sourceUrl" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisaRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchlistItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "alertsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WatchlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_key_key" ON "ApiKey"("key" ASC);

-- CreateIndex
CREATE INDEX "Calculation_shareToken_idx" ON "Calculation"("shareToken" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Calculation_shareToken_key" ON "Calculation"("shareToken" ASC);

-- CreateIndex
CREATE INDEX "Calculation_userId_createdAt_idx" ON "Calculation"("userId" ASC, "createdAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "City_slug_key" ON "City"("slug" ASC);

-- CreateIndex
CREATE INDEX "CitySearch_fromCityId_createdAt_idx" ON "CitySearch"("fromCityId" ASC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "CitySearch_fromCityId_toCityId_idx" ON "CitySearch"("fromCityId" ASC, "toCityId" ASC);

-- CreateIndex
CREATE INDEX "CitySearch_toCityId_createdAt_idx" ON "CitySearch"("toCityId" ASC, "createdAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "CitySearchAggregate_fromCityId_toCityId_period_key" ON "CitySearchAggregate"("fromCityId" ASC, "toCityId" ASC, "period" ASC);

-- CreateIndex
CREATE INDEX "CitySearchAggregate_toCityId_searchCount_idx" ON "CitySearchAggregate"("toCityId" ASC, "searchCount" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "CityWeather_cityId_key" ON "CityWeather"("cityId" ASC);

-- CreateIndex
CREATE INDEX "CostOfLivingItem_cityId_category_periodStart_idx" ON "CostOfLivingItem"("cityId" ASC, "category" ASC, "periodStart" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Country_slug_key" ON "Country"("slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "CountryProfile_countryId_locale_key" ON "CountryProfile"("countryId" ASC, "locale" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "ExchangeRate_fromCurrency_toCurrency_key" ON "ExchangeRate"("fromCurrency" ASC, "toCurrency" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "MovingPlan_userId_fromCityId_toCityId_key" ON "MovingPlan"("userId" ASC, "fromCityId" ASC, "toCityId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "OneShot_stripePaymentId_key" ON "OneShot"("stripePaymentId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_email_key" ON "UserProfile"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_stripeCustomerId_key" ON "UserProfile"("stripeCustomerId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "WatchlistItem_userId_cityId_key" ON "WatchlistItem"("userId" ASC, "cityId" ASC);

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calculation" ADD CONSTRAINT "Calculation_fromCityId_fkey" FOREIGN KEY ("fromCityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calculation" ADD CONSTRAINT "Calculation_toCityId_fkey" FOREIGN KEY ("toCityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calculation" ADD CONSTRAINT "Calculation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CityLifestyle" ADD CONSTRAINT "CityLifestyle_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CityPOI" ADD CONSTRAINT "CityPOI_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CitySearch" ADD CONSTRAINT "CitySearch_fromCityId_fkey" FOREIGN KEY ("fromCityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CitySearch" ADD CONSTRAINT "CitySearch_toCityId_fkey" FOREIGN KEY ("toCityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CityWeather" ADD CONSTRAINT "CityWeather_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostOfLivingItem" ADD CONSTRAINT "CostOfLivingItem_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountryProfile" ADD CONSTRAINT "CountryProfile_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deduction" ADD CONSTRAINT "Deduction_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "District" ADD CONSTRAINT "District_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovingGuide" ADD CONSTRAINT "MovingGuide_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovingPlan" ADD CONSTRAINT "MovingPlan_fromCityId_fkey" FOREIGN KEY ("fromCityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovingPlan" ADD CONSTRAINT "MovingPlan_toCityId_fkey" FOREIGN KEY ("toCityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovingPlan" ADD CONSTRAINT "MovingPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OneShot" ADD CONSTRAINT "OneShot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryBenchmark" ADD CONSTRAINT "SalaryBenchmark_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialContribution" ADD CONSTRAINT "SocialContribution_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialRegime" ADD CONSTRAINT "SpecialRegime_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxBracket" ADD CONSTRAINT "TaxBracket_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaRule" ADD CONSTRAINT "VisaRule_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchlistItem" ADD CONSTRAINT "WatchlistItem_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchlistItem" ADD CONSTRAINT "WatchlistItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


