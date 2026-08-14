-- Corriger les prix des soins botox selon la longueur

-- Soin botox: COURT et CARRE -> 100€
UPDATE "PrestationLongueur"
SET "prixCentimes" = 10000
WHERE "prestationId" IN (
  SELECT "id" FROM "Prestation" WHERE "nom" = 'Soin botox'
) AND "longueur" IN ('COURT', 'CARRE');

-- Soin botox: MI_LONG et LONG -> 125€
UPDATE "PrestationLongueur"
SET "prixCentimes" = 12500
WHERE "prestationId" IN (
  SELECT "id" FROM "Prestation" WHERE "nom" = 'Soin botox'
) AND "longueur" IN ('MI_LONG', 'LONG');

-- Soin botox: TRES_LONG -> 150€
UPDATE "PrestationLongueur"
SET "prixCentimes" = 15000
WHERE "prestationId" IN (
  SELECT "id" FROM "Prestation" WHERE "nom" = 'Soin botox'
) AND "longueur" = 'TRES_LONG';

-- Soin botox Parfait: COURT et CARRE -> 150€
UPDATE "PrestationLongueur"
SET "prixCentimes" = 15000
WHERE "prestationId" IN (
  SELECT "id" FROM "Prestation" WHERE "nom" = 'Soin botox Parfait'
) AND "longueur" IN ('COURT', 'CARRE');

-- Soin botox Parfait: MI_LONG et LONG -> 175€
UPDATE "PrestationLongueur"
SET "prixCentimes" = 17500
WHERE "prestationId" IN (
  SELECT "id" FROM "Prestation" WHERE "nom" = 'Soin botox Parfait'
) AND "longueur" IN ('MI_LONG', 'LONG');

-- Soin botox Parfait: TRES_LONG -> 200€
UPDATE "PrestationLongueur"
SET "prixCentimes" = 20000
WHERE "prestationId" IN (
  SELECT "id" FROM "Prestation" WHERE "nom" = 'Soin botox Parfait'
) AND "longueur" = 'TRES_LONG';
