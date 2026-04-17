type MetricRecord = {
  provider: "APPLE" | "GOOGLE";
  rating: number | null;
  reviewCount: number | null;
  downloadEstimate: string | null;
  versionLabel: string | null;
  releaseStatus: string | null;
  rawPayload: any;
  capturedAt: string;
};

type AnalyticsRecord = {
  locale: string | null;
  parentsReached: number | null;
  repeatUsage: number | null;
  averageSessionText: string | null;
  trustScore: number | null;
  capturedAt: string;
} | null;

function extractGoogleVitalValue(
  rawPayload: any,
  metricSet: "crashRate" | "anrRate",
  metricName: string,
) {
  const set = rawPayload?.vitals?.[metricSet];
  const metric = set?.metrics?.find((item: any) => item?.metric === metricName) ?? null;

  return metric?.decimalValue?.value ?? null;
}

function formatMetricValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AppMetricsPanel({
  apple,
  google,
  analytics,
}: {
  apple: MetricRecord | null;
  google: MetricRecord | null;
  analytics: AnalyticsRecord;
}) {
  const googleCrashRate = extractGoogleVitalValue(
    google?.rawPayload,
    "crashRate",
    "crashRate",
  );

  const googleUserPerceivedCrashRate = extractGoogleVitalValue(
    google?.rawPayload,
    "crashRate",
    "userPerceivedCrashRate",
  );

  const googleAnrRate = extractGoogleVitalValue(google?.rawPayload, "anrRate", "anrRate");

  const googleUserPerceivedAnrRate = extractGoogleVitalValue(
    google?.rawPayload,
    "anrRate",
    "userPerceivedAnrRate",
  );

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
      <div className="rounded-[1.6rem] border border-black/8 bg-[#f7f5ef] p-5">
        <div className="text-sm font-bold uppercase tracking-[0.16em] text-yellow-700">
          Google latest metrics
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <MetricCard label="Rating" value={formatMetricValue(google?.rating)} />
          <MetricCard
            label="Review count"
            value={formatMetricValue(google?.reviewCount)}
          />
          <MetricCard label="Crash rate" value={formatMetricValue(googleCrashRate)} />
          <MetricCard
            label="User perceived crash"
            value={formatMetricValue(googleUserPerceivedCrashRate)}
          />
          <MetricCard label="ANR rate" value={formatMetricValue(googleAnrRate)} />
          <MetricCard
            label="User perceived ANR"
            value={formatMetricValue(googleUserPerceivedAnrRate)}
          />
          <MetricCard
            label="Release status"
            value={formatMetricValue(google?.releaseStatus)}
          />
          <MetricCard label="Captured at" value={formatDate(google?.capturedAt)} />
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-[1.6rem] border border-black/8 bg-[#f7f5ef] p-5">
          <div className="text-sm font-bold uppercase tracking-[0.16em] text-yellow-700">
            Apple latest metrics
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <MetricCard label="Rating" value={formatMetricValue(apple?.rating)} />
            <MetricCard
              label="Review count"
              value={formatMetricValue(apple?.reviewCount)}
            />
            <MetricCard
              label="Release status"
              value={formatMetricValue(apple?.releaseStatus)}
            />
            <MetricCard label="Captured at" value={formatDate(apple?.capturedAt)} />
          </div>
        </div>

        <div className="rounded-[1.6rem] border border-black/8 bg-[#f7f5ef] p-5">
          <div className="text-sm font-bold uppercase tracking-[0.16em] text-yellow-700">
            Analytics snapshot
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <MetricCard
              label="Parents reached"
              value={formatMetricValue(analytics?.parentsReached)}
            />
            <MetricCard
              label="Repeat usage"
              value={formatMetricValue(analytics?.repeatUsage)}
            />
            <MetricCard
              label="Average session"
              value={formatMetricValue(analytics?.averageSessionText)}
            />
            <MetricCard
              label="Trust score"
              value={formatMetricValue(analytics?.trustScore)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.2rem] border border-black/8 bg-white px-4 py-4">
      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-black/45">
        {label}
      </div>
      <div className="mt-2 text-lg font-black text-[#111111]">{value}</div>
    </div>
  );
}
