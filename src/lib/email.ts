import axios from "axios";

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SALON_EMAIL = "Namasté-coiffure-bien-etre@outlook.fr";

interface EmailData {
  to: { email: string; name?: string }[];
  sender: { email: string; name: string };
  subject: string;
  htmlContent: string;
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
  const dateFormatee = dateObj.toLocaleDateString("fr-FR", {
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
      email: "noreply@namate-salon.fr",
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
