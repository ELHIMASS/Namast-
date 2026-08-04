/*
  Warnings:

  - Made the column `email` on table `Client` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "dateNaissance" DATETIME,
    "commentConnue" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Client" ("commentConnue", "createdAt", "dateNaissance", "email", "id", "nom", "notes", "prenom", "telephone") SELECT "commentConnue", "createdAt", "dateNaissance", "email", "id", "nom", "notes", "prenom", "telephone" FROM "Client";
DROP TABLE "Client";
ALTER TABLE "new_Client" RENAME TO "Client";
CREATE UNIQUE INDEX "Client_telephone_key" ON "Client"("telephone");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
