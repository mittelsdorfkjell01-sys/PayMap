-- AlterTable District: replace minimal placeholder with full premium schema
ALTER TABLE "District" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "District" ADD COLUMN IF NOT EXISTS "nameDE" TEXT;
ALTER TABLE "District" ADD COLUMN IF NOT EXISTS "nameEN" TEXT;
ALTER TABLE "District" ADD COLUMN IF NOT EXISTS "descriptionDE" TEXT;
ALTER TABLE "District" ADD COLUMN IF NOT EXISTS "descriptionEN" TEXT;
ALTER TABLE "District" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
ALTER TABLE "District" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;
ALTER TABLE "District" ADD COLUMN IF NOT EXISTS "priceLevel" INTEGER NOT NULL DEFAULT 3;
ALTER TABLE "District" ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "District" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "District" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "District" DROP COLUMN IF EXISTS "name";
ALTER TABLE "District" DROP COLUMN IF EXISTS "rent1BRLow";
ALTER TABLE "District" DROP COLUMN IF EXISTS "rent1BRHigh";
ALTER TABLE "District" DROP COLUMN IF EXISTS "safetyScore";
ALTER TABLE "District" DROP COLUMN IF EXISTS "geoJson";
CREATE UNIQUE INDEX IF NOT EXISTS "District_cityId_slug_key" ON "District"("cityId", "slug");

-- CreateTable DistrictCostOfLiving
CREATE TABLE "DistrictCostOfLiving" (
    "id" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL DEFAULT 60,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DistrictCostOfLiving_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "DistrictCostOfLiving_districtId_category_key" ON "DistrictCostOfLiving"("districtId", "category");
ALTER TABLE "DistrictCostOfLiving" ADD CONSTRAINT "DistrictCostOfLiving_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable CityNarrative
CREATE TABLE "CityNarrative" (
    "id" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "titleDE" TEXT NOT NULL,
    "titleEN" TEXT NOT NULL,
    "contentDE" TEXT NOT NULL,
    "contentEN" TEXT NOT NULL,
    "sourceUrls" TEXT[],
    "translationSource" TEXT NOT NULL DEFAULT 'manual',
    "lastVerified" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CityNarrative_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CityNarrative_cityId_section_key" ON "CityNarrative"("cityId", "section");
ALTER TABLE "CityNarrative" ADD CONSTRAINT "CityNarrative_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable CityTool
CREATE TABLE "CityTool" (
    "id" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "toolType" TEXT NOT NULL,
    "nameDE" TEXT NOT NULL,
    "nameEN" TEXT NOT NULL,
    "descriptionDE" TEXT NOT NULL,
    "descriptionEN" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CityTool_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CityTool_cityId_toolType_key" ON "CityTool"("cityId", "toolType");
ALTER TABLE "CityTool" ADD CONSTRAINT "CityTool_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable Resource
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "cityId" TEXT,
    "resourceType" TEXT NOT NULL,
    "titleDE" TEXT NOT NULL,
    "titleEN" TEXT NOT NULL,
    "descriptionDE" TEXT,
    "descriptionEN" TEXT,
    "content" JSONB NOT NULL,
    "downloadUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable Testimonial
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorAge" INTEGER,
    "authorProfession" TEXT,
    "authorPersona" TEXT,
    "yearMoved" INTEGER NOT NULL,
    "contentDE" TEXT NOT NULL,
    "contentEN" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "sourceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Testimonial_cityId_idx" ON "Testimonial"("cityId");
ALTER TABLE "Testimonial" ADD CONSTRAINT "Testimonial_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable UserFeedback
CREATE TABLE "UserFeedback" (
    "id" TEXT NOT NULL,
    "cityId" TEXT,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "userEmail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserFeedback_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "UserFeedback" ADD CONSTRAINT "UserFeedback_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;
