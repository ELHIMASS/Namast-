-- La formule « Essentielle » devient « Privilège » (nouveau barème du salon).
-- RENAME VALUE plutôt qu'un DROP/CREATE du type : la valeur est renommée sur
-- place, sans toucher aux lignes qui la référencent.
ALTER TYPE "Formule" RENAME VALUE 'ESSENTIELLE' TO 'PRIVILEGE';
