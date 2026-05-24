-- AlterTable: add guide section, risk, source and translation fields to MovingGuide
ALTER TABLE "MovingGuide"
  ADD COLUMN "section"             TEXT      NOT NULL DEFAULT 'bureaucracy',
  ADD COLUMN "riskLevel"           TEXT      NOT NULL DEFAULT 'low',
  ADD COLUMN "requiresLegalAdvice" BOOLEAN   NOT NULL DEFAULT false,
  ADD COLUMN "sourceUrl"           TEXT,
  ADD COLUMN "sourceLabel"         TEXT,
  ADD COLUMN "lastVerified"        TIMESTAMP(3),
  ADD COLUMN "translationSource"   TEXT      NOT NULL DEFAULT 'manual';
