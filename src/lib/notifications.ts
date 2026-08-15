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

export async function notifierClientDemandeRdv(rdv: RendezVousEmail) {
  await envoyerEmail({
    to: rdv.client.email,
    subject: "Votre demande de rendez-vous chez Namasté",
    html: gabarit(
      "Demande reçue",
      `Bonjour ${rdv.client.prenom}, nous avons bien reçu votre demande de rendez-vous. Notre équipe l'examinera rapidement et vous contactera pour confirmer votre créneau.`,
      await detailsRdvHtml(rdv),
    ),
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
