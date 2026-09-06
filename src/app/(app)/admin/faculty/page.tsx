import Link from "next/link";
import {
  approveFacultyAction,
  restoreFacultyAction,
  softDeleteFacultyAction,
} from "@/lib/actions/admin";
import { prisma } from "@/lib/db";
import { Role } from "@/lib/roles";

function statusLabel(row: {
  emailVerifiedAt: Date | null;
  approvedAt: Date | null;
  deletedAt: Date | null;
}) {
  if (row.deletedAt) {
    return "Removed";
  }
  if (!row.emailVerifiedAt) {
    return "Email not verified";
  }
  if (!row.approvedAt) {
    return "Waiting approval";
  }
  return "Active";
}

export default async function FacultyPage() {
  const faculty = await prisma.user.findMany({
    where: { role: Role.TEACHER },
    orderBy: [{ deletedAt: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Faculty</h1>
        <p className="mt-1 text-sm text-ink/60">
          New teachers appear here after signup. Approve before they can log in. Remove is a
          soft delete — restore if it was a mistake.
        </p>
      </div>
      <ul className="divide-y divide-ink/10 overflow-hidden rounded-2xl border border-ink/10 bg-white">
        {faculty.length === 0 ? (
          <li className="px-5 py-4 text-sm text-ink/60">No faculty accounts yet.</li>
        ) : (
          faculty.map((row) => (
            <li key={row.id} className="flex flex-wrap items-center gap-3 px-5 py-4 text-sm">
              <div className="min-w-48 flex-1">
                <div className="font-medium">{row.name}</div>
                <div className="text-ink/50">{row.email}</div>
              </div>
              <span className="rounded-full border border-ink/15 px-2 py-0.5 text-xs">
                {statusLabel(row)}
              </span>
              <div className="flex flex-wrap gap-2">
                {!row.deletedAt && row.emailVerifiedAt && !row.approvedAt ? (
                  <form action={approveFacultyAction}>
                    <input type="hidden" name="id" value={row.id} />
                    <button className="rounded-full bg-mark px-3 py-1 text-xs text-paper">
                      Approve
                    </button>
                  </form>
                ) : null}
                {!row.deletedAt ? (
                  <>
                    <Link
                      className="rounded-full border border-ink/15 px-3 py-1 text-xs"
                      href={`/admin/faculty/${row.id}`}
                    >
                      Edit
                    </Link>
                    <form action={softDeleteFacultyAction}>
                      <input type="hidden" name="id" value={row.id} />
                      <button className="rounded-full border border-coral/40 px-3 py-1 text-xs text-coral">
                        Remove
                      </button>
                    </form>
                  </>
                ) : (
                  <form action={restoreFacultyAction}>
                    <input type="hidden" name="id" value={row.id} />
                    <button className="rounded-full border border-ink/15 px-3 py-1 text-xs">
                      Restore
                    </button>
                  </form>
                )}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
