import type { ActionState } from "@/lib/actions/auth";

export function FormStatus({ state }: { state: ActionState }) {
  if (state.error) {
    return (
      <p className="rounded-lg border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral">
        {state.error}
      </p>
    );
  }
  if (state.message) {
    return (
      <p className="rounded-lg border border-ink/10 bg-ink/5 px-3 py-2 text-sm text-ink">
        {state.message}
      </p>
    );
  }
  return null;
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-[0.14em] text-ink/60">
        {label}
      </span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-ink/15 bg-paper px-3 py-2.5 text-sm text-ink outline-none ring-mark/0 transition focus:border-mark focus:ring-4 focus:ring-mark/15";

export const btnClass =
  "inline-flex w-full items-center justify-center rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-paper transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60";
