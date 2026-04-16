type WebhookEventRecord = {
    id: string;
    source: "APPLE_SERVER_NOTIFICATIONS" | "GOOGLE_RTDN";
    eventType: string;
    externalEventId: string | null;
    processed: boolean;
    processedAt: string | null;
    createdAt: string;
    payload: any;
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
      return text.length > 320 ? `${text.slice(0, 320)}...` : text;
    } catch {
      return "Payload unavailable";
    }
  }
  
  export default function AppWebhookActivity({
    events,
  }: {
    events: WebhookEventRecord[];
  }) {
    return (
      <div className="rounded-[1.6rem] border border-black/8 bg-[#f7f5ef] p-5">
        <div className="text-sm font-bold uppercase tracking-[0.16em] text-yellow-700">
          Webhook activity
        </div>
  
        {events.length === 0 ? (
          <div className="mt-5 rounded-[1.2rem] border border-black/8 bg-white px-4 py-4 text-sm text-black/60">
            No webhook activity matched to this app yet.
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="rounded-[1.2rem] border border-black/8 bg-white p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.12em] text-black/45">
                      {event.source}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-[#111111]">
                      {event.eventType}
                    </div>
                  </div>
  
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${
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
  
                <div className="mt-4 rounded-[1rem] border border-black/8 bg-[#f7f5ef] p-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-black/45">
                    Payload preview
                  </div>
                  <pre className="mt-2 whitespace-pre-wrap text-xs leading-6 text-black/60">
                    {formatPayload(event.payload)}
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