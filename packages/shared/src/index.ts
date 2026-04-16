export type ProviderType = "APPLE" | "GOOGLE";
export type LocaleCode = "en" | "tr";

export interface PublicStoreSummary {
  provider: ProviderType;
  rating: number | null;
  reviewCount: number | null;
  downloadEstimate: string | null;
  versionLabel: string | null;
  releaseStatus: string | null;
  lastSyncedAt: string | null;
}
