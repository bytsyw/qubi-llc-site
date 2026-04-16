import StatusBadge from "@/components/status-badge";

type SyncRunRecord = {
  id: string;
  provider: "APPLE" | "GOOGLE";
  jobType: string;
  status: "RUNNING" | "SUCCESS" | "FAILED" | "PARTIAL" | "SKIPPED";
  message: string | null;
  startedAt: string;
  finishedAt: string | null;
  rawPayload: any;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPayload(payload: any) {
  try {
    const text = JSON.stringify(payload, null, 2);
    return text.length > 300 ? `${text.slice(0, 300)}...` : text;
  } catch {
    return "Payload unavailable";
  }
}

export default function AppSyncActivity({
  runs,
}: {
  runs: SyncRunRecord[];
}) {
  return (
    <div className="rounded-[1.6rem] border border-black/8 bg-[#f7f5ef] p-5">
      <div className="text-sm font-bold uppercase tracking-[0.16em] text-yellow-700">
        Sync activity
      </div>

      {runs.length === 0 ? (
        <div className="mt-5 rounded-[1.2rem] border border-black/8 bg-white px-4 py-4 text-sm text-black/60">
          No app-specific sync activity found yet.
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {runs.map((run) => (
            <div
              key={run.id}
              className="rounded-[1.2rem] border border-black/8 bg-white p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.12em] text-black/45">
                    {run.provider} · {run.jobType}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-[#111111]">
                    {run.message || "No message"}
                  </div>
                </div>

                <StatusBadge status={run.status} />
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <InfoRow label="Started" value={formatDate(run.startedAt)} />
                <InfoRow label="Finished" value={formatDate(run.finishedAt)} />
              </div>

              <div className="mt-4 rounded-[1rem] border border-black/8 bg-[#f7f5ef] p-3">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-black/45">
                  Raw payload preview
                </div>
                <pre className="mt-2 whitespace-pre-wrap text-xs leading-6 text-black/60">
                  {formatPayload(run.rawPayload)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1rem] border border-black/8 bg-white px-4 py-3 text-sm text-black/65">
      <span className="font-semibold text-[#111111]">{label}:</span> {value}
    </div>
  );
}