"use client";

import { useMemo, useState } from "react";
import AppMetricsHistory from "@/components/app-metrics-history";
import AppSyncSummary from "@/components/app-sync-summary";
import AppSyncActivity from "@/components/app-sync-activity";
import AppWebhookActivity from "@/components/app-webhook-activity";

type ProviderFilter = "ALL" | "APPLE" | "GOOGLE";

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

function mapWebhookSourceToProvider(
  source: WebhookEventRecord["source"],
): "APPLE" | "GOOGLE" {
  return source === "APPLE_SERVER_NOTIFICATIONS" ? "APPLE" : "GOOGLE";
}

function FilterButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-[#111111] text-yellow-300"
          : "border border-black/8 bg-white text-black/65 hover:bg-black/5"
      }`}
    >
      {label}
    </button>
  );
}

export default function AppOperationsPanel({
  metrics,
  syncRuns,
  webhookEvents,
}: {
  metrics: MetricSnapshot[];
  syncRuns: SyncRunRecord[];
  webhookEvents: WebhookEventRecord[];
}) {
  const [filter, setFilter] = useState<ProviderFilter>("ALL");

  const filteredMetrics = useMemo(() => {
    if (filter === "ALL") return metrics;
    return metrics.filter((item) => item.provider === filter);
  }, [filter, metrics]);

  const filteredSyncRuns = useMemo(() => {
    if (filter === "ALL") return syncRuns;
    return syncRuns.filter((item) => item.provider === filter);
  }, [filter, syncRuns]);

  const filteredWebhookEvents = useMemo(() => {
    if (filter === "ALL") return webhookEvents;
    return webhookEvents.filter(
      (item) => mapWebhookSourceToProvider(item.source) === filter,
    );
  }, [filter, webhookEvents]);

  return (
    <div className="space-y-8">
      <div className="rounded-[1.6rem] border border-black/8 bg-[#f7f5ef] p-5">
        <div className="text-sm font-bold uppercase tracking-[0.16em] text-yellow-700">
          Provider filter
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <FilterButton
            active={filter === "ALL"}
            label="All"
            onClick={() => setFilter("ALL")}
          />
          <FilterButton
            active={filter === "APPLE"}
            label="Apple"
            onClick={() => setFilter("APPLE")}
          />
          <FilterButton
            active={filter === "GOOGLE"}
            label="Google"
            onClick={() => setFilter("GOOGLE")}
          />
        </div>
      </div>

      <AppMetricsHistory metrics={filteredMetrics} />

      <AppSyncSummary runs={filteredSyncRuns} />

      <AppSyncActivity runs={filteredSyncRuns} />

      <AppWebhookActivity events={filteredWebhookEvents} />
    </div>
  );
}