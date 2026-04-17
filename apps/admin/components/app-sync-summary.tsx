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

function findLastRunByStatus(runs: SyncRunRecord[], statuses: string[]) {
  return runs.find((run) => statuses.includes(run.status)) ?? null;
}

export default function AppSyncSummary({ runs }: { runs: SyncRunRecord[] }) {
  const lastSuccess = findLastRunByStatus(runs, ["SUCCESS", "SKIPPED"]);
  const lastFailure = findLastRunByStatus(runs, ["FAILED"]);
  const currentlyRunning = findLastRunByStatus(runs, ["RUNNING"]);

  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <SummaryCard
        title="Last successful sync"
        run={lastSuccess}
        emptyText="No successful sync yet."
      />

      <SummaryCard
        title="Last failed sync"
        run={lastFailure}
        emptyText="No failed sync found."
      />

      <SummaryCard
        title="Current sync state"
        run={currentlyRunning}
        emptyText="No sync running right now."
      />
    </div>
  );
}

function SummaryCard({
  title,
  run,
  emptyText,
}: {
  title: string;
  run: SyncRunRecord | null;
  emptyText: string;
}) {
  return (
    <div className="rounded-[1.6rem] border border-black/8 bg-[#f7f5ef] p-5">
      <div className="text-sm font-bold uppercase tracking-[0.16em] text-yellow-700">
        {title}
      </div>

      {!run ? (
        <div className="mt-5 rounded-[1.2rem] border border-black/8 bg-white px-4 py-4 text-sm text-black/60">
          {emptyText}
        </div>
      ) : (
        <div className="mt-5 rounded-[1.2rem] border border-black/8 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
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

          <div className="mt-4 grid gap-3">
            <InfoRow label="Started" value={formatDate(run.startedAt)} />
            <InfoRow label="Finished" value={formatDate(run.finishedAt)} />
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1rem] border border-black/8 bg-[#f7f5ef] px-4 py-3 text-sm text-black/65">
      <span className="font-semibold text-[#111111]">{label}:</span> {value}
    </div>
  );
}
