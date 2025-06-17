-- DropForeignKey
ALTER TABLE "Files" DROP CONSTRAINT "Files_folderId_fkey";

-- AlterTable
ALTER TABLE "Files" ALTER COLUMN "folderId" DROP NOT NULL,
ALTER COLUMN "folderId" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Files" ADD CONSTRAINT "Files_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
