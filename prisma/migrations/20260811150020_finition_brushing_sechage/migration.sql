-- CreateEnum
CREATE TYPE "Finition" AS ENUM ('BRUSHING', 'SECHAGE');

-- AlterTable
ALTER TABLE "RendezVousPrestation" ADD COLUMN     "finition" "Finition";
