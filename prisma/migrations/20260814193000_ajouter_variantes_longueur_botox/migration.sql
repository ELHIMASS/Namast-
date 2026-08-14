-- Ajouter variantes longueur pour Soin botox (si elles n'existent pas)
INSERT INTO "PrestationLongueur" ("id", "prestationId", "longueur", "prixCentimes", "dureeMinutes")
VALUES
  (gen_random_uuid(), (SELECT "id" FROM "Prestation" WHERE "nom" = 'Soin botox' LIMIT 1), 'COURT', 10000, 60),
  (gen_random_uuid(), (SELECT "id" FROM "Prestation" WHERE "nom" = 'Soin botox' LIMIT 1), 'CARRE', 10000, 60),
  (gen_random_uuid(), (SELECT "id" FROM "Prestation" WHERE "nom" = 'Soin botox' LIMIT 1), 'MI_LONG', 12500, 75),
  (gen_random_uuid(), (SELECT "id" FROM "Prestation" WHERE "nom" = 'Soin botox' LIMIT 1), 'LONG', 12500, 75),
  (gen_random_uuid(), (SELECT "id" FROM "Prestation" WHERE "nom" = 'Soin botox' LIMIT 1), 'TRES_LONG', 15000, 75)
ON CONFLICT DO NOTHING;

-- Ajouter variantes longueur pour Soin botox Parfait (si elles n'existent pas)
INSERT INTO "PrestationLongueur" ("id", "prestationId", "longueur", "prixCentimes", "dureeMinutes")
VALUES
  (gen_random_uuid(), (SELECT "id" FROM "Prestation" WHERE "nom" = 'Soin botox Parfait' LIMIT 1), 'COURT', 15000, 150),
  (gen_random_uuid(), (SELECT "id" FROM "Prestation" WHERE "nom" = 'Soin botox Parfait' LIMIT 1), 'CARRE', 15000, 150),
  (gen_random_uuid(), (SELECT "id" FROM "Prestation" WHERE "nom" = 'Soin botox Parfait' LIMIT 1), 'MI_LONG', 17500, 150),
  (gen_random_uuid(), (SELECT "id" FROM "Prestation" WHERE "nom" = 'Soin botox Parfait' LIMIT 1), 'LONG', 17500, 150),
  (gen_random_uuid(), (SELECT "id" FROM "Prestation" WHERE "nom" = 'Soin botox Parfait' LIMIT 1), 'TRES_LONG', 20000, 150)
ON CONFLICT DO NOTHING;
