-- CreateEnum
CREATE TYPE "Formule" AS ENUM ('ESSENTIELLE', 'BIEN_ETRE');
-- AlterTable
ALTER TABLE "Prestation" ADD COLUMN     "formule" "Formule";
-- AlterTable
ALTER TABLE "RendezVous" ADD COLUMN     "code" TEXT;
-- CreateTable
CREATE TABLE "Fermeture" (
    "id" TEXT NOT NULL,
    "dateDebut" DATE NOT NULL,
    "dateFin" DATE NOT NULL,
    "motif" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Fermeture_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE INDEX "Fermeture_dateDebut_dateFin_idx" ON "Fermeture"("dateDebut", "dateFin");
-- CreateIndex
CREATE UNIQUE INDEX "RendezVous_code_key" ON "RendezVous"("code");
