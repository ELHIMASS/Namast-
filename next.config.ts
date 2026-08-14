import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sortie autonome uniquement pour l'image Docker du NAS : Next place alors
  // dans .next/standalone un serveur avec le strict nécessaire de node_modules.
  //
  // Conditionnel, car les hébergeurs qui déploient Next eux-mêmes (Netlify,
  // Vercel) attendent la sortie par défaut et échouent avec « standalone ».
  // La variable est posée dans le Dockerfile.
  output: process.env.BUILD_STANDALONE ? "standalone" : undefined,

  // Turbopack n'est pas compatible avec Netlify : désactiver en production.
  // Turbopack fonctionne seulement en dev avec: next dev --turbopack
  experimental: {
    turbo: process.env.NODE_ENV !== "production" ? {} : undefined,
  },
};

export default nextConfig;
