"use client";

import { useState, useEffect } from "react";
import {
  getClientsAction,
  ajouterClientAction,
  modifierClientAction,
  supprimerClientAction,
} from "./actions";

type Client = {
  id: string;
  nom: string;
  prenom: string;
  telephone: string | null;
  email: string;
  commentConnue: string | null;
};

export default function PageClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
    commentConnue: "",
  });

  // Charger la liste des clients
  useEffect(() => {
    chargerClients();
  }, []);

  async function chargerClients() {
    try {
      const data = await getClientsAction();
      setClients(data);
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors du chargement des clients." });
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({ nom: "", prenom: "", telephone: "", email: "", commentConnue: "" });
    setEditingId(null);
    setShowForm(false);
  }

  function editerClient(client: Client) {
    setFormData({
      nom: client.nom,
      prenom: client.prenom,
      telephone: client.telephone || "",
      email: client.email,
      commentConnue: client.commentConnue || "",
    });
    setEditingId(client.id);
    setShowForm(true);
  }

  async function sauvegarder() {
    if (!formData.nom.trim() || !formData.prenom.trim() || !formData.email.trim()) {
      setMessage({ type: "error", text: "Nom, prénom et email sont obligatoires." });
      return;
    }

    try {
      let result;
      if (editingId) {
        result = await modifierClientAction({
          id: editingId,
          ...formData,
        });
      } else {
        result = await ajouterClientAction(formData);
      }

      if (result.ok) {
        setMessage({
          type: "success",
          text: editingId ? "Client modifié avec succès." : "Client ajouté avec succès.",
        });
        resetForm();
        chargerClients();
      } else {
        setMessage({ type: "error", text: result.error || "Erreur inconnue." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors de l'opération." });
    }
  }

  async function suppimer(id: string) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) return;

    try {
      const result = await supprimerClientAction(id);
      if (result.ok) {
        setMessage({ type: "success", text: "Client supprimé avec succès." });
        chargerClients();
      } else {
        setMessage({ type: "error", text: result.error || "Erreur inconnue." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors de la suppression." });
    }
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Gestion des Clients</h1>

      {message && (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: "20px",
            borderRadius: "6px",
            backgroundColor: message.type === "success" ? "#e8f5e9" : "#ffebee",
            color: message.type === "success" ? "#2e7d32" : "#c62828",
            border: `1px solid ${message.type === "success" ? "#c8e6c9" : "#ffcdd2"}`,
          }}
        >
          {message.text}
        </div>
      )}

      <button
        onClick={() => (showForm ? resetForm() : setShowForm(true))}
        style={{
          padding: "10px 16px",
          marginBottom: "20px",
          backgroundColor: showForm ? "#f44336" : "#d4a574",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "600",
        }}
      >
        {showForm ? "Annuler" : "+ Ajouter un client"}
      </button>

      {showForm && (
        <div
          style={{
            padding: "20px",
            marginBottom: "30px",
            backgroundColor: "#f9f7f5",
            borderRadius: "8px",
            border: "1px solid #e0d5d0",
          }}
        >
          <h2>{editingId ? "Modifier le client" : "Ajouter un nouveau client"}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <input
              type="text"
              placeholder="Prénom"
              value={formData.prenom}
              onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
            <input
              type="text"
              placeholder="Nom"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
            <input
              type="tel"
              placeholder="Téléphone"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
            <input
              type="text"
              placeholder="Comment nous a-t-elle connus ? (optionnel)"
              value={formData.commentConnue}
              onChange={(e) => setFormData({ ...formData, commentConnue: e.target.value })}
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                gridColumn: "1 / -1",
              }}
            />
          </div>
          <button
            onClick={sauvegarder}
            style={{
              marginTop: "16px",
              padding: "10px 20px",
              backgroundColor: "#d4a574",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            {editingId ? "Modifier" : "Ajouter"}
          </button>
        </div>
      )}

      {loading ? (
        <p>Chargement des clients...</p>
      ) : (
        <>
          <p style={{ marginBottom: "16px", color: "#666" }}>
            Total: <strong>{clients.length}</strong> client{clients.length > 1 ? "s" : ""}
          </p>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                backgroundColor: "white",
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f5f1ed", borderBottom: "2px solid #e0d5d0" }}>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Prénom</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Nom</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Email</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Téléphone</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Comment</th>
                  <th style={{ padding: "12px", textAlign: "center", fontWeight: "600" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} style={{ borderBottom: "1px solid #e0d5d0" }}>
                    <td style={{ padding: "12px" }}>{client.prenom}</td>
                    <td style={{ padding: "12px" }}>{client.nom}</td>
                    <td style={{ padding: "12px", fontSize: "13px", color: "#666" }}>
                      {client.email}
                    </td>
                    <td style={{ padding: "12px", fontSize: "13px", color: "#666" }}>
                      {client.telephone || "—"}
                    </td>
                    <td style={{ padding: "12px", fontSize: "13px", color: "#999" }}>
                      {client.commentConnue ? client.commentConnue.substring(0, 20) + "..." : "—"}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <button
                        onClick={() => editerClient(client)}
                        style={{
                          marginRight: "8px",
                          padding: "6px 12px",
                          backgroundColor: "#2196F3",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => suppimer(client.id)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#f44336",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {clients.length === 0 && <p style={{ marginTop: "20px", color: "#999" }}>Aucun client enregistré.</p>}
        </>
      )}
    </div>
  );
}
