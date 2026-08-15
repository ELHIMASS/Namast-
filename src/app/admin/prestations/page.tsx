"use client";

import { useState } from "react";
import { ajouterPrestationsBelmakosmetik } from "./actions";

export default function PagePrestations() {
  const [status, setStatus] = useState<{ type: "success" | "error" | "idle"; message: string }>({
    type: "idle",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  async function handleAjouter() {
    setLoading(true);
    const result = await ajouterPrestationsBelmakosmetik();
    setStatus({
      type: result.ok ? "success" : "error",
      message: (result as any).message || (result as any).error || "Opération effectuée",
    });
    setLoading(false);
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Gestion des Prestations</h1>

      <div
        style={{
          padding: "20px",
          backgroundColor: "#f9f7f5",
          borderRadius: "8px",
          border: "1px solid #e0d5d0",
          marginBottom: "20px",
        }}
      >
        <h2>Ajouter les prestations Belmakosmetik</h2>
        <p style={{ color: "#666", marginBottom: "16px" }}>
          Ajoute automatiquement:
        </p>
        <ul style={{ marginBottom: "16px", paddingLeft: "20px" }}>
          <li>Shampooing adapté Belmakosmetik (15€, 10 min)</li>
          <li>Soin profond Belmakosmetik (30€, 15 min)</li>
        </ul>

        <button
          onClick={handleAjouter}
          disabled={loading}
          style={{
            padding: "10px 20px",
            backgroundColor: loading ? "#ccc" : "#d4a574",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: "600",
          }}
        >
          {loading ? "Ajout en cours..." : "+ Ajouter les prestations"}
        </button>
      </div>

      {status.type !== "idle" && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "6px",
            backgroundColor: status.type === "success" ? "#e8f5e9" : "#ffebee",
            color: status.type === "success" ? "#2e7d32" : "#c62828",
            border: `1px solid ${status.type === "success" ? "#c8e6c9" : "#ffcdd2"}`,
          }}
        >
          {status.message}
        </div>
      )}
    </div>
  );
}
