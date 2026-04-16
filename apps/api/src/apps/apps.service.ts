import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { ConnectionStatus, ProviderType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { mapPublicApp } from "./apps.mapper";
import { PublicAppDto } from "./dto/public-app.dto";
import { UpdateAppContentDto } from "./dto/update-app-content.dto";
import { UpdateAppMappingDto } from "./dto/update-app-mapping.dto";
@Injectable()
export class AppsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicApps(locale?: string): Promise<PublicAppDto[]> {
    const normalizedLocale = this.normalizeLocale(locale);

    const apps = await this.prisma.app.findMany({
      where: { isActive: true },
      include: {
        contents: true,
        storeMappings: {
          include: {
            provider: true,
          },
        },
        metricSnapshots: {
          orderBy: { capturedAt: "desc" },
          take: 10,
        },
        reviews: {
          orderBy: { syncedAt: "desc" },
          take: 5,
        },
        analytics: {
          orderBy: { capturedAt: "desc" },
          take: 5,
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return apps.map((app) => mapPublicApp(app, normalizedLocale));
  }

  async getPublicAppBySlug(slug: string, locale?: string): Promise<PublicAppDto> {
    const normalizedLocale = this.normalizeLocale(locale);

    const app = await this.prisma.app.findUnique({
      where: { slug },
      include: {
        contents: true,
        storeMappings: {
          include: {
            provider: true,
          },
        },
        metricSnapshots: {
          orderBy: { capturedAt: "desc" },
          take: 10,
        },
        reviews: {
          orderBy: { syncedAt: "desc" },
          take: 5,
        },
        analytics: {
          orderBy: { capturedAt: "desc" },
          take: 5,
        },
      },
    });

    if (!app) {
      throw new NotFoundException(`App not found for slug: ${slug}`);
    }

    return mapPublicApp(app, normalizedLocale);
  }

  async upsertAppContentBySlug(
    slug: string,
    locale: string,
    dto: UpdateAppContentDto,
  ): Promise<PublicAppDto> {
    const normalizedLocale = this.normalizeLocale(locale);

    const app = await this.prisma.app.findUnique({
      where: { slug },
      include: {
        contents: true,
      },
    });

    if (!app) {
      throw new NotFoundException(`App not found for slug: ${slug}`);
    }

    const existing =
      app.contents.find((item) => item.locale === normalizedLocale) ?? null;

    const contentData = {
      locale: normalizedLocale,
      name: dto.name ?? existing?.name ?? app.internalName,
      shortName: dto.shortName ?? existing?.shortName ?? null,
      type: dto.type ?? existing?.type ?? null,
      badge: dto.badge ?? existing?.badge ?? null,
      description: dto.description ?? existing?.description ?? null,
      longDescription: dto.longDescription ?? existing?.longDescription ?? null,
      highlights: dto.highlights ?? existing?.highlights ?? [],
      screenshots: dto.screenshots ?? existing?.screenshots ?? [],
      features: dto.features ?? existing?.features ?? [],
      faqs: dto.faqs ?? existing?.faqs ?? [],
      requirements: dto.requirements ?? existing?.requirements ?? [],
      terms: dto.terms ?? existing?.terms ?? [],
      steps: dto.steps ?? existing?.steps ?? [],
      scores: dto.scores ?? existing?.scores ?? [],
      screenGradient:
        dto.screenGradient ?? existing?.screenGradient ?? "from-[#fff8de] via-[#ffe58e] to-[#facc15]",
      glowClass: dto.glowClass ?? existing?.glowClass ?? "bg-yellow-300/55",
      dark: dto.dark ?? existing?.dark ?? false,
    };

    await this.prisma.appContent.upsert({
      where: {
        appId_locale: {
          appId: app.id,
          locale: normalizedLocale,
        },
      },
      update: contentData,
      create: {
        appId: app.id,
        ...contentData,
      },
    });

    return this.getPublicAppBySlug(slug, normalizedLocale);
  }
  async upsertAppMappingBySlug(
    slug: string,
    provider: string,
    dto: UpdateAppMappingDto,
  ): Promise<PublicAppDto> {
    const providerType = this.normalizeProvider(provider);
  
    const app = await this.prisma.app.findUnique({
      where: { slug },
    });
  
    if (!app) {
      throw new NotFoundException(`App not found for slug: ${slug}`);
    }
  
    const providerConnection = await this.prisma.providerConnection.upsert({
      where: { provider: providerType },
      update: {},
      create: {
        provider: providerType,
        status: ConnectionStatus.PENDING,
      },
    });
  
    const existingMapping = await this.prisma.appStoreMapping.findFirst({
      where: {
        appId: app.id,
        providerId: providerConnection.id,
      },
    });
  
    const mappingData = {
      storeAppId:
        dto.storeAppId !== undefined ? dto.storeAppId || null : existingMapping?.storeAppId ?? null,
      bundleId:
        dto.bundleId !== undefined ? dto.bundleId || null : existingMapping?.bundleId ?? null,
      packageName:
        dto.packageName !== undefined ? dto.packageName || null : existingMapping?.packageName ?? null,
      countryCode:
        dto.countryCode !== undefined ? dto.countryCode || null : existingMapping?.countryCode ?? "US",
      isPrimary: dto.isPrimary ?? existingMapping?.isPrimary ?? true,
      discovered: dto.discovered ?? existingMapping?.discovered ?? false,
      lastDiscoveredAt: existingMapping?.lastDiscoveredAt ?? null,
      lastSyncedAt: new Date(),
    };
  
    if (existingMapping) {
      await this.prisma.appStoreMapping.update({
        where: { id: existingMapping.id },
        data: mappingData,
      });
    } else {
      await this.prisma.appStoreMapping.create({
        data: {
          appId: app.id,
          providerId: providerConnection.id,
          ...mappingData,
        },
      });
    }
  
    return this.getPublicAppBySlug(slug, "en");
  }
  async getAdminAppMetricsBySlug(slug: string) {
    const app = await this.prisma.app.findUnique({
      where: { slug },
      include: {
        storeMappings: {
          include: {
            provider: true,
          },
        },
        metricSnapshots: {
          orderBy: { capturedAt: "desc" },
          take: 20,
        },
        reviews: {
          orderBy: { syncedAt: "desc" },
          take: 10,
        },
        analytics: {
          orderBy: { capturedAt: "desc" },
          take: 10,
        },
      },
    });
  
    if (!app) {
      throw new NotFoundException(`App not found for slug: ${slug}`);
    }
  
    const providerIds = app.storeMappings.map((item) => item.providerId);
  
    const syncRuns = providerIds.length
      ? await this.prisma.syncRun.findMany({
          where: {
            providerId: { in: providerIds },
          },
          include: {
            provider: true,
          },
          orderBy: { startedAt: "desc" },
          take: 50,
        })
      : [];
  
    const filteredSyncRuns = syncRuns.filter((item) => {
      const messageMatch =
        typeof item.message === "string" &&
        item.message.toLowerCase().includes(slug.toLowerCase());
  
      const rawPayload =
        item.rawPayload && typeof item.rawPayload === "object"
          ? (item.rawPayload as Record<string, unknown>)
          : null;
  
      const rawApp =
        rawPayload && typeof rawPayload.app === "string"
          ? rawPayload.app
          : null;
  
      const payloadMatch =
        typeof rawApp === "string" &&
        rawApp.toLowerCase() === slug.toLowerCase();
  
      return messageMatch || payloadMatch;
    });
  
    const recentSyncRuns = filteredSyncRuns.slice(0, 15);
  
    const mappingHints = app.storeMappings.map((item) => ({
      provider: item.provider.provider,
      storeAppId: item.storeAppId,
      bundleId: item.bundleId,
      packageName: item.packageName,
    }));
  
    const webhookEvents = await this.prisma.webhookEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 80,
    });
  
    const recentWebhookEvents = webhookEvents
      .filter((event) => this.matchesWebhookToApp(event, slug, mappingHints))
      .slice(0, 20);
  
    const latestAppleMetric =
      app.metricSnapshots.find((item) => item.provider === ProviderType.APPLE) ?? null;
  
    const latestGoogleMetric =
      app.metricSnapshots.find((item) => item.provider === ProviderType.GOOGLE) ?? null;
  
    const latestAnalytics = app.analytics[0] ?? null;
  
    const recentMetrics = app.metricSnapshots.map((item) => {
      const matchedSyncRun = this.findRelatedSyncRunForMetric(item, filteredSyncRuns);
  
      return {
        id: item.id,
        provider: item.provider,
        rating: item.rating,
        reviewCount: item.reviewCount,
        downloadEstimate: item.downloadEstimate,
        versionLabel: item.versionLabel,
        releaseStatus: item.releaseStatus,
        rawPayload: item.rawPayload,
        capturedAt: item.capturedAt.toISOString(),
        matchedSyncRun,
      };
    });
  
    return {
      app: {
        id: app.id,
        slug: app.slug,
        internalName: app.internalName,
      },
      latest: {
        apple: latestAppleMetric
          ? {
              provider: latestAppleMetric.provider,
              rating: latestAppleMetric.rating,
              reviewCount: latestAppleMetric.reviewCount,
              downloadEstimate: latestAppleMetric.downloadEstimate,
              versionLabel: latestAppleMetric.versionLabel,
              releaseStatus: latestAppleMetric.releaseStatus,
              rawPayload: latestAppleMetric.rawPayload,
              capturedAt: latestAppleMetric.capturedAt.toISOString(),
            }
          : null,
        google: latestGoogleMetric
          ? {
              provider: latestGoogleMetric.provider,
              rating: latestGoogleMetric.rating,
              reviewCount: latestGoogleMetric.reviewCount,
              downloadEstimate: latestGoogleMetric.downloadEstimate,
              versionLabel: latestGoogleMetric.versionLabel,
              releaseStatus: latestGoogleMetric.releaseStatus,
              rawPayload: latestGoogleMetric.rawPayload,
              capturedAt: latestGoogleMetric.capturedAt.toISOString(),
            }
          : null,
        analytics: latestAnalytics
          ? {
              locale: latestAnalytics.locale,
              parentsReached: latestAnalytics.parentsReached,
              repeatUsage: latestAnalytics.repeatUsage,
              averageSessionText: latestAnalytics.averageSessionText,
              trustScore: latestAnalytics.trustScore,
              capturedAt: latestAnalytics.capturedAt.toISOString(),
            }
          : null,
      },
      recentMetrics,
      recentReviews: app.reviews.map((item) => ({
        id: item.id,
        provider: item.provider,
        locale: item.locale,
        rating: item.rating,
        title: item.title,
        body: item.body,
        authorName: item.authorName,
        reviewCreatedAt: item.reviewCreatedAt?.toISOString() ?? null,
        syncedAt: item.syncedAt.toISOString(),
      })),
      recentSyncRuns: recentSyncRuns.map((item) => ({
        id: item.id,
        provider: item.provider.provider,
        jobType: item.jobType,
        status: item.status,
        message: item.message,
        startedAt: item.startedAt.toISOString(),
        finishedAt: item.finishedAt?.toISOString() ?? null,
        rawPayload: item.rawPayload,
      })),
      recentWebhookEvents: recentWebhookEvents.map((item) => ({
        id: item.id,
        source: item.source,
        eventType: item.eventType,
        externalEventId: item.externalEventId,
        processed: item.processed,
        processedAt: item.processedAt?.toISOString() ?? null,
        createdAt: item.createdAt.toISOString(),
        payload: item.payload,
      })),
      operationTimeline: {
        latestWebhookEvent: recentWebhookEvents[0]
          ? {
              id: recentWebhookEvents[0].id,
              source: recentWebhookEvents[0].source,
              eventType: recentWebhookEvents[0].eventType,
              externalEventId: recentWebhookEvents[0].externalEventId,
              processed: recentWebhookEvents[0].processed,
              processedAt: recentWebhookEvents[0].processedAt?.toISOString() ?? null,
              createdAt: recentWebhookEvents[0].createdAt.toISOString(),
            }
          : null,
        latestSyncRun: recentSyncRuns[0]
          ? {
              id: recentSyncRuns[0].id,
              provider: recentSyncRuns[0].provider.provider,
              jobType: recentSyncRuns[0].jobType,
              status: recentSyncRuns[0].status,
              message: recentSyncRuns[0].message,
              startedAt: recentSyncRuns[0].startedAt.toISOString(),
              finishedAt: recentSyncRuns[0].finishedAt?.toISOString() ?? null,
            }
          : null,
        latestMetricSnapshot: recentMetrics[0]
          ? {
              id: recentMetrics[0].id,
              provider: recentMetrics[0].provider,
              rating: recentMetrics[0].rating,
              reviewCount: recentMetrics[0].reviewCount,
              releaseStatus: recentMetrics[0].releaseStatus,
              capturedAt: recentMetrics[0].capturedAt,
            }
          : null,
      },
    };
  }
  private matchesWebhookToApp(
    event: {
      payload: unknown;
    },
    slug: string,
    mappingHints: Array<{
      provider: ProviderType;
      storeAppId: string | null;
      bundleId: string | null;
      packageName: string | null;
    }>,
  ) {
    const payloadText = JSON.stringify(event.payload ?? {}).toLowerCase();
    const normalizedSlug = slug.toLowerCase();
  
    if (payloadText.includes(normalizedSlug)) {
      return true;
    }
  
    for (const hint of mappingHints) {
      if (hint.storeAppId && payloadText.includes(hint.storeAppId.toLowerCase())) {
        return true;
      }
  
      if (hint.bundleId && payloadText.includes(hint.bundleId.toLowerCase())) {
        return true;
      }
  
      if (hint.packageName && payloadText.includes(hint.packageName.toLowerCase())) {
        return true;
      }
    }
  
    return false;
  }
  private findRelatedSyncRunForMetric(
    metric: {
      provider: ProviderType;
      capturedAt: Date;
    },
    syncRuns: Array<{
      id: string;
      jobType: any;
      status: any;
      message: string | null;
      startedAt: Date;
      finishedAt: Date | null;
      provider: {
        provider: ProviderType;
      };
    }>,
  ) {
    const metricTime = metric.capturedAt.getTime();
  
    const candidates = syncRuns
      .filter((run) => run.provider.provider === metric.provider)
      .filter((run) => {
        const anchor = run.finishedAt ?? run.startedAt;
        return anchor.getTime() <= metricTime;
      })
      .sort((a, b) => {
        const aAnchor = (a.finishedAt ?? a.startedAt).getTime();
        const bAnchor = (b.finishedAt ?? b.startedAt).getTime();
  
        return Math.abs(metricTime - aAnchor) - Math.abs(metricTime - bAnchor);
      });
  
    const match = candidates[0] ?? null;
  
    if (!match) {
      return null;
    }
  
    return {
      id: match.id,
      provider: match.provider.provider,
      jobType: match.jobType,
      status: match.status,
      message: match.message,
      startedAt: match.startedAt.toISOString(),
      finishedAt: match.finishedAt?.toISOString() ?? null,
    };
  }
  private normalizeProvider(provider: string): ProviderType {
    const normalized = provider.trim().toUpperCase();
  
    if (normalized === "APPLE") return ProviderType.APPLE;
    if (normalized === "GOOGLE") return ProviderType.GOOGLE;
  
    throw new BadRequestException(`Unsupported provider: ${provider}`);
  }

  private normalizeLocale(locale?: string) {
    if (!locale) return "en";
    return locale.toLowerCase().startsWith("tr") ? "tr" : "en";
  }
}