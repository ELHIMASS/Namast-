-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "email" TEXT,
    "dateNaissance" DATETIME,
    "commentConnue" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Prestation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "categorie" TEXT NOT NULL,
    "prixCentimes" INTEGER NOT NULL,
    "dureeMinutes" INTEGER NOT NULL,
    "tempsNettoyageMinutes" INTEGER NOT NULL DEFAULT 10,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "ordre" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "RendezVous" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "estNouvelleCliente" BOOLEAN NOT NULL DEFAULT false,
    "dateDebut" DATETIME NOT NULL,
    "dateFin" DATETIME NOT NULL,
    "message" TEXT,
    "motifRefus" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RendezVous_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RendezVousPrestation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rendezVousId" TEXT NOT NULL,
    "prestationId" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "RendezVousPrestation_rendezVousId_fkey" FOREIGN KEY ("rendezVousId") REFERENCES "RendezVous" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RendezVousPrestation_prestationId_fkey" FOREIGN KEY ("prestationId") REFERENCES "Prestation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_telephone_key" ON "Client"("telephone");
