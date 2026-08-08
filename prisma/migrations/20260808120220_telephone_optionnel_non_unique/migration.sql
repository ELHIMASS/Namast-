-- DropIndex
DROP INDEX "Client_telephone_key";

-- AlterTable
ALTER TABLE "Client" ALTER COLUMN "telephone" DROP NOT NULL;
