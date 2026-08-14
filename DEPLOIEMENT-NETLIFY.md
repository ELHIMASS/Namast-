# 🚀 Déploiement sur Netlify - First (Namasté)

## Prérequis
- Compte Netlify (gratuit sur [netlify.com](https://netlify.com))
- Accès au repo GitHub du projet
- Les variables d'environnement nécessaires

## Étapes de déploiement

### 1. Connecter le repo GitHub à Netlify
1. Va sur [app.netlify.com](https://app.netlify.com)
2. Clique sur **"Add new site"** → **"Import an existing project"**
3. Choisis **GitHub** et autorise Netlify
4. Sélectionne le repo `Desktop/first`
5. Clique sur **"Deploy"**

### 2. Configurer les variables d'environnement
Après la première tentative de déploiement (qui échouera), va dans:
- **Site settings** → **Environment** → **Environment variables**

Ajoute les variables suivantes:
```
DATABASE_URL = postgresql://neondb_owner:npg_JVCmjXi0yF8f@ep-snowy-grass-ax6v57w3-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

ADMIN_PASSWORD = namaste-admin-2026
```

### 3. Redéployer
Une fois les variables ajoutées:
1. Va dans **Deploys**
2. Clique sur le dernier deploy
3. Clique sur **"Retry deploy"**

## Informations du build
- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: 20 (recommandé)

## Troubleshooting

### ❌ "Build failed - Command 'npm run build' failed"
**Solution**: Vérifie que les variables d'environnement `DATABASE_URL` et `ADMIN_PASSWORD` sont bien configurées.

### ❌ "PostCSS plugin error"
**Solution**: Assure-toi que tous les dépendances sont installées. Relance un build avec un clear cache:
- Va dans **Deploys** → **Trigger deploy** → **Clear cache and retry**

### ❌ Pages vides après déploiement
**Solution**: Netlify demande parfois une configuration spéciale pour Next.js. Le `netlify.toml` devrait gérer cela automatiquement.

## Mises à jour futures
Chaque push sur la branche principale déclenchera automatiquement un nouveau déploiement sur Netlify! 🎉

Tu peux aussi déclencher manuellement un deploy dans **Deploys** → **Trigger deploy**.

## Support
- Docs Netlify + Next.js: https://docs.netlify.com/frameworks/next-js/overview/
- Docs Next.js: https://nextjs.org/docs
