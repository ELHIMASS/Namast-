import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Mentions Légales — Namasté",
  description: "Mentions légales et informations légales du salon Namasté",
};

export default function LegalPage() {
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
            <h1 className="font-serif text-4xl mb-2 text-foreground">Mentions Légales</h1>
            <p className="text-muted-foreground">Dernière mise à jour: {new Date().getFullYear()}</p>
          </div>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mt-8 mb-4">1. Identification de l'entreprise</h2>
            <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-2">
              <p><strong className="text-foreground">Nom:</strong> <span className="text-muted-foreground">Namasté - Salon de Coiffure & Bien-être</span></p>
              <p><strong className="text-foreground">Statut juridique:</strong> <span className="text-muted-foreground">SARL / Auto-entrepreneur</span></p>
              <p><strong className="text-foreground">SIRET:</strong> <span className="text-muted-foreground">À compléter selon votre numéro</span></p>
              <p><strong className="text-foreground">Adresse:</strong> <span className="text-muted-foreground">6 impasse des Prunelliers, 69720 Saint-Laurent-de-Mure</span></p>
              <p><strong className="text-foreground">Téléphone:</strong> <span className="text-muted-foreground">À compléter</span></p>
              <p><strong className="text-foreground">Email:</strong> <span className="text-muted-foreground">contact@namaste-salon.fr</span></p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mt-8 mb-4">2. Responsable de publication</h2>
            <p className="text-muted-foreground leading-relaxed">
              Le présent site est édité par Namasté, salon de coiffure privé. La responsabilité du contenu incombe
              à la gérante/propriétaire du salon.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mt-8 mb-4">3. Hébergement du site</h2>
            <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-1">
              <p className="font-semibold text-foreground">Hébergeur:</p>
              <p className="text-muted-foreground">Vercel Inc.</p>
              <p className="text-muted-foreground">440 N Barranca Ave, Covina, CA 91723, United States</p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mt-8 mb-4">4. Propriété intellectuelle</h2>
            <p className="text-muted-foreground leading-relaxed">
              L'ensemble du contenu du site (textes, images, graphismes, logos, icônes, sons, logiciels) est la propriété
              exclusive de Namasté ou de ses partenaires. Toute reproduction, représentation, modification, publication,
              adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé,
              est interdite, sauf autorisation écrite préalable de Namasté.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mt-8 mb-4">5. Limitation de responsabilité</h2>
            <p className="text-muted-foreground leading-relaxed">
              Namasté s'efforce de maintenir les informations contenues sur ce site à jour et exactes.
              Cependant, nous ne pouvons pas garantir l'exactitude, l'exhaustivité ou l'actualité des informations.
              En aucun cas, Namasté ne sera responsable des dommages directs ou indirects résultant de l'accès ou
              de l'utilisation du site.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mt-8 mb-4">6. Conditions d'utilisation</h2>
            <p className="text-muted-foreground mb-3">L'accès et l'utilisation du site impliquent l'acceptation des conditions suivantes:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Vous vous engagez à utiliser le site de manière légale et licite</li>
              <li>Vous n'utiliserez pas le site pour publier du contenu offensant, abusif ou illégal</li>
              <li>Vous respecterez la propriété intellectuelle d'autrui</li>
              <li>Vous ne tenterez pas d'accéder à des parties protégées du site sans autorisation</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mt-8 mb-4">7. Gestion des rendez-vous</h2>
            <p className="text-muted-foreground leading-relaxed">
              Les rendez-vous peuvent être annulés ou reportés jusqu'à 48 heures avant l'heure prévue.
              Les annulations tardives ou les absences non justifiées peuvent entraîner le paiement total
              du service réservé. Le salon se réserve le droit de refuser un rendez-vous sans justification.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mt-8 mb-4">8. Tarifs et paiement</h2>
            <p className="text-muted-foreground leading-relaxed">
              Les tarifs affichés sur le site sont en euros TTC. Ils peuvent être modifiés sans préavis.
              Le paiement des services doit être effectué au moment de la prestation, selon les modalités
              proposées par le salon (espèces, carte bancaire, etc.).
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mt-8 mb-4">9. Liens hypertextes</h2>
            <p className="text-muted-foreground leading-relaxed">
              Le site peut contenir des liens vers d'autres sites web. Namasté n'est pas responsable du contenu
              de ces sites externes. La présence d'un lien n'implique pas une approbation du contenu lié.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mt-8 mb-4">10. Conformité légale</h2>
            <p className="text-muted-foreground mb-3">Le salon Namasté respecte les réglementations suivantes:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Règlement Général sur la Protection des Données (RGPD)</li>
              <li>Loi informatique et libertés</li>
              <li>Loi sur la consommation</li>
              <li>Normes d'hygiène et de sécurité applicables aux salons de coiffure</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mt-8 mb-4">11. Contact et réclamations</h2>
            <p className="text-muted-foreground mb-4">
              Pour toute question, réclamation ou demande d'information:
            </p>
            <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-2">
              <p><strong className="text-foreground">Email:</strong> <span className="text-muted-foreground">contact@namaste-salon.fr</span></p>
              <p><strong className="text-foreground">Adresse:</strong> <span className="text-muted-foreground">6 impasse des Prunelliers, 69720 Saint-Laurent-de-Mure</span></p>
              <p><strong className="text-foreground">Délai de réponse:</strong> <span className="text-muted-foreground">Nous nous engageons à répondre dans les 30 jours</span></p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mt-8 mb-4">12. Droit applicable et juridiction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Le site est soumis à la loi française. Tout litige sera de la compétence exclusive des tribunaux français,
              sauf disposition impérative différente. En cas de litige, le client pourra également se tourner vers
              une procédure de médiation ou de conciliation.
            </p>
          </section>

          <section className="mt-12 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Dernière mise à jour: {new Date().toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}
