"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loginAdminAction } from "../actions";

export function LoginForm() {
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    startTransition(async () => {
      const resultat = await loginAdminAction(motDePasse);
      if (!resultat.ok) {
        setErreur(resultat.error);
        return;
      }
      router.push("/admin");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block text-sm text-foreground">
        Mot de passe
        <input
          type="password"
          required
          autoFocus
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          className="field"
        />
      </label>
      {erreur && <p className="text-sm text-rose-700">{erreur}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-primary px-6 py-3 text-primary-foreground transition-all duration-300 hover:opacity-90 active:scale-95 disabled:opacity-60"
      >
        {isPending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
