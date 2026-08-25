"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loginAdminAction, motDePasseOublieAdminAction } from "../actions";

export function LoginForm() {
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isPendingOublie, startTransitionOublie] = useTransition();
  const router = useRouter();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setSucces(null);
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

  function handleMotDePasseOublie() {
    setErreur(null);
    setSucces(null);
    startTransitionOublie(async () => {
      const resultat = await motDePasseOublieAdminAction();
      if (!resultat.ok) {
        setErreur(resultat.error);
      } else {
        setSucces(resultat.message);
      }
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
          className="field mt-1"
        />
      </label>
      {erreur && <p className="text-sm text-rose-700 font-medium">{erreur}</p>}
      {succes && (
        <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
          {succes}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending || isPendingOublie}
        className="w-full rounded-full bg-primary px-6 py-3 text-primary-foreground transition-all duration-300 hover:opacity-90 active:scale-95 disabled:opacity-60 font-medium"
      >
        {isPending ? "Connexion…" : "Se connecter"}
      </button>
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={handleMotDePasseOublie}
          disabled={isPending || isPendingOublie}
          className="text-xs text-muted-foreground hover:text-foreground underline transition-colors disabled:opacity-50"
        >
          {isPendingOublie ? "Envoi du mot de passe en cours..." : "Mot de passe oublié ?"}
        </button>
      </div>
    </form>
  );
}
