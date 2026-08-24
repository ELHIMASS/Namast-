-- Ajout de la marque Belmakosmetik aux intitulés de la formule Bien-être.
--
-- Ce dossier de migration existait sans fichier SQL : le renommage avait été
-- appliqué directement en base le 19 août 2026, sans passer par une migration
-- ni être versionné. Prisma refusait alors toute migration ultérieure,
-- puisqu'il ne trouvait pas le fichier à rejouer.
--
-- Les instructions ci-dessous reconstituent l'intention d'origine et sont
-- idempotentes : là où le renommage a déjà eu lieu, la clause WHERE ne
-- correspond à rien et rien n'est modifié.

UPDATE "Option"
   SET nom = 'Soin profond Belmakosmetik'
 WHERE nom = 'Soin profond';

UPDATE "Prestation"
   SET nom = 'Shampooing adapté Belmakosmetik'
 WHERE nom = 'Shampooing adapté';
