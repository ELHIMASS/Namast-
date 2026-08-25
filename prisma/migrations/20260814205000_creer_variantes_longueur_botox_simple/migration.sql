-- Créer les variantes de longueur pour Soin botox
-- (supprimer d'abord si elles existent)
DELETE FROM "PrestationLongueur"
WHERE "prestationId" IN (
  SELECT id FROM "Prestation" WHERE nom LIKE 'Soin botox%'
);

-- Insérer les variantes pour Soin botox
INSERT INTO "PrestationLongueur" (id, "prestationId", longueur, "prixCentimes", "dureeMinutes")
SELECT md5(random()::text)::uuid, id, 'COURT'::"LongueurCheveux", 10000, 60 FROM "Prestation" WHERE nom = 'Soin botox'
UNION ALL
SELECT md5(random()::text)::uuid, id, 'CARRE'::"LongueurCheveux", 10000, 60 FROM "Prestation" WHERE nom = 'Soin botox'
UNION ALL
SELECT md5(random()::text)::uuid, id, 'MI_LONG'::"LongueurCheveux", 12500, 75 FROM "Prestation" WHERE nom = 'Soin botox'
UNION ALL
SELECT md5(random()::text)::uuid, id, 'LONG'::"LongueurCheveux", 12500, 75 FROM "Prestation" WHERE nom = 'Soin botox'
UNION ALL
SELECT md5(random()::text)::uuid, id, 'TRES_LONG'::"LongueurCheveux", 15000, 75 FROM "Prestation" WHERE nom = 'Soin botox';

-- Insérer les variantes pour Soin botox Parfait
INSERT INTO "PrestationLongueur" (id, "prestationId", longueur, "prixCentimes", "dureeMinutes")
SELECT md5(random()::text)::uuid, id, 'COURT'::"LongueurCheveux", 15000, 150 FROM "Prestation" WHERE nom = 'Soin botox Parfait'
UNION ALL
SELECT md5(random()::text)::uuid, id, 'CARRE'::"LongueurCheveux", 15000, 150 FROM "Prestation" WHERE nom = 'Soin botox Parfait'
UNION ALL
SELECT md5(random()::text)::uuid, id, 'MI_LONG'::"LongueurCheveux", 17500, 150 FROM "Prestation" WHERE nom = 'Soin botox Parfait'
UNION ALL
SELECT md5(random()::text)::uuid, id, 'LONG'::"LongueurCheveux", 17500, 150 FROM "Prestation" WHERE nom = 'Soin botox Parfait'
UNION ALL
SELECT md5(random()::text)::uuid, id, 'TRES_LONG'::"LongueurCheveux", 20000, 150 FROM "Prestation" WHERE nom = 'Soin botox Parfait';
