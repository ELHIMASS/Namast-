#!/bin/sh
set -e

# Applique les migrations en attente avant de démarrer le site. `migrate deploy`
# ne fait qu'appliquer ce qui existe : il ne génère ni ne supprime rien, il est
# donc sans danger à chaque redémarrage du conteneur.
echo "→ Application des migrations…"
npx prisma migrate deploy --schema=prisma/schema.prisma

echo "→ Démarrage du site"
exec "$@"
