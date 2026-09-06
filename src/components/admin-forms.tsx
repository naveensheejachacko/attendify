"use client";

import { useActionState } from "react";
import {
  addStudentAction,
  assignTeacherAction,
  bulkAddStudentsAction,
  createClassAction,
  createSubjectAction,
} from "@/lib/actions/admin";
import type { ActionState } from "@/lib/actions/auth";
import { Field, FormStatus, btnClass, inputClass } from "@/components/form-ui";

type Option = { id: string; label: string };

export function CreateClassForm({ teachers }: { teachers: Option[] }) {
  const [state, action, pending] = useActionState(createClassAction, {} as ActionState);
  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <FormStatus state={state} />
      </div>
      <Field label="Display name">
        <input className={inputClass} name="name" placeholder="CSE 2024 A — S5" required />
      </Field>
      <Field label="Program">
        <input className={inputClass} name="program" placeholder="B.Tech Computer Science" required />
      </Field>
      <Field label="Section">
        <input className={inputClass} name="section" placeholder="A" required />
      </Field>
      <Field label="Batch year">
        <input className={inputClass} name="batchYear" type="number" defaultValue={2024} required />
      </Field>
      <Field label="Semester">
        <input className={inputClass} name="semester" type="number" defaultValue={1} min={1} max={12} required />
      </Field>
      <Field label="Class teacher">
        <select className={inputClass} name="classTeacherId" defaultValue="">
          <option value="">Unassigned</option>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.label}
            </option>
          ))}
        </select>
      </Field>
      <div className="md:col-span-2">
        <button className={`${btnClass} md:w-auto`} disabled={pending}>
          {pending ? "Saving…" : "Create class"}
        </button>
      </div>
    </form>
  );
}

export function CreateSubjectForm() {
  const [state, action, pending] = useActionState(createSubjectAction, {} as ActionState);
  return (
    <form action={action} className="grid gap-4 md:grid-cols-3">
      <div className="md:col-span-3">
        <FormStatus state={state} />
      </div>
      <Field label="Code">
        <input className={inputClass} name="code" placeholder="CS301" required />
      </Field>
      <Field label="Name">
        <input className={inputClass} name="name" placeholder="Database Systems" required />
      </Field>
      <div className="flex items-end">
        <button className={btnClass} disabled={pending}>
          {pending ? "Saving…" : "Add subject"}
        </button>
      </div>
    </form>
  );
}

export function AssignForm({
  classes,
  subjects,
  teachers,
}: {
  classes: Option[];
  subjects: Option[];
  teachers: Option[];
}) {
  const [state, action, pending] = useActionState(assignTeacherAction, {} as ActionState);
  return (
    <form action={action} className="grid gap-4 md:grid-cols-4">
      <div className="md:col-span-4">
        <FormStatus state={state} />
      </div>
      <Field label="Class">
        <select className={inputClass} name="classId" required>
          {classes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Subject">
        <select className={inputClass} name="subjectId" required>
          {subjects.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Subject teacher">
        <select className={inputClass} name="teacherId" required>
          {teachers.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </Field>
      <div className="flex items-end">
        <button className={btnClass} disabled={pending}>
          {pending ? "Saving…" : "Assign"}
        </button>
      </div>
    </form>
  );
}

export function StudentForms({ classes }: { classes: Option[] }) {
  const [one, addOne, adding] = useActionState(addStudentAction, {} as ActionState);
  const [bulk, addBulk, importing] = useActionState(
    bulkAddStudentsAction,
    {} as ActionState,
  );
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form action={addOne} className="space-y-4">
        <h2 className="font-serif text-lg">Add one student</h2>
        <FormStatus state={one} />
        <Field label="Class">
          <select className={inputClass} name="classId" required>
            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Roll number">
          <input className={inputClass} name="rollNumber" required />
        </Field>
        <Field label="Name">
          <input className={inputClass} name="name" required />
        </Field>
        <button className={btnClass} disabled={adding}>
          {adding ? "Saving…" : "Add student"}
        </button>
      </form>
      <form action={addBulk} className="space-y-4">
        <h2 className="font-serif text-lg">Bulk import</h2>
        <p className="text-sm text-ink/60">One student per line: roll, name</p>
        <FormStatus state={bulk} />
        <Field label="Class">
          <select className={inputClass} name="classId" required>
            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Rows">
          <textarea
            className={`${inputClass} min-h-40 font-mono`}
            name="rows"
            placeholder={"21CS001, Ada Lovelace\n21CS002, Alan Turing"}
            required
          />
        </Field>
        <button className={btnClass} disabled={importing}>
          {importing ? "Importing…" : "Import students"}
        </button>
      </form>
    </div>
  );
}
