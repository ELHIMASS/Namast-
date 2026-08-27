import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    return NextResponse.json({
      configured: false,
      message: "Variables GOOGLE_PLACES_API_KEY ou GOOGLE_PLACE_ID non configurées.",
    });
  }

  try {
    // 1. Essayer l'API Places Legacy
    const legacyUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews,url&language=fr&key=${apiKey}`;
    const legacyRes = await fetch(legacyUrl, { next: { revalidate: 86400 } });

    if (legacyRes.ok) {
      const legacyData = await legacyRes.json();
      if (legacyData.status === "OK" && legacyData.result) {
        const result = legacyData.result;
        const formattedReviews = (result.reviews || []).map((rev: any, idx: number) => ({
          id: rev.time ? String(rev.time) : `rev-${idx}`,
          author_name: rev.author_name,
          profile_photo_url: rev.profile_photo_url,
          rating: rev.rating,
          relative_time_description: rev.relative_time_description,
          text: rev.text,
          time: rev.time,
        }));

        return NextResponse.json({
          configured: true,
          rating: result.rating,
          user_ratings_total: result.user_ratings_total,
          url: result.url,
          reviews: formattedReviews,
        });
      }
    }

    // 2. Essayer la nouvelle Places API (v1)
    const newApiUrl = `https://places.googleapis.com/v1/places/${placeId}?languageCode=fr`;
    const newRes = await fetch(newApiUrl, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "id,displayName,rating,userRatingCount,reviews,googleMapsUri",
      },
      next: { revalidate: 86400 },
    });

    if (newRes.ok) {
      const newData = await newRes.json();
      if (newData.rating) {
        const formattedReviews = (newData.reviews || []).map((rev: any, idx: number) => ({
          id: rev.name || `rev-new-${idx}`,
          author_name: rev.authorAttribution?.displayName || "Client Google",
          profile_photo_url: rev.authorAttribution?.photoUri,
          rating: rev.rating || 5,
          relative_time_description: rev.relativePublishTimeDescription || "Récemment",
          text: rev.text?.text || "",
        }));

        return NextResponse.json({
          configured: true,
          rating: newData.rating,
          user_ratings_total: newData.userRatingCount,
          url: newData.googleMapsUri,
          reviews: formattedReviews,
        });
      }
    }

    return NextResponse.json(
      { configured: false, error: "L'API Places n'est pas encore activée sur Google Cloud." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erreur serveur API Google Reviews:", error);
    return NextResponse.json(
      { configured: false, error: "Impossible de contacter l'API Google." },
      { status: 200 }
    );
  }
}
