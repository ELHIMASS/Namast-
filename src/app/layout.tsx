import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { AmbientBlobs } from "@/components/AmbientBlobs";
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
      className={`${fraunces.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AmbientBlobs />
        {children}
      </body>
    </html>
  );
}
