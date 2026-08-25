import axios from "axios";

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SALON_EMAIL = "Namaste-coiffure-bien-etre@outlook.fr";

interface EmailData {
  to: { email: string; name?: string }[];
  sender: { email: string; name: string };
  subject: string;
  htmlContent: string;
}

interface EmailAuSalonData {
  subject: string;
  action: string;
  titre: string;
  intro: string;
  details: string;
  contact: string;
}

export async function envoyerEmail(data: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  if (!BREVO_API_KEY) {
    console.error("BREVO_API_KEY non configurée");
    return false;
  }

  const emailData: EmailData = {
    to: [{ email: data.to }],
    sender: {
      email: "Namaste-coiffure-bien-etre@outlook.fr",
      name: "Namasté Salon",
    },
    subject: data.subject,
    htmlContent: data.html,
  };

  try {
    await axios.post("https://api.brevo.com/v3/smtp/email", emailData, {
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
      },
    });
    return true;
  } catch (error) {
    console.error("Erreur envoi email:", error);
    return false;
  }
}

export async function envoyerEmailAuSalon(data: EmailAuSalonData): Promise<boolean> {
  if (!BREVO_API_KEY) {
    console.error("BREVO_API_KEY non configurée");
    return false;
  }

  const htmlContent = `
    <div style="font-family: sans-serif; color: #2a2019; background: #fafaf8; padding: 20px; border-radius: 8px;">
      <div style="background: #d4a574; color: white; padding: 16px; border-radius: 6px 6px 0 0; margin: -20px -20px 20px -20px;">
        <span style="background: #c9934d; padding: 4px 12px; border-radius: 4px; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">${data.action}</span>
      </div>
      <h2 style="font-size: 18px; margin: 0 0 12px 0; color: #2a2019;">${data.titre}</h2>
      <p style="color: #666; margin: 0 0 16px 0;">${data.intro}</p>
      ${data.details}
      <div style="background: #f5f1ed; padding: 12px; border-radius: 6px; margin-top: 16px; font-size: 13px; color: #666;">
        <strong>Contact client:</strong> ${data.contact}
      </div>
      <p style="margin-top: 24px; color: #8c6b70; font-size: 12px; border-top: 1px solid #e0d5d0; padding-top: 12px;">— Namasté, coiffure &amp; bien-être</p>
    </div>
  `;

  const emailData: EmailData = {
    to: [{ email: SALON_EMAIL, name: "Namasté Salon" }],
    sender: {
      email: "Namaste-coiffure-bien-etre@outlook.fr",
      name: "Namasté Salon",
    },
    subject: data.subject,
    htmlContent,
  };

  try {
    await axios.post("https://api.brevo.com/v3/smtp/email", emailData, {
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
      },
    });
    return true;
  } catch (error) {
    console.error("Erreur envoi email au salon:", error);
    return false;
  }
}

export async function envoyerEmailSalon(
  prenom: string,
  nom: string,
  telephone: string,
  email: string,
  dateDebut: string,
  prestations: string,
  message?: string
) {
  if (!BREVO_API_KEY) {
    console.error("BREVO_API_KEY non configurée");
    return false;
  }

  const dateObj = new Date(dateDebut);
  const dateFormatee = dateObj.toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const contenuHtml = `
    <h2>Nouvelle demande de rendez-vous</h2>
    <p><strong>Client:</strong> ${prenom} ${nom}</p>
    <p><strong>Téléphone:</strong> ${telephone}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Date demandée:</strong> ${dateFormatee}</p>
    <p><strong>Prestations:</strong> ${prestations}</p>
    ${message ? `<p><strong>Message:</strong> ${message}</p>` : ""}
    <hr />
    <p>À confirmer ou refuser directement sur le site d'administration.</p>
  `;

  const emailData: EmailData = {
    to: [{ email: SALON_EMAIL, name: "Namasté Salon" }],
    sender: {
      email: "Namaste-coiffure-bien-etre@outlook.fr",
      name: "Namasté Salon",
    },
    subject: `Nouvelle demande RDV - ${prenom} ${nom}`,
    htmlContent: contenuHtml,
  };

  try {
    await axios.post("https://api.brevo.com/v3/smtp/email", emailData, {
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
      },
    });
    return true;
  } catch (error) {
    console.error("Erreur envoi email:", error);
    return false;
  }
}
