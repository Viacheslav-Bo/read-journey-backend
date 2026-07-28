/*
  Warnings:

  - Made the column `openLibraryId` on table `LibraryBook` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "LibraryBook" ALTER COLUMN "openLibraryId" SET NOT NULL;
