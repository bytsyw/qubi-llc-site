import AdminShell from "@/components/admin-shell";
import SyncRunner from "@/components/sync-runner";
import { getAdminSyncRuns } from "@/lib/server-api";

type SyncRunRecord = {
  id: string;
  provider: "APPLE" | "GOOGLE";
  jobType: string;
  status: "SUCCESS" | "FAILED" | "PARTIAL" | "RUNNING";
  startedAt: string;
  finishedAt: string | null;
  message: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function SyncPage() {
  let runs: SyncRunRecord[] = [];
  let hasError = false;

  try {
    runs = await getAdminSyncRuns();
  } catch {
    hasError = true;
  }

  return (
    <AdminShell
      title="Sync"
      description="This screen shows recent scheduled/manual sync runs. It now covers registry sync plus review/metric synchronization for mapped Apple and Google apps."
    >
      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <SyncRunner />

        <div className="rounded-[2rem] border border-black/8 bg-white/80 p-6">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-700">
            Recent runs
          </div>

          <h2 className="mt-3 text-2xl font-black tracking-tight">Sync run history</h2>

          {hasError ? (
            <div className="mt-6 rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
              Sync run history could not be loaded from the backend.
            </div>
          ) : runs.length === 0 ? (
            <div className="mt-6 rounded-[1.5rem] border border-black/8 bg-[#f7f5ef] px-4 py-4 text-sm text-black/60">
              No sync runs recorded yet.
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-black/8">
              <table className="w-full border-collapse text-left">
                <thead className="bg-[#f7f5ef] text-sm text-black/55">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Provider</th>
                    <th className="px-4 py-3 font-semibold">Job</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Started</th>
                    <th className="px-4 py-3 font-semibold">Finished</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((run) => (
                    <tr
                      key={run.id}
                      className="border-t border-black/8 bg-white align-top"
                    >
                      <td className="px-4 py-4 text-sm font-semibold text-[#111111]">
                        {run.provider}
                      </td>
                      <td className="px-4 py-4 text-sm text-black/60">
                        <div>{run.jobType}</div>
                        {run.message ? (
                          <div className="mt-1 text-xs leading-6 text-black/45">
                            {run.message}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${
                            run.status === "SUCCESS"
                              ? "bg-[#111111] text-yellow-300"
                              : run.status === "RUNNING"
                                ? "bg-yellow-100 text-black/75"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {run.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-black/60">
                        {formatDate(run.startedAt)}
                      </td>
                      <td className="px-4 py-4 text-sm text-black/60">
                        {formatDate(run.finishedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
