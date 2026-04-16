import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  ConnectionStatus,
  CredentialType,
  ProviderType,
} from "@prisma/client";
import jwt from "jsonwebtoken";
import { JWT } from "google-auth-library";
import { PrismaService } from "../prisma/prisma.service";
import { decryptJson, encryptJson } from "../common/encryption";
import { UpdateProviderCredentialsDto } from "./dto/update-provider-credentials.dto";

type StoredCredentialEnvelope = {
  provider: "APPLE" | "GOOGLE";
  savedAt: string;
  payload: string;
};

type AppleCredentialPayload = {
  issuerId: string;
  keyId: string;
  privateKey: string;
};

type GoogleServiceAccountPayload = {
  client_email: string;
  private_key: string;
  token_uri?: string;
};

export type NormalizedStoreReview = {
  storeReviewId: string;
  locale: string | null;
  rating: number | null;
  title: string | null;
  body: string | null;
  authorName: string | null;
  reviewCreatedAt: string | null;
};

@Injectable()
export class ProvidersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProviders() {
    const providers = await this.prisma.providerConnection.findMany({
      include: {
        credentials: true,
      },
      orderBy: { provider: "asc" },
    });

    return providers.map((provider) => ({
      id: provider.id,
      provider: provider.provider,
      status: provider.status,
      accountLabel: provider.accountLabel,
      lastCheckedAt: provider.lastCheckedAt?.toISOString() ?? null,
      lastError: provider.lastError,
      credentialCount: provider.credentials.length,
      hasCredentials: provider.credentials.length > 0,
      updatedAt: provider.updatedAt.toISOString(),
    }));
  }

  async saveCredentials(dto: UpdateProviderCredentialsDto) {
    const providerType =
      dto.provider === "APPLE" ? ProviderType.APPLE : ProviderType.GOOGLE;

    const credentialType =
      dto.provider === "APPLE"
        ? CredentialType.APPLE_P8
        : CredentialType.GOOGLE_SERVICE_ACCOUNT;

    if (dto.provider === "APPLE") {
      this.validateApplePayload(dto.payload);
    }

    if (dto.provider === "GOOGLE") {
      this.validateGooglePayload(dto.payload);
    }

    const connection = await this.prisma.providerConnection.upsert({
      where: { provider: providerType },
      update: {
        accountLabel: dto.accountLabel ?? null,
        status: ConnectionStatus.CONNECTED,
        lastCheckedAt: new Date(),
        lastError: null,
      },
      create: {
        provider: providerType,
        accountLabel: dto.accountLabel ?? null,
        status: ConnectionStatus.CONNECTED,
        lastCheckedAt: new Date(),
        lastError: null,
      },
    });

    const encryptedPayload = encryptJson({
      provider: dto.provider,
      savedAt: new Date().toISOString(),
      payload: dto.payload,
    });

    const existingCredential = await this.prisma.providerCredential.findFirst({
      where: {
        providerId: connection.id,
        type: credentialType,
      },
    });

    if (existingCredential) {
      await this.prisma.providerCredential.update({
        where: { id: existingCredential.id },
        data: {
          label: dto.accountLabel ?? dto.provider,
          encryptedPayload,
        },
      });
    } else {
      await this.prisma.providerCredential.create({
        data: {
          providerId: connection.id,
          type: credentialType,
          label: dto.accountLabel ?? dto.provider,
          encryptedPayload,
        },
      });
    }

    return this.getProviderByType(providerType);
  }

  async discoverAppleApps() {
    const provider = await this.prisma.providerConnection.findUnique({
      where: { provider: ProviderType.APPLE },
      include: { credentials: true },
    });

    if (!provider) {
      throw new NotFoundException("Apple provider is not configured.");
    }

    const credential = provider.credentials.find(
      (item) => item.type === CredentialType.APPLE_P8,
    );

    if (!credential) {
      throw new BadRequestException("Apple credentials were not found.");
    }

    const decrypted = decryptJson<StoredCredentialEnvelope>(
      credential.encryptedPayload,
    );

    const parsed = this.validateApplePayload(decrypted.payload);
    const token = this.createAppleJwt(parsed);

    const response = await fetch(
      "https://api.appstoreconnect.apple.com/v1/apps?limit=200",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const bodyText = await response.text();

      await this.prisma.providerConnection.update({
        where: { id: provider.id },
        data: {
          status: ConnectionStatus.ERROR,
          lastCheckedAt: new Date(),
          lastError: `Apple discovery failed (${response.status})`,
        },
      });

      throw new BadRequestException(
        `Apple discovery failed (${response.status}): ${bodyText}`,
      );
    }

    const body = (await response.json()) as {
      data?: Array<{
        id: string;
        attributes?: {
          name?: string;
          bundleId?: string;
          primaryLocale?: string;
        };
      }>;
    };

    type DiscoveredAppleApp = {
      appId: string;
      slug: string;
      internalName: string;
      appleAppId: string;
      bundleId: string | null;
    };

    const discoveredApps: DiscoveredAppleApp[] = [];

    for (const item of body.data ?? []) {
      const appName = item.attributes?.name?.trim() || `Apple App ${item.id}`;
      const bundleId = item.attributes?.bundleId?.trim() || null;
      const suggestedSlug = this.slugify(appName) || `apple-app-${item.id}`;

      const existingMapping = await this.prisma.appStoreMapping.findFirst({
        where: {
          providerId: provider.id,
          storeAppId: item.id,
        },
      });

      let app =
        existingMapping
          ? await this.prisma.app.findUnique({
              where: { id: existingMapping.appId },
            })
          : null;

      if (!app) {
        app =
          (await this.prisma.app.findFirst({
            where: {
              OR: [{ slug: suggestedSlug }, { internalName: appName }],
            },
          })) ?? null;
      }

      if (!app) {
        app = await this.prisma.app.create({
          data: {
            slug: await this.makeUniqueSlug(suggestedSlug),
            internalName: appName,
            isActive: true,
          },
        });
      }

      await this.prisma.appStoreMapping.upsert({
        where: {
          providerId_storeAppId: {
            providerId: provider.id,
            storeAppId: item.id,
          },
        },
        update: {
          bundleId,
          countryCode: "US",
          discovered: true,
          isPrimary: true,
          lastDiscoveredAt: new Date(),
          lastSyncedAt: new Date(),
        },
        create: {
          appId: app.id,
          providerId: provider.id,
          storeAppId: item.id,
          bundleId,
          countryCode: "US",
          discovered: true,
          isPrimary: true,
          lastDiscoveredAt: new Date(),
          lastSyncedAt: new Date(),
        },
      });

      const existingEnContent = await this.prisma.appContent.findFirst({
        where: {
          appId: app.id,
          locale: "en",
        },
      });

      if (!existingEnContent) {
        await this.prisma.appContent.create({
          data: {
            appId: app.id,
            locale: "en",
            name: appName,
            shortName: appName,
            type: "Discovered from Apple",
            badge: "Pending content",
            description: "",
            longDescription: "",
            highlights: [],
            screenshots: [],
            features: [],
            faqs: [],
            requirements: [],
            terms: [],
            steps: [],
            scores: [],
            screenGradient: "from-[#fff8de] via-[#ffe58e] to-[#facc15]",
            glowClass: "bg-yellow-300/55",
            dark: false,
          },
        });
      }

      discoveredApps.push({
        appId: app.id,
        slug: app.slug,
        internalName: app.internalName,
        appleAppId: item.id,
        bundleId,
      });
    }

    await this.prisma.providerConnection.update({
      where: { id: provider.id },
      data: {
        status: ConnectionStatus.CONNECTED,
        lastCheckedAt: new Date(),
        lastError: null,
      },
    });

    return {
      ok: true,
      discoveredCount: discoveredApps.length,
      apps: discoveredApps,
    };
  }

  async fetchAppleCustomerReviewsForApp(
    storeAppId: string,
  ): Promise<NormalizedStoreReview[]> {
    const credentials = await this.getAppleCredentialsFromStore();
    const token = this.createAppleJwt(credentials);

    const reviews: NormalizedStoreReview[] = [];
    let nextUrl:
      | string
      | null = `https://api.appstoreconnect.apple.com/v1/apps/${storeAppId}/customerReviews?limit=200`;
    let pageCount = 0;

    while (nextUrl && pageCount < 10) {
      const response = await fetch(nextUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new BadRequestException(
          `Apple review sync failed (${response.status}) for app ${storeAppId}.`,
        );
      }

      const body = (await response.json()) as {
        data?: Array<{
          id: string;
          attributes?: {
            rating?: number;
            title?: string;
            body?: string;
            reviewerNickname?: string;
            createdDate?: string;
            territory?: string;
          };
        }>;
        links?: {
          next?: string;
        };
      };

      for (const item of body.data ?? []) {
        reviews.push({
          storeReviewId: item.id,
          locale: item.attributes?.territory ?? null,
          rating: item.attributes?.rating ?? null,
          title: item.attributes?.title ?? null,
          body: item.attributes?.body ?? null,
          authorName: item.attributes?.reviewerNickname ?? null,
          reviewCreatedAt: item.attributes?.createdDate ?? null,
        });
      }

      nextUrl = body.links?.next ?? null;
      pageCount += 1;
    }

    return reviews;
  }

  async fetchGoogleReviewsForPackage(
    packageName: string,
  ): Promise<NormalizedStoreReview[]> {
    const credentials = await this.getGoogleServiceAccountFromStore();

    const client = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ["https://www.googleapis.com/auth/androidpublisher"],
    });

    const tokenResponse = await client.authorize();
    const accessToken = tokenResponse.access_token;

    if (!accessToken) {
      throw new BadRequestException("Google access token could not be created.");
    }

    const reviews: NormalizedStoreReview[] = [];
    let startIndex = 0;
    const maxResults = 100;
    let pageCount = 0;

    while (pageCount < 10) {
      const url = new URL(
        `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(
          packageName,
        )}/reviews`,
      );

      url.searchParams.set("startIndex", String(startIndex));
      url.searchParams.set("maxResults", String(maxResults));

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new BadRequestException(
          `Google review sync failed (${response.status}) for package ${packageName}: ${text}`,
        );
      }

      const body = (await response.json()) as {
        reviews?: Array<{
          reviewId: string;
          authorName?: string;
          comments?: Array<{
            userComment?: {
              text?: string;
              originalText?: string;
              starRating?: number;
              reviewerLanguage?: string;
              lastModified?: {
                seconds?: string;
                nanos?: number;
              };
            };
          }>;
        }>;
      };

      const pageReviews = body.reviews ?? [];
      if (pageReviews.length === 0) break;

      for (const review of pageReviews) {
        const userComment =
          review.comments?.find((item) => item.userComment)?.userComment ?? null;

        if (!userComment) continue;

        const rawText = userComment.text || userComment.originalText || "";
        const [possibleTitle, ...rest] = rawText.split("\t");
        const hasSplitTitle = rest.length > 0;

        reviews.push({
          storeReviewId: review.reviewId,
          locale: userComment.reviewerLanguage ?? null,
          rating: userComment.starRating ?? null,
          title: hasSplitTitle ? possibleTitle : null,
          body: hasSplitTitle ? rest.join(" ").trim() : rawText || null,
          authorName: review.authorName ?? null,
          reviewCreatedAt: this.googleTimestampToIso(userComment.lastModified),
        });
      }

      if (pageReviews.length < maxResults) break;

      startIndex += maxResults;
      pageCount += 1;
    }

    return reviews;
  }

  async fetchGoogleVitalsForPackage(packageName: string) {
    const credentials = await this.getGoogleServiceAccountFromStore();

    const client = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ["https://www.googleapis.com/auth/playdeveloperreporting"],
    });

    const tokenResponse = await client.authorize();
    const accessToken = tokenResponse.access_token;

    if (!accessToken) {
      throw new BadRequestException(
        "Google Reporting API access token could not be created.",
      );
    }

    const [crashRate, anrRate] = await Promise.all([
      this.queryGoogleMetricSet({
        accessToken,
        packageName,
        metricSet: "crashRateMetricSet",
        metrics: ["crashRate", "userPerceivedCrashRate"],
      }),
      this.queryGoogleMetricSet({
        accessToken,
        packageName,
        metricSet: "anrRateMetricSet",
        metrics: ["anrRate", "userPerceivedAnrRate"],
      }),
    ]);

    return {
      crashRate,
      anrRate,
    };
  }

  async getProviderByType(provider: ProviderType) {
    const record = await this.prisma.providerConnection.findUnique({
      where: { provider },
      include: {
        credentials: true,
      },
    });

    if (!record) {
      throw new NotFoundException(`Provider not found: ${provider}`);
    }

    return {
      id: record.id,
      provider: record.provider,
      status: record.status,
      accountLabel: record.accountLabel,
      lastCheckedAt: record.lastCheckedAt?.toISOString() ?? null,
      lastError: record.lastError,
      credentialCount: record.credentials.length,
      hasCredentials: record.credentials.length > 0,
      updatedAt: record.updatedAt.toISOString(),
    };
  }

  private async getAppleCredentialsFromStore(): Promise<AppleCredentialPayload> {
    const credential = await this.getStoredCredential(
      ProviderType.APPLE,
      CredentialType.APPLE_P8,
    );

    return this.validateApplePayload(credential.payload);
  }

  private async getGoogleServiceAccountFromStore(): Promise<GoogleServiceAccountPayload> {
    const credential = await this.getStoredCredential(
      ProviderType.GOOGLE,
      CredentialType.GOOGLE_SERVICE_ACCOUNT,
    );

    return this.validateGooglePayload(credential.payload);
  }

  private async getStoredCredential(
    providerType: ProviderType,
    credentialType: CredentialType,
  ): Promise<StoredCredentialEnvelope> {
    const provider = await this.prisma.providerConnection.findUnique({
      where: { provider: providerType },
      include: { credentials: true },
    });

    if (!provider) {
      throw new NotFoundException(`Provider not found: ${providerType}`);
    }

    const credential = provider.credentials.find(
      (item) => item.type === credentialType,
    );

    if (!credential) {
      throw new BadRequestException(
        `Credentials not found for provider: ${providerType}`,
      );
    }

    return decryptJson<StoredCredentialEnvelope>(credential.encryptedPayload);
  }

  private async queryGoogleMetricSet({
    accessToken,
    packageName,
    metricSet,
    metrics,
  }: {
    accessToken: string;
    packageName: string;
    metricSet: "crashRateMetricSet" | "anrRateMetricSet";
    metrics: string[];
  }) {
    const response = await fetch(
      `https://playdeveloperreporting.googleapis.com/v1alpha1/apps/${encodeURIComponent(
        packageName,
      )}/${metricSet}:query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timelineSpec: {
            aggregationPeriod: "DAILY",
            startTime: this.toGoogleDateTimeUtc(2),
            endTime: this.toGoogleDateTimeUtc(0),
          },
          metrics,
          pageSize: 1,
        }),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new BadRequestException(
        `Google Reporting API ${metricSet} query failed (${response.status}) for ${packageName}: ${text}`,
      );
    }

    const body = (await response.json()) as {
      rows?: Array<{
        startTime?: unknown;
        metricValues?: Array<{
          metric?: string;
          decimalValue?: {
            value?: string;
          };
        }>;
      }>;
    };

    const firstRow = body.rows?.[0] ?? null;

    return {
      metricSet,
      rowsReturned: body.rows?.length ?? 0,
      metrics: firstRow?.metricValues ?? [],
      row: firstRow ?? null,
    };
  }

  private createAppleJwt(credentials: AppleCredentialPayload) {
    const now = Math.floor(Date.now() / 1000);

    return jwt.sign(
      {
        iss: credentials.issuerId,
        aud: "appstoreconnect-v1",
        iat: now,
        exp: now + 60 * 15,
      },
      credentials.privateKey,
      {
        algorithm: "ES256",
        header: {
          alg: "ES256",
          kid: credentials.keyId,
          typ: "JWT",
        },
      },
    );
  }

  private validateApplePayload(payload: string): AppleCredentialPayload {
    let parsed: unknown;

    try {
      parsed = JSON.parse(payload);
    } catch {
      throw new BadRequestException(
        'Apple payload must be valid JSON with "issuerId", "keyId" and "privateKey".',
      );
    }

    const value = parsed as Partial<AppleCredentialPayload>;

    if (!value.issuerId || !value.keyId || !value.privateKey) {
      throw new BadRequestException(
        'Apple payload must contain "issuerId", "keyId" and "privateKey".',
      );
    }

    return {
      issuerId: value.issuerId,
      keyId: value.keyId,
      privateKey: value.privateKey,
    };
  }

  private validateGooglePayload(payload: string): GoogleServiceAccountPayload {
    let parsed: unknown;

    try {
      parsed = JSON.parse(payload);
    } catch {
      throw new BadRequestException(
        'Google payload must be valid JSON with "client_email" and "private_key".',
      );
    }

    const value = parsed as Partial<GoogleServiceAccountPayload>;

    if (!value.client_email || !value.private_key) {
      throw new BadRequestException(
        'Google payload must contain "client_email" and "private_key".',
      );
    }

    return {
      client_email: value.client_email,
      private_key: value.private_key,
      token_uri: value.token_uri,
    };
  }

  private googleTimestampToIso(
    value:
      | {
          seconds?: string;
          nanos?: number;
        }
      | null
      | undefined,
  ) {
    if (!value?.seconds) return null;

    const milliseconds = Number(value.seconds) * 1000;
    if (Number.isNaN(milliseconds)) return null;

    return new Date(milliseconds).toISOString();
  }

  private toGoogleDateTimeUtc(daysAgo: number) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - daysAgo);

    return {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate(),
      hours: 0,
      minutes: 0,
      seconds: 0,
      nanos: 0,
      utcOffset: "0s",
    };
  }

  private slugify(input: string) {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  private async makeUniqueSlug(baseSlug: string) {
    let slug = baseSlug;
    let counter = 2;

    while (await this.prisma.app.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    return slug;
  }
}