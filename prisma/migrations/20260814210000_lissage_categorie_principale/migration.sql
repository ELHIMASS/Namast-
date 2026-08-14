-- Mettre à jour les prestations de lissage pour avoir LISSAGE comme catégorie
UPDATE "Prestation"
SET "categorie" = 'LISSAGE'
WHERE "estLissage" = true;
