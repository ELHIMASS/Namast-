import type { NextConfig } from "next";

// Origines autorisées à invoquer une Server Action. Next compare l'en-tête
// `origin` du navigateur au host transmis par le proxy ; derrière Nginx les
// deux diffèrent (port 8081 côté navigateur, 80 côté conteneur) et l'action
// est rejetée. Les lister ici lève l'ambiguïté sans désactiver la protection
// CSRF. ALLOWED_ORIGINS (séparées par des virgules) permet d'en ajouter sans
// reconstruire l'image.
const allowedOrigins = [
  "172.29.69.13:8081",
  "namastecoiffure.fr",
  "www.namastecoiffure.fr",
  ...(process.env.ALLOWED_ORIGINS?.split(",").map((o) => o.trim()).filter(Boolean) ?? []),
];

const nextConfig: NextConfig = {
  // Sortie autonome uniquement pour l'image Docker du NAS : Next place alors
  // dans .next/standalone un serveur avec le strict nécessaire de node_modules.
  //
  // Conditionnel, car les hébergeurs qui déploient Next eux-mêmes (Netlify,
  // Vercel) attendent la sortie par défaut et échouent avec « standalone ».
  // La variable est posée dans le Dockerfile.
  output: process.env.BUILD_STANDALONE ? "standalone" : undefined,
  experimental: {
    serverActions: { allowedOrigins },
  },
};

export default nextConfig;
