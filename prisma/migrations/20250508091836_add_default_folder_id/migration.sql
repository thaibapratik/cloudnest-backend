/*
  Warnings:

  - Made the column `folderId` on table `Files` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Files" DROP CONSTRAINT "Files_folderId_fkey";

-- AlterTable
ALTER TABLE "Files" ALTER COLUMN "folderId" SET NOT NULL,
ALTER COLUMN "folderId" SET DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Files" ADD CONSTRAINT "Files_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
