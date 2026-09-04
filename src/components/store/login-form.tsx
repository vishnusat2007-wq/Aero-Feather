"use client";

import { useActionState, useState } from "react";
import { authenticateAction, type AuthFormState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

type Props = {
  next?: string;
  defaultMode?: "login" | "signup";
  allowSignup?: boolean;
};

const initialState: AuthFormState = {};

export function LoginForm({
  next = "/account",
  defaultMode = "login",
  allowSignup = true,
}: Props) {
  const [mode, setMode] = useState<"login" | "signup">(defaultMode);
  const [state, formAction, pending] = useActionState(
    authenticateAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="next" value={next} />
      {mode === "signup" && (
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            name="fullName"
            autoComplete="name"
            placeholder="Your name"
            className="border-af-cyan/35 bg-af-bg"
          />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="border-af-cyan/35 bg-af-bg"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          minLength={6}
          required
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          placeholder="At least 6 characters"
          className="border-af-cyan/35 bg-af-bg"
        />
      </div>
      {state.error && (
        <p className="text-sm text-red-400" role="alert">
          {state.error}
        </p>
      )}
      {state.message && (
        <p className="text-sm text-af-cyan" role="status">
          {state.message}
        </p>
      )}
      <Button
        type="submit"
        variant="primary"
        className="w-full text-[#060b18]"
        disabled={pending}
      >
        {pending
          ? "Please wait…"
          : mode === "login"
            ? "Sign in"
            : "Create account"}
      </Button>
      {allowSignup && (
        <button
          type="button"
          className="w-full text-sm text-af-muted transition-colors hover:text-af-cyan"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login"
            ? "New customer? Create an account"
            : "Already have an account? Sign in"}
        </button>
      )}
    </form>
  );
}
