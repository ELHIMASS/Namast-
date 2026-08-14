-- Créer les variantes de longueur pour Soin botox
-- (supprimer d'abord si elles existent)
DELETE FROM "PrestationLongueur"
WHERE "prestationId" IN (
  SELECT id FROM "Prestation" WHERE nom LIKE 'Soin botox%'
);

-- Insérer les variantes pour Soin botox
INSERT INTO "PrestationLongueur" (id, "prestationId", longueur, "prixCentimes", "dureeMinutes")
VALUES
  (md5(random()::text)::uuid, (SELECT id FROM "Prestation" WHERE nom = 'Soin botox' LIMIT 1), 'COURT', 10000, 60),
  (md5(random()::text)::uuid, (SELECT id FROM "Prestation" WHERE nom = 'Soin botox' LIMIT 1), 'CARRE', 10000, 60),
  (md5(random()::text)::uuid, (SELECT id FROM "Prestation" WHERE nom = 'Soin botox' LIMIT 1), 'MI_LONG', 12500, 75),
  (md5(random()::text)::uuid, (SELECT id FROM "Prestation" WHERE nom = 'Soin botox' LIMIT 1), 'LONG', 12500, 75),
  (md5(random()::text)::uuid, (SELECT id FROM "Prestation" WHERE nom = 'Soin botox' LIMIT 1), 'TRES_LONG', 15000, 75);

-- Insérer les variantes pour Soin botox Parfait
INSERT INTO "PrestationLongueur" (id, "prestationId", longueur, "prixCentimes", "dureeMinutes")
VALUES
  (md5(random()::text)::uuid, (SELECT id FROM "Prestation" WHERE nom = 'Soin botox Parfait' LIMIT 1), 'COURT', 15000, 150),
  (md5(random()::text)::uuid, (SELECT id FROM "Prestation" WHERE nom = 'Soin botox Parfait' LIMIT 1), 'CARRE', 15000, 150),
  (md5(random()::text)::uuid, (SELECT id FROM "Prestation" WHERE nom = 'Soin botox Parfait' LIMIT 1), 'MI_LONG', 17500, 150),
  (md5(random()::text)::uuid, (SELECT id FROM "Prestation" WHERE nom = 'Soin botox Parfait' LIMIT 1), 'LONG', 17500, 150),
  (md5(random()::text)::uuid, (SELECT id FROM "Prestation" WHERE nom = 'Soin botox Parfait' LIMIT 1), 'TRES_LONG', 20000, 150);
