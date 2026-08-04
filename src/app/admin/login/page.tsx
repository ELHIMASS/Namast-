import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LoginForm } from "./LoginForm";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-6 py-20">
        <div className="glass w-full max-w-sm rounded-3xl border border-white/50 p-8">
          <h1 className="font-serif text-2xl text-foreground">Espace pro</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Réservé à la gérante — gestion des demandes et du planning.
          </p>
          <div className="mt-6">
            <LoginForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
