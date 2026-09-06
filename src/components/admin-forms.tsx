"use client";

import { useActionState } from "react";
import {
  addStudentAction,
  assignTeacherAction,
  bulkAddStudentsAction,
  createClassAction,
  createSubjectAction,
  updateFacultyAction,
  updateStudentAction,
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

export function EditFacultyForm({
  faculty,
}: {
  faculty: { id: string; name: string; email: string; phone: string | null };
}) {
  const [state, action, pending] = useActionState(updateFacultyAction, {} as ActionState);
  return (
    <form action={action} className="max-w-lg space-y-4">
      <FormStatus state={state} />
      <input type="hidden" name="id" value={faculty.id} />
      <Field label="Name">
        <input className={inputClass} name="name" defaultValue={faculty.name} required />
      </Field>
      <Field label="Email">
        <input
          className={inputClass}
          name="email"
          type="email"
          defaultValue={faculty.email}
          required
        />
      </Field>
      <Field label="Phone">
        <input className={inputClass} name="phone" defaultValue={faculty.phone ?? ""} />
      </Field>
      <button className={`${btnClass} md:w-auto`} disabled={pending}>
        {pending ? "Saving…" : "Save details"}
      </button>
    </form>
  );
}

export function EditStudentForm({
  student,
  classes,
}: {
  student: { id: string; name: string; rollNumber: string; classId: string };
  classes: Option[];
}) {
  const [state, action, pending] = useActionState(updateStudentAction, {} as ActionState);
  return (
    <form action={action} className="max-w-lg space-y-4">
      <FormStatus state={state} />
      <input type="hidden" name="id" value={student.id} />
      <Field label="Class">
        <select className={inputClass} name="classId" defaultValue={student.classId} required>
          {classes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Roll number">
        <input className={inputClass} name="rollNumber" defaultValue={student.rollNumber} required />
      </Field>
      <Field label="Name">
        <input className={inputClass} name="name" defaultValue={student.name} required />
      </Field>
      <button className={`${btnClass} md:w-auto`} disabled={pending}>
        {pending ? "Saving…" : "Save details"}
      </button>
    </form>
  );
}
