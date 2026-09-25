"use client";

import { useEffect, useState } from "react";
import { getHistoriqueAction } from "./actions";

type ActionLog = {
  id: string;
  entite: "CLIENT" | "RENDEZVOUS" | "PRESTATION" | "AUTRE";
  action: "CREATE" | "UPDATE" | "DELETE";
  details: string;
  createdAt: Date;
};

export default function NotificationsPage() {
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistoriqueAction(100)
      .then((data) => {
        // Prisma renvoie des objets Date ou string selon la version, on force le cast si besoin
        setLogs(data as any);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function getBadgeColor(action: string) {
    if (action === "CREATE") return "bg-green-500/10 text-green-700 border-green-500/20";
    if (action === "UPDATE") return "bg-blue-500/10 text-blue-700 border-blue-500/20";
    if (action === "DELETE") return "bg-red-500/10 text-red-700 border-red-500/20";
    return "bg-gray-500/10 text-gray-700 border-gray-500/20";
  }

  function getActionLabel(action: string) {
    if (action === "CREATE") return "Création";
    if (action === "UPDATE") return "Modification";
    if (action === "DELETE") return "Suppression";
    return action;
  }

  function getEntiteLabel(entite: string) {
    if (entite === "CLIENT") return "Client";
    if (entite === "RENDEZVOUS") return "Rendez-vous";
    if (entite === "PRESTATION") return "Prestation";
    return "Autre";
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Historique d'Activité
        </h1>
        <p className="mt-2 text-muted-foreground">
          Journal des 100 dernières actions effectuées (clients, rendez-vous, prestations).
        </p>
      </div>

      <div className="glass rounded-3xl border border-white/60 p-6 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-muted-foreground">
            Chargement de l'historique...
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            Aucun historique enregistré pour le moment.
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-border/40 bg-white/40 transition-colors hover:bg-white/60"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded-md border ${getBadgeColor(
                        log.action
                      )}`}
                    >
                      {getActionLabel(log.action)}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {getEntiteLabel(log.entite)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {log.details}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground shrink-0 sm:text-right">
                  {new Date(log.createdAt).toLocaleString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
