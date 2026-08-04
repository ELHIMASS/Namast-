-- CreateEnum
CREATE TYPE "Profil" AS ENUM ('FEMME', 'HOMME', 'ENFANT');

-- CreateEnum
CREATE TYPE "LongueurCheveux" AS ENUM ('COURT', 'CARRE', 'MI_LONG', 'LONG', 'TRES_LONG');

-- CreateEnum
CREATE TYPE "Densite" AS ENUM ('FIN', 'NORMAL', 'EPAIS');

-- CreateEnum
CREATE TYPE "GroupeOption" AS ENUM ('RITUEL_FEMME', 'BIEN_ETRE', 'COIFFAGE', 'COULEUR', 'HOMME');

-- AlterTable
ALTER TABLE "Prestation" ADD COLUMN     "estLissage" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "profil" "Profil" NOT NULL DEFAULT 'FEMME';

-- AlterTable
ALTER TABLE "RendezVousPrestation" ADD COLUMN     "densite" "Densite",
ADD COLUMN     "longueur" "LongueurCheveux";

-- CreateTable
CREATE TABLE "PrestationLongueur" (
    "id" TEXT NOT NULL,
    "prestationId" TEXT NOT NULL,
    "longueur" "LongueurCheveux" NOT NULL,
    "prixCentimes" INTEGER NOT NULL,
    "dureeMinutes" INTEGER NOT NULL,

    CONSTRAINT "PrestationLongueur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LissageTarif" (
    "id" TEXT NOT NULL,
    "longueur" "LongueurCheveux" NOT NULL,
    "densite" "Densite" NOT NULL,
    "prixCentimes" INTEGER NOT NULL,
    "dureeMinutes" INTEGER NOT NULL,

    CONSTRAINT "LissageTarif_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Option" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "groupe" "GroupeOption" NOT NULL,
    "prixCentimes" INTEGER,
    "dureeMinutes" INTEGER NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "ordre" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OptionLongueur" (
    "id" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "longueur" "LongueurCheveux" NOT NULL,
    "prixCentimes" INTEGER NOT NULL,

    CONSTRAINT "OptionLongueur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RendezVousOption" (
    "id" TEXT NOT NULL,
    "rendezVousPrestationId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,

    CONSTRAINT "RendezVousOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PrestationLongueur_prestationId_longueur_key" ON "PrestationLongueur"("prestationId", "longueur");

-- CreateIndex
CREATE UNIQUE INDEX "LissageTarif_longueur_densite_key" ON "LissageTarif"("longueur", "densite");

-- CreateIndex
CREATE UNIQUE INDEX "OptionLongueur_optionId_longueur_key" ON "OptionLongueur"("optionId", "longueur");

-- AddForeignKey
ALTER TABLE "PrestationLongueur" ADD CONSTRAINT "PrestationLongueur_prestationId_fkey" FOREIGN KEY ("prestationId") REFERENCES "Prestation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OptionLongueur" ADD CONSTRAINT "OptionLongueur_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "Option"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RendezVousOption" ADD CONSTRAINT "RendezVousOption_rendezVousPrestationId_fkey" FOREIGN KEY ("rendezVousPrestationId") REFERENCES "RendezVousPrestation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RendezVousOption" ADD CONSTRAINT "RendezVousOption_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "Option"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
