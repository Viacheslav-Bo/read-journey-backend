/*
  Warnings:

  - A unique constraint covering the columns `[userId,openLibraryId]` on the table `LibraryBook` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "LibraryBook" ADD COLUMN     "currentPage" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "LibraryBook_userId_openLibraryId_key" ON "LibraryBook"("userId", "openLibraryId");
