export type EnvoiEmail = {
  to: string;
  subject: string;
  html: string;
};

/**
 * Point d'entrée unique pour l'envoi d'e-mails côté serveur.
 *
 * Volontairement laissé en stub (pas de provider ni d'adresse d'expéditeur
 * configurés) : à brancher plus tard sur un vrai service (Resend, SendGrid,
 * Nodemailer, etc.). Tout le code métier appelle uniquement cette fonction,
 * donc un seul endroit à modifier pour activer l'envoi réel.
 */
export async function envoyerEmail({ to, subject, html }: EnvoiEmail): Promise<void> {
  // TODO: brancher un vrai service d'envoi (sender à définir par l'utilisateur).
  console.log(`[email:stub] → ${to} | ${subject}`);
  if (process.env.NODE_ENV !== "production") {
    console.log(html);
  }
}
