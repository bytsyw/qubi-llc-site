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

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function extractGoogleVitalValue(
  rawPayload: any,
  metricSet: "crashRate" | "anrRate",
  metricName: string,
) {
  const set = rawPayload?.vitals?.[metricSet];
  const metric =
    set?.metrics?.find((item: any) => item?.metric === metricName) ?? null;

  return metric?.decimalValue?.value ?? null;
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function buildTrend(current: number | null, previous: number | null) {
  if (current === null || previous === null) return "—";
  const diff = Number((current - previous).toFixed(2));

  if (diff === 0) return "0";
  if (diff > 0) return `+${diff}`;
  return `${diff}`;
}

export default function AppMetricsHistory({
  metrics,
}: {
  metrics: MetricSnapshot[];
}) {
  const googleMetrics = metrics.filter((item) => item.provider === "GOOGLE");
  const appleMetrics = metrics.filter((item) => item.provider === "APPLE");

  const latestGoogle = googleMetrics[0] ?? null;
  const previousGoogle = googleMetrics[1] ?? null;
  const latestApple = appleMetrics[0] ?? null;
  const previousApple = appleMetrics[1] ?? null;

  const googleCrashNow = extractGoogleVitalValue(
    latestGoogle?.rawPayload,
    "crashRate",
    "crashRate",
  );

  const googleCrashPrev = extractGoogleVitalValue(
    previousGoogle?.rawPayload,
    "crashRate",
    "crashRate",
  );

  const googleAnrNow = extractGoogleVitalValue(
    latestGoogle?.rawPayload,
    "anrRate",
    "anrRate",
  );

  const googleAnrPrev = extractGoogleVitalValue(
    previousGoogle?.rawPayload,
    "anrRate",
    "anrRate",
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-[1.6rem] border border-black/8 bg-[#f7f5ef] p-5">
          <div className="text-sm font-bold uppercase tracking-[0.16em] text-yellow-700">
            Google trend summary
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <TrendCard
              label="Rating change"
              current={formatValue(latestGoogle?.rating)}
              trend={buildTrend(
                latestGoogle?.rating ?? null,
                previousGoogle?.rating ?? null,
              )}
            />
            <TrendCard
              label="Review count change"
              current={formatValue(latestGoogle?.reviewCount)}
              trend={buildTrend(
                latestGoogle?.reviewCount ?? null,
                previousGoogle?.reviewCount ?? null,
              )}
            />
            <TrendCard
              label="Crash rate change"
              current={formatValue(googleCrashNow)}
              trend={buildTrend(
                googleCrashNow ? Number(googleCrashNow) : null,
                googleCrashPrev ? Number(googleCrashPrev) : null,
              )}
            />
            <TrendCard
              label="ANR rate change"
              current={formatValue(googleAnrNow)}
              trend={buildTrend(
                googleAnrNow ? Number(googleAnrNow) : null,
                googleAnrPrev ? Number(googleAnrPrev) : null,
              )}
            />
          </div>
        </div>

        <div className="rounded-[1.6rem] border border-black/8 bg-[#f7f5ef] p-5">
          <div className="text-sm font-bold uppercase tracking-[0.16em] text-yellow-700">
            Apple trend summary
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <TrendCard
              label="Rating change"
              current={formatValue(latestApple?.rating)}
              trend={buildTrend(
                latestApple?.rating ?? null,
                previousApple?.rating ?? null,
              )}
            />
            <TrendCard
              label="Review count change"
              current={formatValue(latestApple?.reviewCount)}
              trend={buildTrend(
                latestApple?.reviewCount ?? null,
                previousApple?.reviewCount ?? null,
              )}
            />
            <TrendCard
              label="Latest status"
              current={formatValue(latestApple?.releaseStatus)}
              trend="—"
            />
            <TrendCard
              label="Captured at"
              current={formatDate(latestApple?.capturedAt)}
              trend="—"
            />
          </div>
        </div>
      </div>

      <div className="rounded-[1.6rem] border border-black/8 bg-[#f7f5ef] p-5">
        <div className="text-sm font-bold uppercase tracking-[0.16em] text-yellow-700">
          Snapshot history
        </div>

        {metrics.length === 0 ? (
          <div className="mt-5 rounded-[1.2rem] border border-black/8 bg-white px-4 py-4 text-sm text-black/60">
            No metric snapshots yet.
          </div>
        ) : (
          <div className="mt-5 overflow-hidden rounded-[1.2rem] border border-black/8 bg-white">
            <table className="w-full border-collapse text-left">
              <thead className="bg-[#f7f5ef] text-sm text-black/55">
                <tr>
                  <th className="px-4 py-3 font-semibold">Provider</th>
                  <th className="px-4 py-3 font-semibold">Rating</th>
                  <th className="px-4 py-3 font-semibold">Reviews</th>
                  <th className="px-4 py-3 font-semibold">Crash</th>
                  <th className="px-4 py-3 font-semibold">ANR</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Sync source</th>
                  <th className="px-4 py-3 font-semibold">Captured</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((item) => {
                  const crash = extractGoogleVitalValue(
                    item.rawPayload,
                    "crashRate",
                    "crashRate",
                  );

                  const anr = extractGoogleVitalValue(
                    item.rawPayload,
                    "anrRate",
                    "anrRate",
                  );

                  return (
                    <tr key={item.id} className="border-t border-black/8 bg-white align-top">
                      <td className="px-4 py-4 text-sm font-semibold text-[#111111]">
                        {item.provider}
                      </td>
                      <td className="px-4 py-4 text-sm text-black/65">
                        {formatValue(item.rating)}
                      </td>
                      <td className="px-4 py-4 text-sm text-black/65">
                        {formatValue(item.reviewCount)}
                      </td>
                      <td className="px-4 py-4 text-sm text-black/65">
                        {formatValue(crash)}
                      </td>
                      <td className="px-4 py-4 text-sm text-black/65">
                        {formatValue(anr)}
                      </td>
                      <td className="px-4 py-4 text-sm text-black/65">
                        {formatValue(item.releaseStatus)}
                      </td>
                      <td className="px-4 py-4 text-sm text-black/65">
                        {item.matchedSyncRun ? (
                          <div className="space-y-2">
                            <div className="font-semibold text-[#111111]">
                              {item.matchedSyncRun.provider} · {item.matchedSyncRun.jobType}
                            </div>
                            <StatusBadge status={item.matchedSyncRun.status} />
                            <div className="text-xs leading-5 text-black/50">
                              {formatDate(item.matchedSyncRun.finishedAt || item.matchedSyncRun.startedAt)}
                            </div>
                          </div>
                        ) : (
                          "No linked sync"
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-black/65">
                        {formatDate(item.capturedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function TrendCard({
  label,
  current,
  trend,
}: {
  label: string;
  current: string;
  trend: string;
}) {
  return (
    <div className="rounded-[1.2rem] border border-black/8 bg-white px-4 py-4">
      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-black/45">
        {label}
      </div>
      <div className="mt-2 text-lg font-black text-[#111111]">{current}</div>
      <div className="mt-1 text-sm text-black/50">Δ {trend}</div>
    </div>
  );
}