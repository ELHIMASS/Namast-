import type { Metadata } from "next";
import { Dancing_Script, Fraunces, Manrope } from "next/font/google";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

// Écriture au stylo pour le nom du salon : script manuscrit mais très lisible.
const dancingScript = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Namasté — Coiffure & bien-être",
  description:
    "Salon de coiffure privé sur rendez-vous : coiffure personnalisée, coloration, Head Spa, massages et soins bien-être.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${manrope.variable} ${dancingScript.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AnimatedBackground />
        {children}
      </body>
    </html>
  );
}
