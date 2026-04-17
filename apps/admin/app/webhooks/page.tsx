import AdminShell from "@/components/admin-shell";
import WebhookProcessor from "@/components/webhook-processor";
import { getAdminWebhookEvents } from "@/lib/server-api";

type WebhookEventRecord = {
  id: string;
  source: "APPLE_SERVER_NOTIFICATIONS" | "GOOGLE_RTDN";
  eventType: string;
  externalEventId: string | null;
  processed: boolean;
  processedAt: string | null;
  createdAt: string;
  payload: unknown;
};

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function truncatePayload(payload: unknown) {
  try {
    const text = JSON.stringify(payload, null, 2);
    return text.length > 700 ? `${text.slice(0, 700)}...` : text;
  } catch {
    return "Payload could not be rendered.";
  }
}

export default async function WebhooksPage() {
  let events: WebhookEventRecord[] = [];
  let hasError = false;

  try {
    events = await getAdminWebhookEvents();
  } catch {
    hasError = true;
  }

  return (
    <AdminShell
      title="Webhooks"
      description="This screen now stores raw webhook events and tracks whether they were verified and processed. Apple retry processing is available for pending events."
    >
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <WebhookProcessor />

        <div className="rounded-[2rem] border border-black/8 bg-white/80 p-6">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-700">
            Status
          </div>
          <h2 className="mt-3 text-2xl font-black tracking-tight">
            Webhook ingestion status
          </h2>

          <div className="mt-4 space-y-3">
            <InfoRow label="Total visible events" value={String(events.length)} />
            <InfoRow
              label="Processed"
              value={String(events.filter((item) => item.processed).length)}
            />
            <InfoRow
              label="Pending"
              value={String(events.filter((item) => !item.processed).length)}
            />
          </div>
        </div>
      </div>

      {hasError ? (
        <div className="mt-6 rounded-[2rem] border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Webhook events could not be loaded from the backend.
        </div>
      ) : null}

      {!hasError && events.length === 0 ? (
        <div className="mt-6 rounded-[2rem] border border-black/8 bg-white/80 p-6 text-sm text-black/60">
          No webhook events have been received yet.
        </div>
      ) : null}

      <div className="mt-6 space-y-5">
        {events.map((event) => (
          <div
            key={event.id}
            className="rounded-[2rem] border border-black/8 bg-white/80 p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-700">
                  {event.source}
                </div>
                <h2 className="mt-2 text-2xl font-black tracking-tight">
                  {event.eventType}
                </h2>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${
                  event.processed
                    ? "bg-[#111111] text-yellow-300"
                    : "bg-black/5 text-black/60"
                }`}
              >
                {event.processed ? "processed" : "pending"}
              </span>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <InfoRow label="Event ID" value={event.externalEventId ?? "—"} />
              <InfoRow label="Created" value={formatDate(event.createdAt)} />
              <InfoRow label="Processed at" value={formatDate(event.processedAt)} />
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-black/8 bg-[#f7f5ef] p-4">
              <div className="text-sm font-semibold text-[#111111]">Payload preview</div>
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-black/65">
                {truncatePayload(event.payload)}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.3rem] border border-black/8 bg-[#f7f5ef] px-4 py-3 text-sm text-black/70">
      <span className="font-semibold text-[#111111]">{label}:</span> {value}
    </div>
  );
}
