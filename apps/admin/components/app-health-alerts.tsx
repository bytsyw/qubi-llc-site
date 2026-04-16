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
  
  type AlertLevel = "critical" | "warning" | "info" | "healthy";
  
  type AlertItem = {
    level: AlertLevel;
    title: string;
    description: string;
  };
  
  function hoursSince(value: string | null | undefined) {
    if (!value) return null;
  
    const diff = Date.now() - new Date(value).getTime();
    return diff / (1000 * 60 * 60);
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
  
  function getLevelClasses(level: AlertLevel) {
    switch (level) {
      case "critical":
        return "border-red-200 bg-red-50 text-red-800";
      case "warning":
        return "border-yellow-200 bg-yellow-50 text-yellow-900";
      case "info":
        return "border-blue-200 bg-blue-50 text-blue-800";
      case "healthy":
        return "border-emerald-200 bg-emerald-50 text-emerald-800";
      default:
        return "border-black/8 bg-white text-black/70";
    }
  }
  
  export default function AppHealthAlerts({
    metrics,
    syncRuns,
    webhookEvents,
  }: {
    metrics: MetricSnapshot[];
    syncRuns: SyncRunRecord[];
    webhookEvents: WebhookEventRecord[];
  }) {
    const alerts: AlertItem[] = [];
  
    const lastSuccessfulSync =
      syncRuns.find((run) => run.status === "SUCCESS") ?? null;
  
    const lastCompletedSync =
      syncRuns.find(
        (run) => run.status === "SUCCESS" || run.status === "SKIPPED",
      ) ?? null;
  
    const latestMetric = metrics[0] ?? null;
  
    const oldPendingWebhookCount = webhookEvents.filter((event) => {
      if (event.processed) return false;
      const age = hoursSince(event.createdAt);
      return age !== null && age > 1;
    }).length;
  
    const latestGoogleMetric =
      metrics.find((item) => item.provider === "GOOGLE") ?? null;
  
    const googleCrashRate = extractGoogleVitalValue(
      latestGoogleMetric?.rawPayload,
      "crashRate",
      "crashRate",
    );
  
    const googleAnrRate = extractGoogleVitalValue(
      latestGoogleMetric?.rawPayload,
      "anrRate",
      "anrRate",
    );
  
    if (!lastSuccessfulSync) {
      alerts.push({
        level: "critical",
        title: "No successful sync yet",
        description:
          "Bu uygulama için henüz SUCCESS durumunda bir sync run görünmüyor.",
      });
    }
  
    if (lastCompletedSync) {
      const age = hoursSince(
        lastCompletedSync.finishedAt || lastCompletedSync.startedAt,
      );
  
      if (age !== null && age > 24) {
        alerts.push({
          level: "warning",
          title: "Sync data may be stale",
          description:
            "Son tamamlanan sync 24 saatten daha eski görünüyor.",
        });
      }
    }
  
    if (!latestMetric) {
      alerts.push({
        level: "warning",
        title: "No metric snapshot yet",
        description:
          "Bu uygulama için henüz metrics snapshot üretilmemiş görünüyor.",
      });
    } else {
      const metricAge = hoursSince(latestMetric.capturedAt);
  
      if (metricAge !== null && metricAge > 24) {
        alerts.push({
          level: "warning",
          title: "Metric snapshot is old",
          description:
            "Son metrics snapshot 24 saatten daha eski. Veri güncel olmayabilir.",
        });
      }
    }
  
    if (oldPendingWebhookCount > 0) {
      alerts.push({
        level: "warning",
        title: "Pending webhook events detected",
        description: `${oldPendingWebhookCount} adet işlenmemiş webhook eventi 1 saatten eski görünüyor.`,
      });
    }
  
    if (
      latestGoogleMetric &&
      latestGoogleMetric.releaseStatus === "REVIEW_AND_VITALS_SYNCED" &&
      !googleCrashRate &&
      !googleAnrRate
    ) {
      alerts.push({
        level: "info",
        title: "Google vitals not returned yet",
        description:
          "Review sync çalışmış görünüyor ama crash / ANR değerleri henüz dönmemiş olabilir.",
      });
    }
  
    if (alerts.length === 0) {
      alerts.push({
        level: "healthy",
        title: "Operational health looks good",
        description:
          "Şu an için kritik bir stale data veya sync health uyarısı görünmüyor.",
      });
    }
  
    return (
      <div className="rounded-[1.6rem] border border-black/8 bg-[#f7f5ef] p-5">
        <div className="text-sm font-bold uppercase tracking-[0.16em] text-yellow-700">
          Health alerts
        </div>
  
        <div className="mt-5 space-y-3">
          {alerts.map((alert, index) => (
            <div
              key={`${alert.title}-${index}`}
              className={`rounded-[1.2rem] border px-4 py-4 ${getLevelClasses(
                alert.level,
              )}`}
            >
              <div className="text-sm font-bold uppercase tracking-[0.12em]">
                {alert.title}
              </div>
              <div className="mt-2 text-sm leading-7 opacity-90">
                {alert.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }