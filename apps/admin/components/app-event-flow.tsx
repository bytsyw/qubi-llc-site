import StatusBadge from "@/components/status-badge";

type MetricSnapshot = {
  id: string;
  provider: "APPLE" | "GOOGLE";
  rating: number | null;
  reviewCount: number | null;
  downloadEstimate: string | null;
  versionLabel: string | null;
  releaseStatus: string | null;
  rawPayload: any;
  capturedAt: string;
  matchedSyncRun: {
    id: string;
    provider: "APPLE" | "GOOGLE";
    jobType: string;
    status: string;
    message: string | null;
    startedAt: string;
    finishedAt: string | null;
  } | null;
};

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

type Provider = "APPLE" | "GOOGLE";

type EventFlow = {
  provider: Provider;
  webhook: WebhookEventRecord | null;
  sync: SyncRunRecord | null;
  snapshot: MetricSnapshot | null;
};

function mapWebhookSourceToProvider(
  source: WebhookEventRecord["source"],
): Provider {
  return source === "APPLE_SERVER_NOTIFICATIONS" ? "APPLE" : "GOOGLE";
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function hoursBetween(a: string, b: string) {
  const diff = Math.abs(new Date(a).getTime() - new Date(b).getTime());
  return diff / (1000 * 60 * 60);
}

function buildFlows({
  webhookEvents,
  syncRuns,
  metrics,
}: {
  webhookEvents: WebhookEventRecord[];
  syncRuns: SyncRunRecord[];
  metrics: MetricSnapshot[];
}) {
  const flows: EventFlow[] = [];

  for (const webhook of webhookEvents.slice(0, 12)) {
    const provider = mapWebhookSourceToProvider(webhook.source);
    const webhookTime = webhook.processedAt || webhook.createdAt;

    const matchedSync =
      syncRuns.find((run) => {
        if (run.provider !== provider) return false;

        const syncAnchor = run.finishedAt || run.startedAt;
        if (!syncAnchor) return false;

        const syncTime = new Date(syncAnchor).getTime();
        const eventTime = new Date(webhookTime).getTime();

        return syncTime >= eventTime && hoursBetween(syncAnchor, webhookTime) <= 6;
      }) ?? null;

    const matchedSnapshot =
      metrics.find((metric) => {
        if (metric.provider !== provider) return false;

        const metricTime = metric.capturedAt;
        const referenceTime =
          matchedSync?.finishedAt || matchedSync?.startedAt || webhookTime;

        const metricDate = new Date(metricTime).getTime();
        const referenceDate = new Date(referenceTime).getTime();

        return metricDate >= referenceDate && hoursBetween(metricTime, referenceTime) <= 6;
      }) ?? null;

    flows.push({
      provider,
      webhook,
      sync: matchedSync,
      snapshot: matchedSnapshot,
    });
  }

  const uniqueFlows = flows.filter(
    (flow, index, arr) =>
      index ===
      arr.findIndex(
        (item) =>
          item.webhook?.id === flow.webhook?.id &&
          item.sync?.id === flow.sync?.id &&
          item.snapshot?.id === flow.snapshot?.id,
      ),
  );

  return uniqueFlows.slice(0, 8);
}

export default function AppEventFlow({
  webhookEvents,
  syncRuns,
  metrics,
}: {
  webhookEvents: WebhookEventRecord[];
  syncRuns: SyncRunRecord[];
  metrics: MetricSnapshot[];
}) {
  const flows = buildFlows({
    webhookEvents,
    syncRuns,
    metrics,
  });

  return (
    <div className="rounded-[1.6rem] border border-black/8 bg-[#f7f5ef] p-5">
      <div className="text-sm font-bold uppercase tracking-[0.16em] text-yellow-700">
        Event flow
      </div>

      {flows.length === 0 ? (
        <div className="mt-5 rounded-[1.2rem] border border-black/8 bg-white px-4 py-4 text-sm text-black/60">
          No webhook → sync → snapshot chain could be matched yet.
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {flows.map((flow, index) => (
            <div
              key={`${flow.webhook?.id || "wh"}-${flow.sync?.id || "sync"}-${flow.snapshot?.id || "metric"}-${index}`}
              className="rounded-[1.2rem] border border-black/8 bg-white p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-bold uppercase tracking-[0.12em] text-[#111111]">
                  {flow.provider} flow
                </div>
                <div className="text-xs text-black/45">
                  Chain #{index + 1}
                </div>
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-3">
                <FlowCard
                  step="Webhook"
                  title={flow.webhook?.eventType || "No matched webhook"}
                  subtitle={
                    flow.webhook
                      ? `${flow.webhook.source} · ${formatDate(flow.webhook.createdAt)}`
                      : "No webhook match"
                  }
                  badge={
                    flow.webhook ? (
                      <StatusBadge
                        status={flow.webhook.processed ? "SUCCESS" : "PENDING"}
                        label={flow.webhook.processed ? "processed" : "pending"}
                      />
                    ) : undefined
                  }
                />

                <FlowCard
                  step="Sync"
                  title={
                    flow.sync
                      ? `${flow.sync.provider} · ${flow.sync.jobType}`
                      : "No matched sync"
                  }
                  subtitle={
                    flow.sync
                      ? `${flow.sync.message || "No message"}`
                      : "No sync match"
                  }
                  footer={
                    flow.sync
                      ? formatDate(flow.sync.finishedAt || flow.sync.startedAt)
                      : "—"
                  }
                  badge={
                    flow.sync ? <StatusBadge status={flow.sync.status} /> : undefined
                  }
                />

                <FlowCard
                  step="Snapshot"
                  title={
                    flow.snapshot
                      ? `${flow.snapshot.provider} · ${flow.snapshot.releaseStatus || "No status"}`
                      : "No matched snapshot"
                  }
                  subtitle={
                    flow.snapshot
                      ? `Rating: ${flow.snapshot.rating ?? "—"} · Reviews: ${flow.snapshot.reviewCount ?? "—"}`
                      : "No snapshot match"
                  }
                  footer={
                    flow.snapshot ? formatDate(flow.snapshot.capturedAt) : "—"
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FlowCard({
  step,
  title,
  subtitle,
  footer,
  badge,
}: {
  step: string;
  title: string;
  subtitle: string;
  footer?: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="rounded-[1rem] border border-black/8 bg-[#f7f5ef] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs font-bold uppercase tracking-[0.12em] text-black/45">
          {step}
        </div>
        {badge}
      </div>

      <div className="mt-3 text-sm font-semibold text-[#111111]">{title}</div>
      <div className="mt-2 text-sm leading-6 text-black/60">{subtitle}</div>

      {footer ? (
        <div className="mt-3 text-xs text-black/45">{footer}</div>
      ) : null}
    </div>
  );
}