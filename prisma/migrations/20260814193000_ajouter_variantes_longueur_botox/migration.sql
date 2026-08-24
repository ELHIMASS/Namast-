-- Migration volontairement vide.
--
-- Cette migration avait échoué en cours d'exécution le 14 août 2026 et son
-- fichier n'avait pas été versionné. Elle restait donc enregistrée comme
-- « non terminée » dans _prisma_migrations, ce qui bloquait toute migration
-- ultérieure : Prisma refuse d'avancer tant qu'un échec n'est pas résolu, et
-- ne retrouvait pas le fichier pour le rejouer.
--
-- Son objet — les variantes de longueur du soin botox — a été repris et
-- appliqué correctement le même jour par la migration
-- 20260814205000_creer_variantes_longueur_botox_simple. Il n'y a donc rien à
-- exécuter ici : ce fichier existe pour rendre l'historique complet et
-- débloquer la suite.

SELECT 1;
