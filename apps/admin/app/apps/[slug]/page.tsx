import Link from "next/link";
import AdminShell from "@/components/admin-shell";
import AppContentEditor from "@/components/app-content-editor";
import AppMappingEditor from "@/components/app-mapping-editor";
import AppMetricsPanel from "@/components/app-metrics-panel";
import AppOperationsPanel from "@/components/app-operations-panel";
import AppOperationsTimeline from "@/components/app-operations-timeline";
import AppEventFlow from "@/components/app-event-flow";
import AppHealthAlerts from "@/components/app-health-alerts";
import { getAdminAppMetrics, getAdminPublicApp } from "@/lib/server-api";

type PublicApp = {
  id: string;
  slug: string;
  internalName: string;
  isActive: boolean;
  content: {
    locale: string;
    name: string | null;
    shortName: string | null;
    type: string | null;
    badge: string | null;
    description: string | null;
    longDescription: string | null;
    highlights: string[] | null;
    screenshots: string[] | null;
    features: string[] | null;
    faqs: Array<{ question: string; answer: string }> | null;
    requirements: string[] | null;
    terms: string[] | null;
    steps: string[] | null;
    scores: Array<{ label: string; value: number }> | null;
    screenGradient: string | null;
    glowClass: string | null;
    dark: boolean;
  } | null;
  mappings: Array<{
    id: string;
    providerId: string;
    provider: "APPLE" | "GOOGLE";
    storeAppId: string | null;
    bundleId: string | null;
    packageName: string | null;
    countryCode: string | null;
    discovered: boolean;
    isPrimary: boolean;
    lastDiscoveredAt: string | null;
    lastSyncedAt: string | null;
  }>;
  storeSnapshot: {
    apple: {
      status: "pending" | "connected";
      rating: number | null;
      reviewCount: number | null;
      downloadEstimate: string | null;
      versionLabel: string | null;
      releaseStatus: string | null;
      capturedAt: string | null;
    };
    google: {
      status: "pending" | "connected";
      rating: number | null;
      reviewCount: number | null;
      downloadEstimate: string | null;
      versionLabel: string | null;
      releaseStatus: string | null;
      capturedAt: string | null;
    };
    lastSyncedAt: string | null;
  };
  analyticsSnapshot: {
    locale: string | null;
    parentsReached: number | null;
    repeatUsage: number | null;
    averageSessionText: string | null;
    trustScore: number | null;
    capturedAt: string;
  } | null;
};

export default async function AppDetailAdminPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let appEn: PublicApp | null = null;
  let appTr: PublicApp | null = null;
  let metrics: any = null;
  let hasError = false;

  try {
    [appEn, appTr, metrics] = await Promise.all([
      getAdminPublicApp(slug, "en"),
      getAdminPublicApp(slug, "tr"),
      getAdminAppMetrics(slug),
    ]);
  } catch {
    hasError = true;
  }

  if (hasError || !appEn) {
    return (
      <AdminShell
        title="App content"
        description="The application content editor could not load this record."
      >
        <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          App data could not be loaded from the backend.
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title={`App content · ${appEn.content?.name || appEn.internalName}`}
      description="This screen now supports direct updates to localized content. Authentication and provider-bound write permissions will be added later."
    >
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/apps"
          className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[#111111]"
        >
          Back to apps
        </Link>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <section className="rounded-[2rem] border border-black/8 bg-white/80 p-6 xl:col-span-2">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-700">
            Localized content
          </div>
          <h2 className="mt-3 text-2xl font-black tracking-tight">
            English / Turkish editor
          </h2>

          <div className="mt-6">
            <AppContentEditor
              slug={slug}
              initialEn={appEn.content}
              initialTr={appTr?.content ?? null}
            />
          </div>
          <div className="mt-8 border-t border-black/8 pt-8">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-700">
              Store mapping
            </div>
            <h2 className="mt-3 text-2xl font-black tracking-tight">
              Apple / Google mapping editor
            </h2>

            <div className="mt-6">
              <AppMappingEditor slug={slug} mappings={appEn.mappings || []} />
            </div>
            <div className="mt-8 border-t border-black/8 pt-8">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-700">
                Metrics
              </div>
              <h2 className="mt-3 text-2xl font-black tracking-tight">
                Latest store and vitals snapshot
              </h2>

              <div className="mt-6">
                <AppMetricsPanel
                  apple={metrics?.latest?.apple ?? null}
                  google={metrics?.latest?.google ?? null}
                  analytics={metrics?.latest?.analytics ?? null}
                />
              </div>
              <div className="mt-8">
                <AppHealthAlerts
                  metrics={metrics?.recentMetrics ?? []}
                  syncRuns={metrics?.recentSyncRuns ?? []}
                  webhookEvents={metrics?.recentWebhookEvents ?? []}
                />
              </div>
              <div className="mt-8">
                <AppOperationsPanel
                  metrics={metrics?.recentMetrics ?? []}
                  syncRuns={metrics?.recentSyncRuns ?? []}
                  webhookEvents={metrics?.recentWebhookEvents ?? []}
                />
              </div>
              <div className="mt-8">
                <AppOperationsTimeline timeline={metrics?.operationTimeline ?? null} />
              </div>
              <div className="mt-8">
                <AppEventFlow
                  webhookEvents={metrics?.recentWebhookEvents ?? []}
                  syncRuns={metrics?.recentSyncRuns ?? []}
                  metrics={metrics?.recentMetrics ?? []}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <InfoCard
            title="Store snapshot"
            items={[
              `Apple status: ${appEn.storeSnapshot.apple.status}`,
              `Google status: ${appEn.storeSnapshot.google.status}`,
              `Apple rating: ${appEn.storeSnapshot.apple.rating ?? "—"}`,
              `Google rating: ${appEn.storeSnapshot.google.rating ?? "—"}`,
              `Last sync: ${appEn.storeSnapshot.lastSyncedAt ?? "—"}`,
            ]}
          />

          <InfoCard
            title="Analytics snapshot"
            items={[
              `Parents reached: ${appEn.analyticsSnapshot?.parentsReached ?? "—"}`,
              `Repeat usage: ${appEn.analyticsSnapshot?.repeatUsage ?? "—"}`,
              `Average session: ${appEn.analyticsSnapshot?.averageSessionText ?? "—"}`,
              `Trust score: ${appEn.analyticsSnapshot?.trustScore ?? "—"}`,
            ]}
          />
        </section>
      </div>
    </AdminShell>
  );
}

function InfoCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[2rem] border border-black/8 bg-white/80 p-6">
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-700">
        {title}
      </div>

      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-[1.3rem] border border-black/8 bg-[#f7f5ef] px-4 py-3 text-sm text-black/70"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
