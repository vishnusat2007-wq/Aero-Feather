"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

type Props = {
  next?: string;
  defaultMode?: "login" | "signup";
};

export function LoginForm({ next = "/account", defaultMode = "login" }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const supabase = createClient();

    if (mode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (data.session && data.user) {
        await fetch("/api/auth/setup-profile", { method: "POST" });
        router.push(next);
        router.refresh();
        return;
      }

      setMessage(
        "Account created. Check your email to confirm your address, then sign in.",
      );
      setLoading(false);
      setMode("login");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    await fetch("/api/auth/setup-profile", { method: "POST" });

    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === "signup" && (
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoComplete="name"
          />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {message && <p className="text-sm text-af-cyan">{message}</p>}
      <Button type="submit" variant="primary" className="w-full" disabled={loading}>
        {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
      </Button>
      <button
        type="button"
        className="w-full text-sm text-af-muted transition-colors hover:text-af-cyan"
        onClick={() => {
          setMode(mode === "login" ? "signup" : "login");
          setError(null);
          setMessage(null);
        }}
      >
        {mode === "login"
          ? "New customer? Create an account"
          : "Already have an account? Sign in"}
      </button>
    </form>
  );
}
