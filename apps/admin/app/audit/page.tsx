import AdminShell from "@/components/admin-shell";
import { getAdminAuditLogs } from "@/lib/server-api";

type AuditLog = {
  id: string;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId: string | null;
  targetLabel: string | null;
  details: any;
  createdAt: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDetails(value: any) {
  try {
    const text = JSON.stringify(value, null, 2);
    return text.length > 260 ? `${text.slice(0, 260)}...` : text;
  } catch {
    return "Details unavailable";
  }
}

export default async function AuditPage() {
  let logs: AuditLog[] = [];
  let hasError = false;

  try {
    logs = await getAdminAuditLogs();
  } catch {
    hasError = true;
  }

  return (
    <AdminShell
      title="Audit"
      description="Admin write actions are tracked here. This shows who changed what and when."
    >
      {hasError ? (
        <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Audit logs could not be loaded from the backend.
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-[2rem] border border-black/8 bg-white/80 p-6 text-sm text-black/60">
          No audit logs recorded yet.
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="rounded-[1.6rem] border border-black/8 bg-white/80 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-yellow-700">
                    {log.action}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-[#111111]">
                    {log.adminEmail}
                  </div>
                </div>

                <div className="text-sm text-black/50">
                  {formatDate(log.createdAt)}
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <InfoRow label="Entity" value={log.entityType} />
                <InfoRow label="Target" value={log.targetLabel || "—"} />
                <InfoRow label="Entity ID" value={log.entityId || "—"} />
              </div>

              <div className="mt-4 rounded-[1rem] border border-black/8 bg-[#f7f5ef] p-4">
                <div className="text-xs font-bold uppercase tracking-[0.12em] text-black/45">
                  Details
                </div>
                <pre className="mt-2 whitespace-pre-wrap text-xs leading-6 text-black/60">
                  {formatDetails(log.details)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
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
    <div className="rounded-[1rem] border border-black/8 bg-[#f7f5ef] px-4 py-3 text-sm text-black/65">
      <span className="font-semibold text-[#111111]">{label}:</span> {value}
    </div>
  );
} 