"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { updatePasswordAction } from "@/lib/auth/actions";
import {
  MIN_PASSWORD_LENGTH,
  type PasswordFormState,
} from "@/lib/auth/password";

const initialState: PasswordFormState = {};

export function ChangePasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    updatePasswordAction,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          minLength={MIN_PASSWORD_LENGTH}
          required
          autoComplete="new-password"
          disabled={pending}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm_password">Confirm new password</Label>
        <Input
          id="confirm_password"
          name="confirm_password"
          type="password"
          minLength={MIN_PASSWORD_LENGTH}
          required
          autoComplete="new-password"
          disabled={pending}
        />
      </div>
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-af-cyan">Password updated successfully.</p>
      )}
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? "Updating…" : "Change password"}
      </Button>
    </form>
  );
}
