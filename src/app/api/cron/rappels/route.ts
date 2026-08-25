import { NextRequest, NextResponse } from "next/server";
import { envoyerRappelsDemain } from "@/lib/rappels";

export async function GET(request: NextRequest) {
  // Optionnel : sécuriser l'appel par jeton si configuré dans .env
  const jetonSecret = process.env.CALENDRIER_JETON;
  const token = request.nextUrl.searchParams.get("token");

  if (jetonSecret && token && token !== jetonSecret) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const resultat = await envoyerRappelsDemain();
    return NextResponse.json(resultat);
  } catch (error) {
    console.error("Erreur API rappels:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi des rappels" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
