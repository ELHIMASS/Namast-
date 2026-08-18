import Link from "next/link";
import { logoutAdminAction } from "./actions";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white/50 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div>
              <p className="font-serif text-lg font-bold text-foreground">Namasté</p>
              <p className="text-xs text-muted-foreground">Espace pro</p>
            </div>
          </Link>
          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-all duration-300 hover:border-primary hover:text-foreground active:scale-95"
            >
              Se déconnecter
            </button>
          </form>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b border-border bg-white/30 backdrop-blur">
        <div className="mx-auto flex max-w-7xl px-6">
          <Link
            href="/admin"
            className="border-b-2 border-transparent px-6 py-4 text-sm font-medium text-foreground transition-all duration-300 hover:border-primary hover:text-primary"
          >
            📊 Tableau de bord
          </Link>
          <Link
            href="/admin/clients"
            className="border-b-2 border-transparent px-6 py-4 text-sm font-medium text-foreground transition-all duration-300 hover:border-primary hover:text-primary"
          >
            👥 Clients
          </Link>
          <Link
            href="/admin/tarifs"
            className="border-b-2 border-transparent px-6 py-4 text-sm font-medium text-foreground transition-all duration-300 hover:border-primary hover:text-primary"
          >
            💰 Tarifs
          </Link>
          <Link
            href="/admin/prestations"
            className="border-b-2 border-transparent px-6 py-4 text-sm font-medium text-foreground transition-all duration-300 hover:border-primary hover:text-primary"
          >
            ✂️ Prestations
          </Link>
          <Link
            href="/admin/fermetures"
            className="border-b-2 border-transparent px-6 py-4 text-sm font-medium text-foreground transition-all duration-300 hover:border-primary hover:text-primary"
          >
            📅 Fermetures
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 bg-gradient-to-b from-white/50 to-white/30">
        <div className="mx-auto max-w-7xl px-6 py-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-white/30 py-6 text-center text-sm text-muted-foreground backdrop-blur">
        <p>© 2026 Namasté - Espace administrateur</p>
      </footer>
    </div>
  );
}
