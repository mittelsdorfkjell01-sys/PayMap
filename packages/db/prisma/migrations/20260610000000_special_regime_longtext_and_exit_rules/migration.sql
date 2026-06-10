-- Add long-form prose fields to SpecialRegime ("Was es ist" / "Hintergrund")
ALTER TABLE "SpecialRegime" ADD COLUMN "descriptionDE" TEXT;
ALTER TABLE "SpecialRegime" ADD COLUMN "descriptionEN" TEXT;
ALTER TABLE "SpecialRegime" ADD COLUMN "backgroundDE" TEXT;
ALTER TABLE "SpecialRegime" ADD COLUMN "backgroundEN" TEXT;

-- Säule B — German exit/relocation rules (apply regardless of destination)
CREATE TABLE "ExitRule" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ruleType" TEXT NOT NULL,
    "legalRef" TEXT,
    "nameDE" TEXT NOT NULL,
    "nameEN" TEXT NOT NULL,
    "descriptionDE" TEXT NOT NULL,
    "descriptionEN" TEXT NOT NULL,
    "affectedDE" TEXT NOT NULL,
    "affectedEN" TEXT NOT NULL,
    "backgroundDE" TEXT,
    "backgroundEN" TEXT,
    "sourceUrl" TEXT NOT NULL,
    "sourceDE" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL DEFAULT 'high',
    "requiresLegalAdvice" BOOLEAN NOT NULL DEFAULT true,
    "disclaimerDE" TEXT,
    "disclaimerEN" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExitRule_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ExitRule_slug_key" ON "ExitRule"("slug");
