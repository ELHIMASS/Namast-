-- Créer variantes pour Soin botox
DELETE FROM "PrestationLongueur"
WHERE "prestationId" IN (SELECT "id" FROM "Prestation" WHERE "nom" = 'Soin botox');

INSERT INTO "PrestationLongueur" ("id", "prestationId", "longueur", "prixCentimes", "dureeMinutes")
SELECT gen_random_uuid(), p.id, v.longueur, v.prix, v.duree
FROM "Prestation" p, (VALUES
  ('COURT', 10000, 60),
  ('CARRE', 10000, 60),
  ('MI_LONG', 12500, 75),
  ('LONG', 12500, 75),
  ('TRES_LONG', 15000, 75)
) AS v(longueur, prix, duree)
WHERE p.nom = 'Soin botox';

-- Créer variantes pour Soin botox Parfait
DELETE FROM "PrestationLongueur"
WHERE "prestationId" IN (SELECT "id" FROM "Prestation" WHERE "nom" = 'Soin botox Parfait');

INSERT INTO "PrestationLongueur" ("id", "prestationId", "longueur", "prixCentimes", "dureeMinutes")
SELECT gen_random_uuid(), p.id, v.longueur, v.prix, v.duree
FROM "Prestation" p, (VALUES
  ('COURT', 15000, 150),
  ('CARRE', 15000, 150),
  ('MI_LONG', 17500, 150),
  ('LONG', 17500, 150),
  ('TRES_LONG', 20000, 150)
) AS v(longueur, prix, duree)
WHERE p.nom = 'Soin botox Parfait';
