-- AlterTable
ALTER TABLE "RendezVous" ADD COLUMN     "serieId" TEXT;

-- CreateIndex
CREATE INDEX "RendezVous_serieId_idx" ON "RendezVous"("serieId");
