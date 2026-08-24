-- Réservation concernant plusieurs personnes.
--
-- Un parent venant avec ses enfants réserve en une fois, mais chaque personne
-- choisit son propre créneau : cela produit donc plusieurs rendez-vous, qu'il
-- faut pouvoir présenter ensemble.
--
--   RendezVousPrestation.personne : le bénéficiaire de la ligne.
--   RendezVous.groupeId           : lie les rendez-vous d'une même réservation.
--
-- Les deux colonnes sont nullables : une réservation ordinaire ne concerne
-- qu'une personne et n'a rien à y mettre, et les enregistrements existants
-- gardent NULL.

ALTER TABLE "RendezVousPrestation" ADD COLUMN "personne" TEXT;

ALTER TABLE "RendezVous" ADD COLUMN "groupeId" TEXT;

CREATE INDEX "RendezVous_groupeId_idx" ON "RendezVous"("groupeId");
