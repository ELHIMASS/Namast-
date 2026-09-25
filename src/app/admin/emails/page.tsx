"use client";

import { useState, useEffect, useTransition } from "react";
import { getClientsAction } from "@/app/admin/clients/actions";
import { envoyerEmailAdminAction } from "./actions";
import { useRouter } from "next/navigation";

export default function EmailsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  
  const [typeDest, setTypeDest] = useState<"ALL" | "SELECTION">("SELECTION");
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  
  const [sujet, setSujet] = useState("");
  const [contenu, setContenu] = useState("");
  
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    getClientsAction()
      .then((data) => setClients(data.filter(c => c.email)))
      .catch(console.error)
      .finally(() => setLoadingClients(false));
  }, []);

  const SUGGESTIONS = [
    "Fermeture exceptionnelle du salon",
    "Découvrez nos nouveaux tarifs",
    "Nouveau soin disponible !",
    "Rappel : Pensez à réserver votre prochain rendez-vous",
  ];

  function toggleClient(id: string) {
    setSelectedClients((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    if (typeDest === "SELECTION" && selectedClients.length === 0) {
      setFeedback({ ok: false, msg: "Veuillez sélectionner au moins un client." });
      return;
    }
    if (!sujet.trim()) {
      setFeedback({ ok: false, msg: "Le sujet de l'e-mail est obligatoire." });
      return;
    }
    if (!contenu.trim()) {
      setFeedback({ ok: false, msg: "Le corps de l'e-mail ne peut pas être vide." });
      return;
    }

    startTransition(async () => {
      const res = await envoyerEmailAdminAction({
        destinataires: typeDest === "ALL" ? "ALL" : selectedClients,
        sujet,
        contenuHtml: contenu,
      });

      if (res.ok) {
        setFeedback({ ok: true, msg: `E-mail envoyé avec succès à ${res.count} client(s).` });
        setSujet("");
        setContenu("");
        setSelectedClients([]);
      } else {
        setFeedback({ ok: false, msg: res.error || "Erreur lors de l'envoi." });
      }
    });
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Envoyer un E-mail
        </h1>
        <p className="mt-2 text-muted-foreground">
          Communiquez avec vos clients rapidement (le mail commencera automatiquement par "Bonjour Prénom,").
        </p>
      </div>

      <div className="glass rounded-3xl border border-white/60 p-6 shadow-sm">
        <form onSubmit={handleSend} className="space-y-6">
          
          {/* CHOIX DES DESTINATAIRES */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground">Destinataires</label>
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex items-center gap-2 p-4 border rounded-xl cursor-pointer hover:bg-white/50 transition-colors flex-1">
                <input
                  type="radio"
                  checked={typeDest === "SELECTION"}
                  onChange={() => setTypeDest("SELECTION")}
                  className="w-4 h-4 text-primary"
                />
                <span className="font-medium text-sm">Clients spécifiques</span>
              </label>
              <label className="flex items-center gap-2 p-4 border rounded-xl cursor-pointer hover:bg-white/50 transition-colors flex-1">
                <input
                  type="radio"
                  checked={typeDest === "ALL"}
                  onChange={() => setTypeDest("ALL")}
                  className="w-4 h-4 text-primary"
                />
                <span className="font-medium text-sm">Tous les clients ({clients.length})</span>
              </label>
            </div>
            
            {typeDest === "SELECTION" && (
              <div className="mt-4 border rounded-xl p-4 bg-white/40 max-h-60 overflow-y-auto">
                {loadingClients ? (
                  <p className="text-sm text-muted-foreground">Chargement des clients...</p>
                ) : clients.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun client avec email trouvé.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {clients.map(c => (
                      <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer p-1.5 hover:bg-white/60 rounded">
                        <input
                          type="checkbox"
                          checked={selectedClients.includes(c.id)}
                          onChange={() => toggleClient(c.id)}
                          className="rounded text-primary"
                        />
                        {c.prenom} {c.nom} <span className="text-muted-foreground text-xs">({c.email})</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <hr className="border-border/50" />

          {/* SUJET DE L'EMAIL */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground">Sujet de l'e-mail</label>
            
            <div className="flex flex-wrap gap-2 mb-2">
              {SUGGESTIONS.map(sugg => (
                <button
                  key={sugg}
                  type="button"
                  onClick={() => setSujet(sugg)}
                  className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
                >
                  {sugg}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={sujet}
              onChange={(e) => setSujet(e.target.value)}
              placeholder="Ex: Fermeture exceptionnelle vendredi"
              className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background"
            />
          </div>

          {/* CORPS DE L'EMAIL */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground">Message</label>
            <textarea
              value={contenu}
              onChange={(e) => setContenu(e.target.value)}
              rows={8}
              placeholder="Rédigez votre message ici..."
              className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Les retours à la ligne seront conservés. L'email inclura automatiquement la formule de politesse au début et à la fin.
            </p>
          </div>

          {feedback && (
            <div className={`p-4 rounded-xl text-sm ${feedback.ok ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700'}`}>
              {feedback.msg}
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
            >
              {isPending ? "Envoi en cours..." : "Envoyer l'e-mail"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
