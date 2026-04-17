import StatusBadge from "@/components/status-badge";

type TimelineData = {
  latestWebhookEvent: {
    id: string;
    source: "APPLE_SERVER_NOTIFICATIONS" | "GOOGLE_RTDN";
    eventType: string;
    externalEventId: string | null;
    processed: boolean;
    processedAt: string | null;
    createdAt: string;
  } | null;
  latestSyncRun: {
    id: string;
    provider: "APPLE" | "GOOGLE";
    jobType: string;
    status: string;
    message: string | null;
    startedAt: string;
    finishedAt: string | null;
  } | null;
  latestMetricSnapshot: {
    id: string;
    provider: "APPLE" | "GOOGLE";
    rating: number | null;
    reviewCount: number | null;
    releaseStatus: string | null;
    capturedAt: string;
  } | null;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AppOperationsTimeline({
  timeline,
}: {
  timeline: TimelineData | null;
}) {
  return (
    <div className="rounded-[1.6rem] border border-black/8 bg-[#f7f5ef] p-5">
      <div className="text-sm font-bold uppercase tracking-[0.16em] text-yellow-700">
        Operations timeline
      </div>

      <div className="mt-5 space-y-4">
        <TimelineCard
          step="1"
          title="Latest webhook"
          content={
            timeline?.latestWebhookEvent ? (
              <>
                <div className="text-sm font-semibold text-[#111111]">
                  {timeline.latestWebhookEvent.source}
                </div>
                <div className="mt-1 text-sm text-black/65">
                  {timeline.latestWebhookEvent.eventType}
                </div>
                <div className="mt-2 text-xs text-black/50">
                  {formatDate(timeline.latestWebhookEvent.createdAt)}
                </div>
              </>
            ) : (
              <EmptyText text="No webhook matched yet." />
            )
          }
        />

        <TimelineCard
          step="2"
          title="Latest sync"
          content={
            timeline?.latestSyncRun ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-[#111111]">
                      {timeline.latestSyncRun.provider} · {timeline.latestSyncRun.jobType}
                    </div>
                    <div className="mt-1 text-sm text-black/65">
                      {timeline.latestSyncRun.message || "No message"}
                    </div>
                  </div>
                  <StatusBadge status={timeline.latestSyncRun.status} />
                </div>
                <div className="mt-2 text-xs text-black/50">
                  {formatDate(
                    timeline.latestSyncRun.finishedAt || timeline.latestSyncRun.startedAt,
                  )}
                </div>
              </>
            ) : (
              <EmptyText text="No sync run matched yet." />
            )
          }
        />

        <TimelineCard
          step="3"
          title="Latest snapshot"
          content={
            timeline?.latestMetricSnapshot ? (
              <>
                <div className="text-sm font-semibold text-[#111111]">
                  {timeline.latestMetricSnapshot.provider} snapshot
                </div>
                <div className="mt-1 text-sm text-black/65">
                  Rating: {timeline.latestMetricSnapshot.rating ?? "—"} · Reviews:{" "}
                  {timeline.latestMetricSnapshot.reviewCount ?? "—"}
                </div>
                <div className="mt-1 text-sm text-black/65">
                  Status: {timeline.latestMetricSnapshot.releaseStatus ?? "—"}
                </div>
                <div className="mt-2 text-xs text-black/50">
                  {formatDate(timeline.latestMetricSnapshot.capturedAt)}
                </div>
              </>
            ) : (
              <EmptyText text="No metric snapshot yet." />
            )
          }
        />
      </div>
    </div>
  );
}

function TimelineCard({
  step,
  title,
  content,
}: {
  step: string;
  title: string;
  content: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.2rem] border border-black/8 bg-white p-4">
      <div className="flex items-start gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#111111] text-sm font-black text-yellow-300">
          {step}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold uppercase tracking-[0.12em] text-black/45">
            {title}
          </div>
          <div className="mt-2">{content}</div>
        </div>
      </div>
    </div>
  );
}

function EmptyText({ text }: { text: string }) {
  return <div className="text-sm text-black/60">{text}</div>;
}
