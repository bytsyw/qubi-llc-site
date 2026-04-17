import { PublicAppDto } from './dto/public-app.dto';

type AppEntity = {
  id: string;
  slug: string;
  internalName: string;
  isActive: boolean;
  contents: Array<{
    locale: string;
    name: string;
    shortName: string | null;
    type: string | null;
    badge: string | null;
    description: string | null;
    longDescription: string | null;
    highlights: unknown;
    screenshots: unknown;
    features: unknown;
    faqs: unknown;
    requirements: unknown;
    terms: unknown;
    steps: unknown;
    scores: unknown;
    screenGradient: string | null;
    glowClass: string | null;
    dark: boolean;
  }>;
  storeMappings: Array<{
    id: string;
    providerId: string;
    provider: {
      provider: 'APPLE' | 'GOOGLE';
    };
    storeAppId: string | null;
    bundleId: string | null;
    packageName: string | null;
    countryCode: string | null;
    discovered: boolean;
    isPrimary: boolean;
    lastDiscoveredAt: Date | null;
    lastSyncedAt: Date | null;
  }>;
  metricSnapshots: Array<{
    provider: 'APPLE' | 'GOOGLE';
    rating: number | null;
    reviewCount: number | null;
    downloadEstimate: string | null;
    versionLabel: string | null;
    releaseStatus: string | null;
    capturedAt: Date;
  }>;
  reviews: Array<{
    id: string;
    provider: 'APPLE' | 'GOOGLE';
    storeReviewId: string;
    locale: string | null;
    rating: number | null;
    title: string | null;
    body: string | null;
    authorName: string | null;
    reviewCreatedAt: Date | null;
    syncedAt: Date;
  }>;
  analytics: Array<{
    locale: string | null;
    parentsReached: number | null;
    repeatUsage: number | null;
    averageSessionText: string | null;
    trustScore: number | null;
    capturedAt: Date;
  }>;
};

export function mapPublicApp(app: AppEntity, locale: string): PublicAppDto {
  const content =
    app.contents.find((item) => item.locale === locale) ??
    app.contents.find((item) => item.locale === 'en') ??
    app.contents[0] ??
    null;

  const latestAppleMetrics =
    app.metricSnapshots.find((item) => item.provider === 'APPLE') ?? null;

  const latestGoogleMetrics =
    app.metricSnapshots.find((item) => item.provider === 'GOOGLE') ?? null;

  const latestAnalytics =
    app.analytics.find((item) => item.locale === locale) ??
    app.analytics.find((item) => item.locale === 'en') ??
    app.analytics[0] ??
    null;

  return {
    id: app.id,
    slug: app.slug,
    internalName: app.internalName,
    isActive: app.isActive,
    content: content
      ? {
          locale: content.locale,
          name: content.name,
          shortName: content.shortName,
          type: content.type,
          badge: content.badge,
          description: content.description,
          longDescription: content.longDescription,
          highlights: content.highlights,
          screenshots: content.screenshots,
          features: content.features,
          faqs: content.faqs,
          requirements: content.requirements,
          terms: content.terms,
          steps: content.steps,
          scores: content.scores,
          screenGradient: content.screenGradient,
          glowClass: content.glowClass,
          dark: content.dark,
        }
      : null,
    storeSnapshot: {
      apple: mapMetricSnapshot(latestAppleMetrics),
      google: mapMetricSnapshot(latestGoogleMetrics),
      lastSyncedAt:
        latestAppleMetrics?.capturedAt?.toISOString() ??
        latestGoogleMetrics?.capturedAt?.toISOString() ??
        null,
    },
    analyticsSnapshot: latestAnalytics
      ? {
          locale: latestAnalytics.locale,
          parentsReached: latestAnalytics.parentsReached,
          repeatUsage: latestAnalytics.repeatUsage,
          averageSessionText: latestAnalytics.averageSessionText,
          trustScore: latestAnalytics.trustScore,
          capturedAt: latestAnalytics.capturedAt.toISOString(),
        }
      : null,
    latestReviews: app.reviews.map((review) => ({
      id: review.id,
      provider: review.provider,
      storeReviewId: review.storeReviewId,
      locale: review.locale,
      rating: review.rating,
      title: review.title,
      body: review.body,
      authorName: review.authorName,
      reviewCreatedAt: review.reviewCreatedAt?.toISOString() ?? null,
      syncedAt: review.syncedAt.toISOString(),
    })),
    mappings: app.storeMappings.map((mapping) => ({
      id: mapping.id,
      providerId: mapping.providerId,
      provider: mapping.provider.provider,
      storeAppId: mapping.storeAppId,
      bundleId: mapping.bundleId,
      packageName: mapping.packageName,
      countryCode: mapping.countryCode,
      discovered: mapping.discovered,
      isPrimary: mapping.isPrimary,
      lastDiscoveredAt: mapping.lastDiscoveredAt?.toISOString() ?? null,
      lastSyncedAt: mapping.lastSyncedAt?.toISOString() ?? null,
    })),
  };
}

function mapMetricSnapshot(
  snapshot:
    | {
        provider: 'APPLE' | 'GOOGLE';
        rating: number | null;
        reviewCount: number | null;
        downloadEstimate: string | null;
        versionLabel: string | null;
        releaseStatus: string | null;
        capturedAt: Date;
      }
    | null
    | undefined,
) {
  if (!snapshot) {
    return {
      status: 'pending' as const,
      provider: null,
      rating: null,
      reviewCount: null,
      downloadEstimate: null,
      versionLabel: null,
      releaseStatus: null,
      capturedAt: null,
    };
  }

  return {
    status: 'connected' as const,
    provider: snapshot.provider,
    rating: snapshot.rating,
    reviewCount: snapshot.reviewCount,
    downloadEstimate: snapshot.downloadEstimate,
    versionLabel: snapshot.versionLabel,
    releaseStatus: snapshot.releaseStatus,
    capturedAt: snapshot.capturedAt.toISOString(),
  };
}
