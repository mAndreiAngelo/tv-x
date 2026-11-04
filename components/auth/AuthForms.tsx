"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  loginAction,
  registerAction,
  requestPasswordResetAction,
  resetPasswordAction,
  type FormState,
} from "@/app/autentificare/actions";
import { FormField, FormMessage, SubmitButton } from "@/components/ui/FormField";

const initial: FormState = {};

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(loginAction, initial);
  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next} />
      {state.error && <FormMessage type="error">{state.error}</FormMessage>}
      <FormField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
        error={state.fields?.email}
      />
      <FormField
        label="Parolă"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        error={state.fields?.password}
      />
      <div className="text-right text-sm">
        <Link href="/autentificare/resetare" className="font-medium text-accent-600 hover:underline">
          Ai uitat parola?
        </Link>
      </div>
      <SubmitButton pending={pending}>Intră în cont</SubmitButton>
    </form>
  );
}

export function RegisterForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(registerAction, initial);
  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next} />
      {state.error && <FormMessage type="error">{state.error}</FormMessage>}
      <FormField
        label="Nume complet"
        name="name"
        autoComplete="name"
        required
        defaultValue={state.values?.name}
        error={state.fields?.name}
      />
      <FormField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
        error={state.fields?.email}
      />
      <FormField
        label="Parolă"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        hint="Minimum 8 caractere, cel puțin o literă și o cifră."
        error={state.fields?.password}
      />
      <FormField
        label="Confirmă parola"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        error={state.fields?.confirmPassword}
      />
      <SubmitButton pending={pending}>Creează contul</SubmitButton>
    </form>
  );
}

export function ResetRequestForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, initial);
  if (state.success) return <FormMessage type="success">{state.success}</FormMessage>;
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
        error={state.fields?.email}
      />
      <SubmitButton pending={pending}>Trimite linkul de resetare</SubmitButton>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, initial);
  if (state.success) {
    return (
      <div className="space-y-4">
        <FormMessage type="success">{state.success}</FormMessage>
        <Link
          href="/autentificare"
          className="block rounded-lg bg-accent-600 px-4 py-3 text-center font-semibold text-white hover:bg-accent-700"
        >
          Mergi la autentificare
        </Link>
      </div>
    );
  }
  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="token" value={token} />
      {state.error && <FormMessage type="error">{state.error}</FormMessage>}
      <FormField
        label="Parola nouă"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        hint="Minimum 8 caractere, cel puțin o literă și o cifră."
        error={state.fields?.password}
      />
      <FormField
        label="Confirmă parola nouă"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        error={state.fields?.confirmPassword}
      />
      <SubmitButton pending={pending}>Salvează parola</SubmitButton>
    </form>
  );
}
