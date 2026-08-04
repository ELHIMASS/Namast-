import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Gestion des Cookies — Namasté",
  description: "Gestion des cookies et consentements de tracking",
};

export default function CookiesPage() {
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
            <h1 className="font-serif text-4xl mb-2 text-foreground">Gestion des Cookies</h1>
            <p className="text-muted-foreground">Dernière mise à jour: {new Date().getFullYear()}</p>
          </div>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mt-8 mb-4">Qu'est-ce qu'un cookie?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Un cookie est un petit fichier texte stocké sur votre appareil (ordinateur, téléphone, tablette)
              lorsque vous visitez un site web. Les cookies permettent aux sites web de se souvenir des informations
              vous concernant lors de vos visites futures.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mt-8 mb-4">Types de cookies que nous utilisons</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">1. Cookies Essentiels (Strictement nécessaires)</h3>
                <p className="text-muted-foreground">
                  Ces cookies sont indispensables pour le fonctionnement du site. Ils permettent:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                  <li>L'authentification et les sessions</li>
                  <li>La mémorisation de vos préférences de langue</li>
                  <li>La sécurité et la prévention des fraudes</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2 italic">
                  ⚠️ Ces cookies ne peuvent pas être désactivés. Vous pouvez toutefois les configurer via votre navigateur.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">2. Cookies de Performance</h3>
                <p className="text-muted-foreground">
                  Ils nous aident à améliorer le site en collectant des informations anonymes sur:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                  <li>Les pages les plus visitées</li>
                  <li>Les erreurs rencontrées</li>
                  <li>Le temps passé sur chaque page</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">3. Cookies de Ciblage/Marketing</h3>
                <p className="text-muted-foreground">
                  Utilisés pour afficher des contenus et publicités pertinents:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                  <li>Publicités personnalisées</li>
                  <li>Contenu recommandé</li>
                  <li>Partage sur réseaux sociaux</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2 italic">
                  ✓ Vous pouvez accepter ou refuser ces cookies. Ils nécessitent votre consentement explicite.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">4. Cookies de Tiers</h3>
                <p className="text-muted-foreground">
                  Placés par des services tiers (Google Analytics, réseaux sociaux) pour:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                  <li>L'analyse du trafic</li>
                  <li>Les statistiques</li>
                  <li>Les fonctionnalités de partage</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mt-8 mb-4">Comment gérer vos cookies</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Via notre site</h3>
                <p className="text-muted-foreground">
                  Une banneau de consentement apparaît lors de votre première visite. Vous pouvez:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                  <li>Accepter tous les cookies</li>
                  <li>Refuser tous les cookies non-essentiels</li>
                  <li>Personnaliser vos préférences</li>
                  <li>Modifier vos préférences à tout moment</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Via votre navigateur</h3>
                <p className="text-muted-foreground">
                  Vous pouvez configurer votre navigateur pour:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                  <li>Accepter/refuser les cookies</li>
                  <li>Supprimer les cookies existants</li>
                  <li>Être averti avant l'acceptation d'un cookie</li>
                  <li>Désactiver les cookies complètement</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2 italic">
                  Attention: Désactiver tous les cookies peut affecter le fonctionnement du site.
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg text-sm">
                <p className="font-semibold text-foreground mb-2">Liens vers les paramètres de navigateurs populaires:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <a href="https://support.google.com/chrome/answer/95647" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
                  <li>• <a href="https://support.mozilla.org/fr/kb/activer-desactiver-cookies" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
                  <li>• <a href="https://support.apple.com/fr-fr/guide/safari/manage-cookies-and-website-data-sfri11471/mac" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Safari</a></li>
                  <li>• <a href="https://support.microsoft.com/fr-fr/help/17442/windows-internet-explorer-delete-manage-cookies" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Internet Explorer</a></li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mt-8 mb-4">Services tiers utilisant les cookies</h2>
            <p className="text-muted-foreground mb-3">Notre site peut utiliser les services suivants:</p>

            <div className="space-y-3">
              <div className="bg-muted/50 p-3 rounded text-sm">
                <p className="font-semibold text-foreground">Google Analytics</p>
                <p className="text-muted-foreground">Analyse du trafic et comportement des utilisateurs</p>
                <p className="text-xs text-muted-foreground mt-1">
                  <a href="https://policies.google.com/technologies/cookies" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                    En savoir plus →
                  </a>
                </p>
              </div>

              <div className="bg-muted/50 p-3 rounded text-sm">
                <p className="font-semibold text-foreground">Réseaux Sociaux</p>
                <p className="text-muted-foreground">Boutons de partage et pixels de suivi</p>
                <p className="text-xs text-muted-foreground mt-1">Consultez les politiques de confidentialité de chaque réseau</p>
              </div>

              <div className="bg-muted/50 p-3 rounded text-sm">
                <p className="font-semibold text-foreground">Services d'hébergement</p>
                <p className="text-muted-foreground">Cookies de session et de sécurité</p>
                <p className="text-xs text-muted-foreground mt-1">
                  <a href="https://vercel.com/legal/privacy-policy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                    Politique Vercel →
                  </a>
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mt-8 mb-4">Données collectées via les cookies</h2>
            <p className="text-muted-foreground mb-3">Les cookies nous permettent de collecter:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Adresse IP (anonymisée)</li>
              <li>Type de navigateur et système d'exploitation</li>
              <li>Pages consultées et durée de visite</li>
              <li>Lien de provenance (referrer)</li>
              <li>Résolution d'écran</li>
              <li>Langue et zone horaire</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mt-8 mb-4">Sécurité et confidentialité</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vos données collectées via les cookies sont traitées conformément à notre Politique de Confidentialité.
              Nous ne vendons jamais vos données personnelles et nous utilisons le chiffrement SSL pour la transmission
              de données sensibles.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mt-8 mb-4">Durée de conservation</h2>
            <p className="text-muted-foreground mb-3">Les cookies sont conservés selon leur type:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Cookies de session:</strong> Supprimés à la fermeture du navigateur</li>
              <li><strong className="text-foreground">Cookies persistants:</strong> Conservés jusqu'à 13 mois maximum</li>
              <li><strong className="text-foreground">Cookies tiers:</strong> Selon la politique du prestataire</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mt-8 mb-4">Modifications de cette politique</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nous pouvons mettre à jour cette politique à tout moment. Les modifications importantes seront
              communiquées via un avis sur le site. Nous vous encourageons à consulter régulièrement cette page
              pour rester informé.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mt-8 mb-4">Questions ou réclamations</h2>
            <p className="text-muted-foreground mb-4">
              Si vous avez des questions concernant notre utilisation des cookies:
            </p>
            <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-2">
              <p><strong className="text-foreground">Email:</strong> <span className="text-muted-foreground">contact@namaste-salon.fr</span></p>
              <p><strong className="text-foreground">Adresse:</strong> <span className="text-muted-foreground">6 impasse des Prunelliers, 69720 Saint-Laurent-de-Mure</span></p>
              <p className="text-xs text-muted-foreground mt-3">
                Vous pouvez également contacter la CNIL (Commission Nationale de l'Informatique et des Libertés)
                si vous estimez que vos droits ne sont pas respectés.
              </p>
            </div>
          </section>

          <section className="mt-12 pt-6 border-t border-border space-y-3">
            <p className="text-sm text-muted-foreground">
              <Link href="/privacy" className="text-primary hover:underline">
                → Consulter notre Politique de Confidentialité
              </Link>
            </p>
            <p className="text-sm text-muted-foreground">
              <Link href="/legal" className="text-primary hover:underline">
                → Consulter nos Mentions Légales
              </Link>
            </p>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}
