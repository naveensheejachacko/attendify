"use client";

import { useActionState, useMemo, useState } from "react";
import { saveAttendanceAction } from "@/lib/actions/attendance";
import type { ActionState } from "@/lib/actions/auth";
import { AttendanceStatus } from "@/lib/roles";
import { FormStatus, btnClass, inputClass } from "@/components/form-ui";

type Student = { id: string; rollNumber: string; name: string };

const OPTIONS: { value: string; label: string }[] = [
  { value: AttendanceStatus.PRESENT, label: "P" },
  { value: AttendanceStatus.ABSENT, label: "A" },
  { value: AttendanceStatus.LATE, label: "L" },
  { value: AttendanceStatus.OD, label: "OD" },
];

export function MarkAttendanceForm({
  classSubjectId,
  students,
  initialMarks,
  defaultDate,
}: {
  classSubjectId: string;
  students: Student[];
  initialMarks: Record<string, string>;
  defaultDate: string;
}) {
  const [marks, setMarks] = useState<Record<string, string>>(initialMarks);
  const [state, action, pending] = useActionState(
    saveAttendanceAction,
    {} as ActionState,
  );

  const presentCount = useMemo(
    () =>
      students.filter((student) => marks[student.id] === AttendanceStatus.PRESENT)
        .length,
    [marks, students],
  );

  function setAll(status: string) {
    setMarks(Object.fromEntries(students.map((student) => [student.id, status])));
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="classSubjectId" value={classSubjectId} />
      {students.map((student) => (
        <input
          key={student.id}
          type="hidden"
          name={`status-${student.id}`}
          value={marks[student.id] ?? AttendanceStatus.ABSENT}
        />
      ))}
      <FormStatus state={state} />
      <div className="flex flex-wrap items-end gap-4">
        <label className="space-y-1.5">
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-ink/60">
            Date
          </span>
          <input className={inputClass} type="date" name="date" defaultValue={defaultDate} required />
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-ink/60">
            Hour
          </span>
          <select className={inputClass} name="period" defaultValue="1">
            {Array.from({ length: 8 }, (_, i) => i + 1).map((hour) => (
              <option key={hour} value={hour}>
                Hour {hour}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-full border border-ink/15 px-3 py-2 text-xs"
            onClick={() => setAll(AttendanceStatus.PRESENT)}
          >
            All present
          </button>
          <button
            type="button"
            className="rounded-full border border-ink/15 px-3 py-2 text-xs"
            onClick={() => setAll(AttendanceStatus.ABSENT)}
          >
            All absent
          </button>
        </div>
        <p className="ml-auto text-sm text-ink/60">
          {presentCount}/{students.length} present
        </p>
      </div>
      <ul className="divide-y divide-ink/10 overflow-hidden rounded-2xl border border-ink/10 bg-white">
        {students.map((student) => (
          <li key={student.id} className="flex items-center gap-3 px-4 py-3">
            <div className="w-20 font-mono text-xs text-ink/50">{student.rollNumber}</div>
            <div className="flex-1 text-sm">{student.name}</div>
            <div className="flex gap-1">
              {OPTIONS.map((option) => {
                const selected = (marks[student.id] ?? AttendanceStatus.ABSENT) === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setMarks((current) => ({ ...current, [student.id]: option.value }))
                    }
                    className={`h-9 min-w-9 rounded-lg border text-xs font-semibold ${
                      selected
                        ? option.value === AttendanceStatus.PRESENT
                          ? "border-mark bg-mark text-paper"
                          : option.value === AttendanceStatus.ABSENT
                            ? "border-coral bg-coral text-paper"
                            : "border-ink bg-ink text-paper"
                        : "border-ink/15 text-ink/70"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
      <button className={`${btnClass} md:w-auto`} disabled={pending}>
        {pending ? "Saving…" : "Save attendance"}
      </button>
    </form>
  );
}
