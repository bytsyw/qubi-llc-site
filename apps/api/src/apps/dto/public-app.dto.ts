export interface PublicAppContentDto {
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
  }
  
  export interface PublicStoreMetricSnapshotDto {
    status: "pending" | "connected";
    provider: "APPLE" | "GOOGLE" | null;
    rating: number | null;
    reviewCount: number | null;
    downloadEstimate: string | null;
    versionLabel: string | null;
    releaseStatus: string | null;
    capturedAt: string | null;
  }
  
  export interface PublicStoreSnapshotDto {
    apple: PublicStoreMetricSnapshotDto;
    google: PublicStoreMetricSnapshotDto;
    lastSyncedAt: string | null;
  }
  
  export interface PublicAnalyticsSnapshotDto {
    locale: string | null;
    parentsReached: number | null;
    repeatUsage: number | null;
    averageSessionText: string | null;
    trustScore: number | null;
    capturedAt: string;
  }
  
  export interface PublicReviewDto {
    id: string;
    provider: "APPLE" | "GOOGLE";
    storeReviewId: string;
    locale: string | null;
    rating: number | null;
    title: string | null;
    body: string | null;
    authorName: string | null;
    reviewCreatedAt: string | null;
    syncedAt: string;
  }
  
  export interface PublicAppMappingDto {
    id: string;
    providerId: string;
    storeAppId: string | null;
    bundleId: string | null;
    packageName: string | null;
    countryCode: string | null;
    discovered: boolean;
    isPrimary: boolean;
    lastDiscoveredAt: string | null;
    lastSyncedAt: string | null;
  }
  
  export interface PublicAppDto {
    id: string;
    slug: string;
    internalName: string;
    isActive: boolean;
    content: PublicAppContentDto | null;
    storeSnapshot: PublicStoreSnapshotDto;
    analyticsSnapshot: PublicAnalyticsSnapshotDto | null;
    latestReviews: PublicReviewDto[];
    mappings: PublicAppMappingDto[];
  }