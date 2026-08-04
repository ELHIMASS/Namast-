import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Politique de Confidentialité — Namasté",
  description: "Politique de confidentialité et protection de vos données personnelles",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col relative">
      <Header />

      <main className="flex-1 mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            ← Retour à l'accueil
          </Link>
        </div>

        <article className="prose prose-sm max-w-none space-y-6">
          <div>
            <h1 className="font-serif text-4xl mb-2 text-foreground">Politique de Confidentialité</h1>
            <p className="text-muted-foreground">Dernière mise à jour: {new Date().getFullYear()}</p>
          </div>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mt-8 mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Chez Namasté, nous accordons une grande importance à la protection de vos données personnelles.
              Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mt-8 mb-4">2. Responsable du traitement</h2>
            <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-1">
              <p className="font-semibold text-foreground">Namasté - Salon de Coiffure</p>
              <p className="text-muted-foreground">6 impasse des Prunelliers</p>
              <p className="text-muted-foreground">69720 Saint-Laurent-de-Mure</p>
              <p className="text-muted-foreground">France</p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mt-8 mb-4">3. Données personnelles collectées</h2>
            <p className="text-muted-foreground mb-3">Nous collectons les données suivantes:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Données de réservation:</strong> nom, prénom, email, téléphone, date/heure de rendez-vous</li>
              <li><strong className="text-foreground">Données de contact:</strong> adresse email, numéro de téléphone</li>
              <li><strong className="text-foreground">Données de prestations:</strong> historique des services réalisés, préférences capillaires</li>
              <li><strong className="text-foreground">Données techniques:</strong> adresse IP, cookies, données de navigation (si applicable)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mt-8 mb-4">4. Base légale du traitement</h2>
            <p className="text-muted-foreground leading-relaxed">
              Le traitement de vos données personnelles est fondé sur:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
              <li>L'exécution d'un contrat (gestion des rendez-vous)</li>
              <li>Votre consentement explicite</li>
              <li>Le respect de nos obligations légales</li>
              <li>Nos intérêts légitimes</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mt-8 mb-4">5. Utilisation de vos données</h2>
            <p className="text-muted-foreground mb-3">Vos données sont utilisées pour:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Gérer vos rendez-vous et réservations</li>
              <li>Vous envoyer des confirmations et rappels</li>
              <li>Améliorer nos services et votre expérience</li>
              <li>Respecter nos obligations légales et comptables</li>
              <li>Communications marketing (avec votre consentement)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mt-8 mb-4">6. Partage de vos données</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nous ne vendons jamais vos données personnelles. Vos données peuvent être partagées avec:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
              <li>Nos prestataires techniques (hébergement, email)</li>
              <li>Les autorités publiques si obligatoire par la loi</li>
              <li>Nos services internes (comptabilité, gestion)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mt-8 mb-4">7. Conservation de vos données</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vos données personnelles sont conservées pendant la durée nécessaire à la fourniture de nos services,
              et au maximum selon les délais légaux:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
              <li>Données de réservation: 3 ans après le rendez-vous</li>
              <li>Données comptables: 6 ans (obligation légale)</li>
              <li>Communications marketing: jusqu'au retrait de consentement</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mt-8 mb-4">8. Vos droits</h2>
            <p className="text-muted-foreground mb-3">Conformément au RGPD, vous disposez des droits suivants:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Droit d'accès:</strong> obtenir une copie de vos données</li>
              <li><strong className="text-foreground">Droit de rectification:</strong> corriger vos informations</li>
              <li><strong className="text-foreground">Droit à l'oubli:</strong> demander la suppression de vos données</li>
              <li><strong className="text-foreground">Droit à la limitation:</strong> limiter le traitement</li>
              <li><strong className="text-foreground">Droit à la portabilité:</strong> recevoir vos données</li>
              <li><strong className="text-foreground">Droit d'opposition:</strong> refuser certains traitements</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mt-8 mb-4">9. Exercer vos droits</h2>
            <p className="text-muted-foreground mb-4">
              Pour exercer vos droits RGPD, contactez-nous à:
            </p>
            <div className="bg-muted/50 p-4 rounded-lg text-sm">
              <p className="font-semibold text-foreground">Email:</p>
              <p className="text-muted-foreground mb-3">contact@namaste-salon.fr</p>
              <p className="font-semibold text-foreground">Par courrier:</p>
              <p className="text-muted-foreground">Namasté, 6 impasse des Prunelliers, 69720 Saint-Laurent-de-Mure</p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mt-8 mb-4">10. Sécurité des données</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nous mettons en place des mesures de sécurité appropriées pour protéger vos données contre
              l'accès non autorisé, l'altération, la divulgation ou la destruction. Cependant, aucune transmission
              de données sur Internet n'est 100% sécurisée.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mt-8 mb-4">11. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Notre site peut utiliser des cookies pour améliorer votre expérience. Vous pouvez contrôler les cookies
              via les paramètres de votre navigateur. Consultez notre page dédiée aux cookies pour plus d'informations.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mt-8 mb-4">12. Modifications</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nous pouvons mettre à jour cette politique de confidentialité. Les modifications entrent en vigueur
              dès leur publication. Nous vous encourageons à consulter régulièrement cette page.
            </p>
          </section>

          <section className="mt-12 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Si vous avez des questions concernant cette politique de confidentialité ou nos pratiques en matière de données,
              veuillez nous contacter.
            </p>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}
