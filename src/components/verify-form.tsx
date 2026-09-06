"use client";

import { useActionState } from "react";
import { resendOtpAction, verifyEmailAction, type ActionState } from "@/lib/actions/auth";
import { Field, FormStatus, btnClass, inputClass } from "@/components/form-ui";

export function VerifyForm({
  email,
  previewCode,
}: {
  email: string;
  previewCode?: string;
}) {
  const [state, action, pending] = useActionState(verifyEmailAction, {} as ActionState);
  const [resendState, resend, resending] = useActionState(
    resendOtpAction,
    {} as ActionState,
  );
  const hint = state.previewCode ?? resendState.previewCode ?? previewCode;

  return (
    <div className="space-y-4">
      <form action={action} className="space-y-4">
        <FormStatus state={state} />
        <input type="hidden" name="email" value={email} />
        <Field label="6-digit code">
          <input
            className={`${inputClass} tracking-[0.4em]`}
            name="code"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            required
          />
        </Field>
        <button className={btnClass} disabled={pending}>
          {pending ? "Verifying…" : "Confirm email"}
        </button>
      </form>
      <form action={resend}>
        <input type="hidden" name="email" value={email} />
        <button
          className="w-full text-sm font-medium text-mark"
          disabled={resending}
        >
          {resending ? "Sending…" : "Resend code"}
        </button>
        <FormStatus state={resendState} />
      </form>
      {hint ? (
        <p className="rounded-lg bg-mark/10 px-3 py-2 text-sm text-ink">
          Dev mode: code is <strong>{hint}</strong> (no email provider configured).
        </p>
      ) : null}
    </div>
  );
}
