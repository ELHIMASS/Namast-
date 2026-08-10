-- La colonne existait dans le schema Prisma et dans la base de production,
-- mais aucune migration ne la creait : elle avait ete ajoutee directement en
-- base. Toute base reconstruite depuis les migrations en etait donc privee.
--
-- IF NOT EXISTS pour que cette migration soit sans effet la ou la colonne est
-- deja presente, et cree la ou elle manque.
ALTER TABLE "RendezVous" ADD COLUMN IF NOT EXISTS "creeParAdmin" BOOLEAN NOT NULL DEFAULT false;
