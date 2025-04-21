/*
  Warnings:

  - A unique constraint covering the columns `[pharmacyId,name]` on the table `Drug` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Drug" ADD COLUMN     "composition" TEXT,
ADD COLUMN     "manufacturer" TEXT,
ADD COLUMN     "uses" TEXT;

-- CreateIndex
CREATE INDEX "Drug_name_idx" ON "Drug"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Drug_pharmacyId_name_key" ON "Drug"("pharmacyId", "name");
