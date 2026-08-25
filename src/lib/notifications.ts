import { prisma } from "@/lib/prisma";
import { envoyerEmail, envoyerEmailAuSalon } from "@/lib/email";
import {
  calculerTotalAvecOptions,
  formatPrix,
  type Densite,
  type LigneReservation,
  type Longueur,
  type OptionAvecVariantes,
  type PrestationAvecVariantes,
} from "@/lib/prestations";
import { LABEL_LONGUEUR } from "@/lib/categories";

type RendezVousEmail = {
  dateDebut: Date;
  client: { prenom: string; nom: string; email: string; telephone: string | null };
  prestations: {
    prestation: PrestationAvecVariantes;
    longueur?: Longueur | null;
    densite?: Densite | null;
    options: { option: OptionAvecVariantes }[];
  }[];
};

function formatDateHeure(date: Date): string {
  return new Date(date).toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function versLignes(rdv: RendezVousEmail): LigneReservation[] {
  return rdv.prestations.map((p) => ({
    prestation: p.prestation,
    longueur: p.longueur ?? undefined,
    densite: p.densite ?? undefined,
    options: p.options.map((o) => o.option),
  }));
}

function listePrestations(rdv: RendezVousEmail): string {
  return rdv.prestations
    .map((p) => {
      const label = p.longueur ? ` (${LABEL_LONGUEUR[p.longueur]})` : "";
      const options = p.options.map((o) => o.option.nom).join(", ");
      return `${p.prestation.nom}${label}${options ? ` + ${options}` : ""}`;
    })
    .join(", ");
}

async function totalPrix(rdv: RendezVousEmail): Promise<string> {
  const lissageMatrice = await prisma.lissageTarif.findMany();
  const { prixTotalCentimes } = calculerTotalAvecOptions(versLignes(rdv), lissageMatrice);
  return formatPrix(prixTotalCentimes);
}

function gabarit(titre: string, intro: string, corpsHtml: string): string {
  return `
    <div style="font-family: sans-serif; color: #2a2019;">
      <h1 style="font-size: 20px;">${titre}</h1>
      <p>${intro}</p>
      ${corpsHtml}
      <p style="margin-top: 24px; color: #8c6b70; font-size: 13px;">— Namasté, coiffure &amp; bien-être</p>
    </div>
  `;
}

async function detailsRdvHtml(rdv: RendezVousEmail): Promise<string> {
  return `
    <ul>
      <li><strong>Date :</strong> ${formatDateHeure(rdv.dateDebut)}</li>
      <li><strong>Prestations :</strong> ${listePrestations(rdv)}</li>
      <li><strong>Total :</strong> ${await totalPrix(rdv)}</li>
    </ul>
  `;
}

export async function notifierRdvCreeParAdmin(rdv: RendezVousEmail) {
  await envoyerEmail({
    to: rdv.client.email,
    subject: "Votre rendez-vous chez Namasté",
    html: gabarit(
      "Rendez-vous confirmé",
      `Bonjour ${rdv.client.prenom}, un rendez-vous a été pris pour vous chez Namasté.`,
      await detailsRdvHtml(rdv),
    ),
  });
}

export async function notifierRdvModifie(rdv: RendezVousEmail) {
  await envoyerEmail({
    to: rdv.client.email,
    subject: "Votre rendez-vous a été modifié",
    html: gabarit(
      "Rendez-vous modifié",
      `Bonjour ${rdv.client.prenom}, votre rendez-vous chez Namasté a été mis à jour.`,
      await detailsRdvHtml(rdv),
    ),
  });
}

export async function notifierRdvDeplace(rdv: RendezVousEmail, ancienneDateDebut: Date) {
  await envoyerEmail({
    to: rdv.client.email,
    subject: "Votre rendez-vous a été déplacé",
    html: gabarit(
      "Rendez-vous déplacé",
      `Bonjour ${rdv.client.prenom}, votre rendez-vous chez Namasté a été déplacé.`,
      `
        <p><strong>Ancien créneau :</strong> ${formatDateHeure(ancienneDateDebut)}</p>
        ${await detailsRdvHtml(rdv)}
      `,
    ),
  });
}

export async function notifierRdvSupprime(rdv: RendezVousEmail) {
  await envoyerEmail({
    to: rdv.client.email,
    subject: "Votre rendez-vous a été annulé",
    html: gabarit(
      "Rendez-vous annulé",
      `Bonjour ${rdv.client.prenom}, votre rendez-vous chez Namasté a été annulé.`,
      await detailsRdvHtml(rdv),
    ),
  });
}

export async function notifierClientDemandeRdv(email: string, prenom: string) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #2a2019; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; background: #fafaf8; }
        .header { background: linear-gradient(135deg, #d4a574 0%, #c9934d 100%); color: white; padding: 40px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 32px; font-weight: 600; letter-spacing: 1px; }
        .header p { margin: 8px 0 0 0; opacity: 0.95; font-size: 14px; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; color: #2a2019; margin-bottom: 24px; }
        .badge { display: inline-block; background: #d4a574; color: white; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 20px; }
        .message-box { background: #f5f1ed; border-left: 4px solid #d4a574; padding: 16px; margin: 20px 0; border-radius: 4px; }
        .message-box p { margin: 0; color: #555; }
        .divider { height: 1px; background: #e0d5d0; margin: 24px 0; }
        .next-steps { background: #fff9f5; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .next-steps h3 { color: #d4a574; font-size: 14px; margin: 0 0 12px 0; }
        .next-steps ol { margin: 0; padding-left: 20px; }
        .next-steps li { margin: 8px 0; color: #2a2019; font-size: 14px; }
        .cta-button { display: inline-block; background: #d4a574; color: white; padding: 12px 28px; text-decoration: none; border-radius: 4px; font-weight: 600; margin-top: 16px; }
        .cta-button:hover { background: #c9934d; }
        .footer { background: #f5f1ed; padding: 24px 30px; text-align: center; border-top: 1px solid #e0d5d0; font-size: 12px; color: #666; }
        .footer-link { color: #d4a574; text-decoration: none; }
        .contact-info { margin-top: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Namasté</h1>
          <p>Coiffure & Bien-être</p>
        </div>

        <div class="content">
          <div class="badge">✓ Demande reçue</div>

          <p class="greeting">Bonjour <strong>${prenom}</strong>,</p>

          <p>Nous avons bien reçu votre demande de rendez-vous. C'est avec plaisir que nous allons examiner votre demande pour vous proposer le meilleur créneau possible.</p>

          <div class="message-box">
            <p><strong>Merci de votre confiance!</strong> Notre équipe prendra soin de vous et vous contactera rapidement pour confirmer votre rendez-vous dans une atmosphère sereine et bienveillante.</p>
          </div>

          <div class="next-steps">
            <h3>CE QUI SE PASSE MAINTENANT</h3>
            <ol>
              <li>Notre équipe examine votre demande</li>
              <li>Nous vérifions nos disponibilités</li>
              <li>Vous recevrez un email de confirmation</li>
              <li>Votre rendez-vous sera réservé!</li>
            </ol>
          </div>

          <p style="color: #555; font-size: 14px; margin-top: 24px;">
            <strong>Délai de réponse:</strong> Vous recevrez une réponse dans les 24h (jours ouvrables).
          </p>

          <div class="divider"></div>

          <p style="color: #666; font-size: 14px;">
            Si vous avez des questions ou souhaitez modifier votre demande, n'hésitez pas à nous contacter directement.
          </p>
        </div>

        <div class="footer">
          <strong>Namasté — Coiffure & Bien-être</strong>
          <div class="contact-info">
            ☎ 06 51 41 28 33<br>
            📍 Salon privé & confidentiel<br>
            <a href="mailto:Namaste-coiffure-bien-etre@outlook.fr" class="footer-link">Namaste-coiffure-bien-etre@outlook.fr</a>
          </div>
          <p style="margin-top: 12px; opacity: 0.8;">Une expérience exclusive conçue pour vous.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await envoyerEmail({
    to: email,
    subject: "✓ Votre demande de rendez-vous chez Namasté",
    html: htmlContent,
  });
}

export async function notifierDemandeAcceptee(rdv: RendezVousEmail) {
  await envoyerEmail({
    to: rdv.client.email,
    subject: "Votre demande de rendez-vous est acceptée",
    html: gabarit(
      "Demande acceptée",
      `Bonjour ${rdv.client.prenom}, bonne nouvelle : votre demande de rendez-vous chez Namasté a été acceptée.`,
      await detailsRdvHtml(rdv),
    ),
  });
}

export async function notifierDemandeRefusee(rdv: RendezVousEmail, motif?: string) {
  await envoyerEmail({
    to: rdv.client.email,
    subject: "Votre demande de rendez-vous",
    html: gabarit(
      "Demande non retenue",
      `Bonjour ${rdv.client.prenom}, votre demande de rendez-vous chez Namasté n'a malheureusement pas pu être acceptée pour le créneau souhaité.`,
      motif ? `<p>${motif}</p>` : "",
    ),
  });
}

// === NOTIFICATIONS POUR LE SALON ===

export async function notifierSalonRdvAjoute(rdv: RendezVousEmail) {
  await envoyerEmailAuSalon({
    subject: `NOUVEAU RDV - ${rdv.client.prenom} ${rdv.client.nom}`,
    action: "AJOUT",
    titre: "Nouveau rendez-vous confirmé",
    intro: `Un nouveau rendez-vous a été confirmé pour ${rdv.client.prenom} ${rdv.client.nom}.`,
    details: await detailsRdvHtml(rdv),
    contact: `Tél: ${rdv.client.telephone || rdv.client.email}`,
  });
}

export async function notifierSalonRdvModifie(rdv: RendezVousEmail) {
  await envoyerEmailAuSalon({
    subject: `RDV MODIFIÉ - ${rdv.client.prenom} ${rdv.client.nom}`,
    action: "MODIFICATION",
    titre: "Rendez-vous modifié",
    intro: `Le rendez-vous de ${rdv.client.prenom} ${rdv.client.nom} a été mis à jour.`,
    details: await detailsRdvHtml(rdv),
    contact: `Tél: ${rdv.client.telephone || rdv.client.email}`,
  });
}

export async function notifierSalonRdvDeplace(rdv: RendezVousEmail, ancienneDateDebut: Date) {
  await envoyerEmailAuSalon({
    subject: `RDV DÉPLACÉ - ${rdv.client.prenom} ${rdv.client.nom}`,
    action: "DÉPLACEMENT",
    titre: "Rendez-vous déplacé",
    intro: `Le rendez-vous de ${rdv.client.prenom} ${rdv.client.nom} a été déplacé.`,
    details: `
      <p><strong>Ancien créneau :</strong> ${formatDateHeure(ancienneDateDebut)}</p>
      ${await detailsRdvHtml(rdv)}
    `,
    contact: `Tél: ${rdv.client.telephone || rdv.client.email}`,
  });
}

export async function notifierSalonRdvSupprime(rdv: RendezVousEmail) {
  await envoyerEmailAuSalon({
    subject: `RDV SUPPRIMÉ - ${rdv.client.prenom} ${rdv.client.nom}`,
    action: "SUPPRESSION",
    titre: "Rendez-vous annulé",
    intro: `Le rendez-vous de ${rdv.client.prenom} ${rdv.client.nom} a été annulé.`,
    details: await detailsRdvHtml(rdv),
    contact: `Tél: ${rdv.client.telephone || rdv.client.email}`,
  });
}
