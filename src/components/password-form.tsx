"use client";

import { useActionState } from "react";
import { updatePasswordAction, type ActionState } from "@/lib/actions/auth";
import { Field, FormStatus, btnClass, inputClass } from "@/components/form-ui";

export function PasswordForm() {
  const [state, action, pending] = useActionState(
    updatePasswordAction,
    {} as ActionState,
  );
  return (
    <form action={action} className="max-w-md space-y-4">
      <FormStatus state={state} />
      <Field label="Current password">
        <input
          className={inputClass}
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>
      <Field label="New password">
        <input
          className={inputClass}
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </Field>
      <Field label="Confirm new password">
        <input
          className={inputClass}
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </Field>
      <button className={btnClass} disabled={pending}>
        {pending ? "Saving…" : "Update password"}
      </button>
    </form>
  );
}
