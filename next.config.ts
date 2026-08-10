import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sortie autonome : Next place dans .next/standalone un serveur avec le
  // strict nécessaire de node_modules. Indispensable pour une image Docker
  // légère, destinée au NAS.
  output: "standalone",
};

export default nextConfig;
