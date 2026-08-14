-- Mettre à jour le prix de base des soins botox
-- (court/carré à 100€ est le prix de base, donc on ne change que si nécessaire)

-- Soin botox: afficher comme "dès 100€" (c'est correct)
-- Pas de changement du prix de base, mais créer les variantes de longueur

-- Soin botox Parfait: afficher comme "dès 150€" (prix court/carré)
UPDATE "Prestation"
SET "prixCentimes" = 15000
WHERE "nom" = 'Soin botox Parfait';
