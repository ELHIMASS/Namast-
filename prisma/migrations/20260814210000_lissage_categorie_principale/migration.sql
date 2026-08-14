-- Ajouter LISSAGE à l'enum CategoriePrestation
ALTER TYPE "CategoriePrestation" ADD VALUE 'LISSAGE' BEFORE 'HEAD_SPA';

-- Mettre à jour les prestations de lissage pour avoir LISSAGE comme catégorie
UPDATE "Prestation"
SET "categorie" = 'LISSAGE'
WHERE "estLissage" = true;
