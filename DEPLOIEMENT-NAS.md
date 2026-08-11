# Héberger le site sur le NAS UGREEN

Le site et sa base tournent dans deux conteneurs sur le NAS. La base n'est
joignable que par le site, sur le réseau interne de Docker : **rien d'autre que
le HTTPS du site n'est exposé à l'internet**, et le fichier des clientes ne
quitte plus la maison.

## 1. Préparer le NAS

Dans UGOS, installer l'application **Docker** depuis l'App Center. Créer un
dossier partagé, par exemple `docker/namaste`, et y copier le projet (sans
`node_modules` ni `.next`).

## 2. Renseigner les secrets

Copier `.env.exemple` en `.env` dans le même dossier que `docker-compose.yml`,
puis remplir les deux valeurs :

```bash
cp .env.exemple .env
```

- `POSTGRES_PASSWORD` : à générer avec `openssl rand -hex 24`. En hexadécimal
  et non en base64 : ce mot de passe est inséré dans une URL de connexion, où
  les `/` et `+` produits par base64 cassent l'analyse de l'URL.
- `ADMIN_PASSWORD` : celui de l'espace pro, à reprendre du `.env` actuel

Ce fichier ne doit jamais être versionné : le dépôt GitHub est public.

## 3. Démarrer

```bash
docker compose up -d --build
```

Le premier démarrage construit l'image, attend que la base réponde, applique
les migrations, puis lance le site sur le port **3000** du NAS. À vérifier
depuis le réseau local : `http://IP-DU-NAS:3000`.

Suivre le démarrage :

```bash
docker compose logs -f web
```

## 4. Transférer les données depuis Neon

La base du NAS démarre vide : les migrations créent les tables, mais pas les
142 clientes ni le barème.

Le conteneur de base embarque `pg_dump` et a accès à l'internet : le transfert
se fait donc en une seule commande, sur le NAS, sans rien installer sur le PC
et **sans fichier d'export à faire circuler**.

```bash
docker compose exec -T db sh -c \
  'pg_dump --no-owner --no-privileges --data-only --disable-triggers \
     --exclude-table=_prisma_migrations "LA_DATABASE_URL_NEON" \
   | psql -U namaste -d namaste'
```

Deux options méritent une explication :

- `--exclude-table=_prisma_migrations` : le conteneur `migrate` a déjà inscrit
  les migrations appliquées dans cette table. Copier celles de Neon
  provoquerait un conflit de clé.
- `--disable-triggers` : les contraintes de clé étrangère sont suspendues le
  temps de l'insertion, ce qui évite les échecs liés à l'ordre des tables (un
  rendez-vous inséré avant sa cliente, par exemple).

`--data-only` n'apporte que les lignes : le schéma est déjà en place, posé par
les migrations. Vérifier ensuite le décompte, qui doit afficher 142 :

```bash
docker compose exec db psql -U namaste -d namaste -c 'select count(*) from "Client";'
```

La chaîne de connexion Neon contient un mot de passe et reste dans l'historique
du shell. Pour l'en retirer : `history -c` après l'opération.

## 5. Publier en HTTPS

Dans UGOS, ouvrir le **reverse proxy** et créer une règle :

- source : ton domaine, en HTTPS sur le port 443
- destination : `localhost` port `3000`

Demander le certificat Let's Encrypt depuis la même interface. Côté box
internet, **ne rediriger que le port 443** vers le NAS. Ni le 3000 ni le 5432
n'ont à être ouverts.

## 6. Mettre à jour le site plus tard

```bash
git pull
docker compose up -d --build
```

Les migrations en attente sont appliquées automatiquement au redémarrage.

## Sauvegardes

Les données vivent dans le volume Docker `donnees-postgres`. Une sauvegarde
régulière, à planifier dans UGOS :

```bash
docker compose exec -T db pg_dump -U namaste --no-owner namaste \
  > /volume1/sauvegardes/namaste-$(date +%F).sql
```

Penser aussi aux photos et vidéos de `public/images` et `public/videos`, qui
sont dans le dépôt mais pas dans la base.

## Fuseau horaire

Les créneaux sont calculés avec l heure du serveur. Sans réglage, un serveur en
UTC décale tout affichage de deux heures en été : « 9h00 » apparaît à 11h00.

Sur le NAS, `TZ: Europe/Paris` est posé dans docker-compose.yml. Sur tout autre
hébergement (Netlify, Vercel), ajouter la variable d environnement
`TZ=Europe/Paris`.
