import * as React from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Loader2, LockKeyhole, Mail, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { isSupabaseConfigured } from "@/lib/supabase";

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [, navigate] = useLocation();
  const [mode, setMode] = React.useState<"login" | "signup">("login");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [pending, setPending] = React.useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setPending(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
        navigate("/dashboard");
      } else {
        const result = await signUp(email, password, fullName);
        if (result.needsEmailConfirmation) {
          setMessage("Inscription réussie. Vérifiez votre adresse email avant de vous connecter.");
          setMode("login");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Une erreur est survenue.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="space-y-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Retour à l'accueil
          </Link>
          <div>
            <CardTitle className="text-2xl">{mode === "login" ? "Connexion" : "Créer un compte"}</CardTitle>
            <CardDescription className="mt-2">
              {mode === "login" ? "Accédez à votre espace affilié." : "Rejoignez Ecom Land et commencez à vendre."}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {!isSupabaseConfigured && (
            <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              Supabase n'est pas configuré. Ajoutez les variables VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY.
            </div>
          )}
          {error && <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
          {message && <div className="mb-4 rounded-md border border-primary/40 bg-primary/10 p-3 text-sm text-primary">{message}</div>}
          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div className="relative">
                <UserRound className="absolute start-3 top-3 size-4 text-muted-foreground" />
                <Input value={fullName} onChange={(event) => setFullName(event.target.value)} className="ps-9" placeholder="Nom complet" required />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute start-3 top-3 size-4 text-muted-foreground" />
              <Input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="ps-9" placeholder="Email" required />
            </div>
            <div className="relative">
              <LockKeyhole className="absolute start-3 top-3 size-4 text-muted-foreground" />
              <Input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} className="ps-9" placeholder="Mot de passe" minLength={6} required />
            </div>
            <Button type="submit" className="w-full" disabled={pending || !isSupabaseConfigured}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              {mode === "login" ? "Se connecter" : "S'inscrire"}
            </Button>
          </form>
          <button
            type="button"
            className="mt-5 w-full text-sm text-muted-foreground hover:text-primary"
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setMessage(""); }}
          >
            {mode === "login" ? "Vous n'avez pas de compte ? Créer un compte" : "Vous avez déjà un compte ? Se connecter"}
          </button>
        </CardContent>
      </Card>
    </main>
  );
}