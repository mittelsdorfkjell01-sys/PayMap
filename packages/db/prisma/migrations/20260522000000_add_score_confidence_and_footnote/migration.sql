-- AlterTable: add confidence and sourceFootnote to CityLifestyle
ALTER TABLE "CityLifestyle" ADD COLUMN "confidence" INTEGER NOT NULL DEFAULT 80;
ALTER TABLE "CityLifestyle" ADD COLUMN "sourceFootnote" TEXT;
