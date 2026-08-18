"use client";

import { useEffect, useState } from "react";
import {
  getPrestationsAvecVariantes,
  getOptionsAvecVariantes,
  getLissageTarifs,
  modifierPrixPrestationAction,
  modifierPrixVariantePrestationAction,
  modifierPrixOptionAction,
  modifierPrixVarianteOptionAction,
  modifierLissageTarifAction,
  synchroniserVariantesPrestationAction,
  synchroniserVariantesOptionAction,
} from "./actions";

type Prestation = Awaited<ReturnType<typeof getPrestationsAvecVariantes>>[0];
type Option = Awaited<ReturnType<typeof getOptionsAvecVariantes>>[0];
type LissageTarif = Awaited<ReturnType<typeof getLissageTarifs>>[0];

const LABEL_LONGUEUR: Record<string, string> = {
  COURT: "Courts",
  CARRE: "Carré",
  MI_LONG: "Mi-longs",
  LONG: "Longs",
  TRES_LONG: "Très longs",
};

const LABEL_DENSITE: Record<string, string> = {
  FIN: "Fins",
  NORMAL: "Normaux",
  EPAIS: "Épais",
};

export default function PageTarifs() {
  const [tab, setTab] = useState<"prestations" | "options" | "lissage">("prestations");
  const [prestations, setPrestations] = useState<Prestation[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [lissage, setLissage] = useState<LissageTarif[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    chargerDonnees();
  }, []);

  async function chargerDonnees() {
    try {
      const [p, o, l] = await Promise.all([
        getPrestationsAvecVariantes(),
        getOptionsAvecVariantes(),
        getLissageTarifs(),
      ]);
      setPrestations(p);
      setOptions(o);
      setLissage(l);
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors du chargement." });
    } finally {
      setLoading(false);
    }
  }

  async function sauvegarderPrix(id: string, type: string, value: number | null, ancienPrix?: number) {
    setSaving(id);
    try {
      let result;

      if (type === "prestation") {
        // Sauvegarde le prix de base
        result = await modifierPrixPrestationAction(id, value as number);

        // Si succès et on a l'ancien prix, synchronise les variantes
        if (result?.ok && ancienPrix !== undefined) {
          const syncResult = await synchroniserVariantesPrestationAction(
            id,
            ancienPrix,
            value as number
          );
          if (!syncResult.ok) {
            setMessage({ type: "error", text: syncResult.error || "Erreur sync variantes." });
            setSaving(null);
            return;
          }
          // Recharge les données pour afficher les nouveaux prix
          await chargerDonnees();
        }
      } else if (type === "prestation-variante") {
        result = await modifierPrixVariantePrestationAction(id, value as number);
      } else if (type === "option") {
        // Sauvegarde le prix de base
        result = await modifierPrixOptionAction(id, value);

        // Si succès et on a l'ancien prix, synchronise les variantes
        if (result?.ok && ancienPrix !== undefined && value !== null) {
          const syncResult = await synchroniserVariantesOptionAction(
            id,
            ancienPrix,
            value
          );
          if (!syncResult.ok) {
            setMessage({ type: "error", text: syncResult.error || "Erreur sync variantes." });
            setSaving(null);
            return;
          }
          // Recharge les données pour afficher les nouveaux prix
          await chargerDonnees();
        }
      } else if (type === "option-variante") {
        result = await modifierPrixVarianteOptionAction(id, value as number);
      } else if (type === "lissage") {
        result = await modifierLissageTarifAction(id, value as number);
      }

      if (result?.ok) {
        setMessage({ type: "success", text: "Prix mis à jour et variantes synchronisées!" });
        setTimeout(() => setMessage(null), 2000);
      } else {
        setMessage({ type: "error", text: result?.error || "Erreur." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors de la sauvegarde." });
    } finally {
      setSaving(null);
    }
  }

  function formatPrix(centimes: number | null): string {
    if (centimes === null) return "—";
    return (centimes / 100).toFixed(2) + "€";
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ marginBottom: "8px", fontSize: "28px", fontWeight: "600" }}>Gestion des Tarifs</h1>
        <p style={{ color: "#999", fontSize: "14px" }}>Modifiez les prix des prestations, options et lissage. Les variantes se synchronisent automatiquement.</p>
      </div>

      {message && (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: "20px",
            borderRadius: "6px",
            backgroundColor: message.type === "success" ? "#e8f5e9" : "#ffebee",
            color: message.type === "success" ? "#2e7d32" : "#c62828",
            border: `1px solid ${message.type === "success" ? "#c8e6c9" : "#ffcdd2"}`,
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span style={{ fontSize: "18px" }}>
            {message.type === "success" ? "✓" : "⚠"}
          </span>
          {message.text}
        </div>
      )}

      <div style={{ marginBottom: "20px", display: "flex", gap: "0", borderBottom: "2px solid #e0d5d0" }}>
        {(["prestations", "options", "lissage"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "16px 24px",
              border: "none",
              backgroundColor: "transparent",
              borderBottom: tab === t ? "3px solid #d4a574" : "none",
              color: tab === t ? "#d4a574" : "#999",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: tab === t ? "700" : "500",
              transition: "all 0.2s ease",
              flex: 1,
              textAlign: "center",
            }}
            onMouseOver={(e) => {
              if (tab !== t) {
                (e.target as HTMLElement).style.color = "#666";
              }
            }}
            onMouseOut={(e) => {
              if (tab !== t) {
                (e.target as HTMLElement).style.color = "#999";
              }
            }}
          >
            {t === "prestations" && "💇 Prestations"}
            {t === "options" && "✨ Options"}
            {t === "lissage" && "💆 Lissage"}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <>
          {tab === "prestations" && (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  backgroundColor: "white",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f5f1ed", borderBottom: "2px solid #e0d5d0" }}>
                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>
                      Prestation
                    </th>
                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>
                      Catégorie
                    </th>
                    <th style={{ padding: "12px", textAlign: "right", fontWeight: "600" }}>
                      Prix de base
                    </th>
                    <th style={{ padding: "12px", textAlign: "right", fontWeight: "600" }}>
                      Variantes longueur
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {prestations.map((p) => (
                    <tr key={p.id} style={{ borderBottom: "1px solid #e0d5d0" }}>
                      <td style={{ padding: "12px" }}>
                        <strong>{p.nom}</strong>
                      </td>
                      <td style={{ padding: "12px", fontSize: "13px", color: "#666" }}>
                        {p.categorie}
                      </td>
                      <td style={{ padding: "12px", textAlign: "right" }}>
                        <input
                          type="number"
                          defaultValue={(p.prixCentimes / 100).toFixed(2)}
                          onChange={(e) => {
                            const euros = parseFloat(e.target.value);
                            sauvegarderPrix(p.id, "prestation", Math.round(euros * 100), p.prixCentimes);
                          }}
                          disabled={saving === p.id}
                          style={{
                            width: "80px",
                            padding: "6px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                          }}
                        />
                        €
                      </td>
                      <td style={{ padding: "12px" }}>
                        {p.variantesLongueur.length > 0 ? (
                          <div style={{ fontSize: "12px" }}>
                            {p.variantesLongueur.map((v) => (
                              <div key={v.id} style={{ marginBottom: "8px" }}>
                                <label style={{ display: "block", marginBottom: "4px" }}>
                                  {LABEL_LONGUEUR[v.longueur]}:
                                </label>
                                <input
                                  type="number"
                                  defaultValue={(v.prixCentimes / 100).toFixed(2)}
                                  onChange={(e) => {
                                    const euros = parseFloat(e.target.value);
                                    sauvegarderPrix(
                                      v.id,
                                      "prestation-variante",
                                      Math.round(euros * 100)
                                    );
                                  }}
                                  disabled={saving === v.id}
                                  style={{
                                    width: "70px",
                                    padding: "4px",
                                    border: "1px solid #ddd",
                                    borderRadius: "4px",
                                  }}
                                />
                                €
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: "#999" }}>Aucune</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "options" && (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  backgroundColor: "white",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f5f1ed", borderBottom: "2px solid #e0d5d0" }}>
                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>
                      Option
                    </th>
                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>
                      Groupe
                    </th>
                    <th style={{ padding: "12px", textAlign: "right", fontWeight: "600" }}>
                      Prix de base
                    </th>
                    <th style={{ padding: "12px", textAlign: "right", fontWeight: "600" }}>
                      Variantes longueur
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {options.map((o) => (
                    <tr key={o.id} style={{ borderBottom: "1px solid #e0d5d0" }}>
                      <td style={{ padding: "12px" }}>
                        <strong>{o.nom}</strong>
                      </td>
                      <td style={{ padding: "12px", fontSize: "13px", color: "#666" }}>
                        {o.groupe}
                      </td>
                      <td style={{ padding: "12px", textAlign: "right" }}>
                        <input
                          type="number"
                          defaultValue={
                            o.prixCentimes === null ? "" : (o.prixCentimes / 100).toFixed(2)
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            const euros = val === "" ? null : parseFloat(val);
                            sauvegarderPrix(
                              o.id,
                              "option",
                              euros === null ? null : Math.round(euros * 100),
                              o.prixCentimes ?? undefined
                            );
                          }}
                          disabled={saving === o.id}
                          placeholder="Optionnel"
                          style={{
                            width: "80px",
                            padding: "6px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                          }}
                        />
                        €
                      </td>
                      <td style={{ padding: "12px" }}>
                        {o.variantesLongueur.length > 0 ? (
                          <div style={{ fontSize: "12px" }}>
                            {o.variantesLongueur.map((v) => (
                              <div key={v.id} style={{ marginBottom: "8px" }}>
                                <label style={{ display: "block", marginBottom: "4px" }}>
                                  {LABEL_LONGUEUR[v.longueur]}:
                                </label>
                                <input
                                  type="number"
                                  defaultValue={(v.prixCentimes / 100).toFixed(2)}
                                  onChange={(e) => {
                                    const euros = parseFloat(e.target.value);
                                    sauvegarderPrix(
                                      v.id,
                                      "option-variante",
                                      Math.round(euros * 100)
                                    );
                                  }}
                                  disabled={saving === v.id}
                                  style={{
                                    width: "70px",
                                    padding: "4px",
                                    border: "1px solid #ddd",
                                    borderRadius: "4px",
                                  }}
                                />
                                €
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: "#999" }}>Aucune</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "lissage" && (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  backgroundColor: "white",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f5f1ed", borderBottom: "2px solid #e0d5d0" }}>
                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>
                      Longueur
                    </th>
                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>
                      Densité
                    </th>
                    <th style={{ padding: "12px", textAlign: "right", fontWeight: "600" }}>
                      Prix
                    </th>
                    <th style={{ padding: "12px", textAlign: "right", fontWeight: "600" }}>
                      Durée (min)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lissage.map((l) => (
                    <tr key={l.id} style={{ borderBottom: "1px solid #e0d5d0" }}>
                      <td style={{ padding: "12px", fontWeight: "600" }}>
                        {LABEL_LONGUEUR[l.longueur]}
                      </td>
                      <td style={{ padding: "12px" }}>{LABEL_DENSITE[l.densite]}</td>
                      <td style={{ padding: "12px", textAlign: "right" }}>
                        <input
                          type="number"
                          defaultValue={(l.prixCentimes / 100).toFixed(2)}
                          onChange={(e) => {
                            const euros = parseFloat(e.target.value);
                            sauvegarderPrix(l.id, "lissage", Math.round(euros * 100));
                          }}
                          disabled={saving === l.id}
                          style={{
                            width: "80px",
                            padding: "6px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                          }}
                        />
                        €
                      </td>
                      <td style={{ padding: "12px", textAlign: "right", color: "#666" }}>
                        {l.dureeMinutes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
