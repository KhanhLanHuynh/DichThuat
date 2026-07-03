import Link from "next/link";
import { listProjects } from "@/lib/files";
import { getSessionUser } from "@/lib/auth";

export default async function HomePage() {
  const projects = await listProjects();
  const user = await getSessionUser();

  return (
    <div className="flex min-h-full flex-col items-center justify-center p-8">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-lg font-bold text-white">
            DT
          </div>
          <h1 className="text-2xl font-bold">DichThuat</h1>
          <p className="mt-1 text-sm text-muted">
            Buddhist translation workbench
            {user && ` · ${user.username}`}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-panel shadow-sm">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Projects</h2>
          </div>
          <ul className="divide-y divide-border">
            {projects.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-muted">
                No projects in <code>web/data/projects/</code>.
              </li>
            )}
            {projects.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/project/${p.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                >
                  <div>
                    <div className="text-sm font-medium">{p.title}</div>
                    <div className="text-xs text-muted">{p.series}</div>
                  </div>
                  {p.status && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium uppercase">
                      {p.status}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {!user && (
          <p className="mt-4 text-center text-xs text-muted">
            <Link href="/login" className="text-accent hover:underline">
              Sign in
            </Link>{" "}
            to save translations
          </p>
        )}
      </div>
    </div>
  );
}
