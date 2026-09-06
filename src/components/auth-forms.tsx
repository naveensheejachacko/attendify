"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, registerAction, type ActionState } from "@/lib/actions/auth";
import { Field, FormStatus, btnClass, inputClass } from "@/components/form-ui";

const initial: ActionState = {};

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initial);
  return (
    <form action={action} className="space-y-4">
      <FormStatus state={state} />
      <Field label="Full name">
        <input className={inputClass} name="name" autoComplete="name" required minLength={2} />
      </Field>
      <Field label="College email">
        <input
          className={inputClass}
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </Field>
      <Field label="Password">
        <input
          className={inputClass}
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </Field>
      <button className={btnClass} disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </button>
      <p className="text-center text-sm text-ink/60">
        Already have an account?{" "}
        <Link className="font-medium text-mark" href="/login">
          Log in
        </Link>
      </p>
    </form>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initial);
  return (
    <form action={action} className="space-y-4">
      <FormStatus state={state} />
      <Field label="Email">
        <input
          className={inputClass}
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </Field>
      <Field label="Password">
        <input
          className={inputClass}
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>
      <button className={btnClass} disabled={pending}>
        {pending ? "Signing in…" : "Log in"}
      </button>
      <p className="text-center text-sm text-ink/60">
        New faculty?{" "}
        <Link className="font-medium text-mark" href="/register">
          Create account
        </Link>
      </p>
    </form>
  );
}
