-- Supprimer les variantes existantes si elles existent
DELETE FROM "PrestationLongueur"
WHERE "prestationId" IN (
  SELECT "id" FROM "Prestation"
  WHERE "nom" IN ('Soin botox', 'Soin botox Parfait')
);

-- Insérer les variantes pour Soin botox
INSERT INTO "PrestationLongueur" ("id", "prestationId", "longueur", "prixCentimes", "dureeMinutes")
SELECT
  md5(random()::text || clock_timestamp()::text)::uuid,
  p.id,
  v.longueur,
  v.prix,
  v.duree
FROM "Prestation" p
CROSS JOIN (VALUES
  ('COURT'::text, 10000::int, 60::int),
  ('CARRE'::text, 10000::int, 60::int),
  ('MI_LONG'::text, 12500::int, 75::int),
  ('LONG'::text, 12500::int, 75::int),
  ('TRES_LONG'::text, 15000::int, 75::int)
) AS v(longueur, prix, duree)
WHERE p.nom = 'Soin botox';

-- Insérer les variantes pour Soin botox Parfait
INSERT INTO "PrestationLongueur" ("id", "prestationId", "longueur", "prixCentimes", "dureeMinutes")
SELECT
  md5(random()::text || clock_timestamp()::text)::uuid,
  p.id,
  v.longueur,
  v.prix,
  v.duree
FROM "Prestation" p
CROSS JOIN (VALUES
  ('COURT'::text, 15000::int, 150::int),
  ('CARRE'::text, 15000::int, 150::int),
  ('MI_LONG'::text, 17500::int, 150::int),
  ('LONG'::text, 17500::int, 150::int),
  ('TRES_LONG'::text, 20000::int, 150::int)
) AS v(longueur, prix, duree)
WHERE p.nom = 'Soin botox Parfait';
