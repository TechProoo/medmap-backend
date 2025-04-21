/*
  Warnings:

  - Added the required column `search_vector` to the `Drug` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Drug" ADD COLUMN     "search_vector" tsvector NOT NULL;
