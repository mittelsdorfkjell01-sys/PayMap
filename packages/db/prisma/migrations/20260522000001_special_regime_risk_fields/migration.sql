-- Add risk classification and legal advice fields to SpecialRegime
ALTER TABLE "SpecialRegime" ADD COLUMN "riskLevel" TEXT NOT NULL DEFAULT 'medium';
ALTER TABLE "SpecialRegime" ADD COLUMN "requiresLegalAdvice" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "SpecialRegime" ADD COLUMN "disclaimerDE" TEXT;
ALTER TABLE "SpecialRegime" ADD COLUMN "disclaimerEN" TEXT;
