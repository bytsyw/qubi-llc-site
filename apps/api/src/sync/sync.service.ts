import { Injectable, Logger } from "@nestjs/common";
import {
  ProviderType,
  SyncJobType,
  SyncRunStatus,
} from "@prisma/client";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";
import { ProvidersService } from "../providers/providers.service";

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly providersService: ProvidersService,
  ) {}

  @Cron("0 */30 * * * *", {
    name: "provider-registry-sync",
    waitForCompletion: true,
  })
  async handleScheduledRegistrySync() {
    await this.runProviderRegistrySync("scheduled");
  }

  @Cron("0 */20 * * * *", {
    name: "review-metric-sync",
    waitForCompletion: true,
  })
  async handleScheduledReviewMetricSync() {
    await this.runReviewMetricSync("scheduled");
  }

  async runProviderRegistrySync(trigger: "manual" | "scheduled" = "manual") {
    const providers = await this.prisma.providerConnection.findMany({
      include: {
        credentials: true,
      },
      orderBy: { provider: "asc" },
    });

    const results: Array<Record<string, unknown>> = [];

    for (const provider of providers) {
      if (provider.provider === ProviderType.APPLE) {
        if (provider.credentials.length === 0) {
          const run = await this.prisma.syncRun.create({
            data: {
              providerId: provider.id,
              jobType: SyncJobType.APP_DISCOVERY,
              status: SyncRunStatus.SUCCESS,
              startedAt: new Date(),
              finishedAt: new Date(),
              message: `Apple discovery skipped (${trigger}) because no credentials are saved yet.`,
            },
          });

          results.push({
            provider: "APPLE",
            status: run.status,
            message: run.message,
          });

          continue;
        }

        results.push(await this.runAppleDiscovery(provider.id, trigger));
        continue;
      }

      if (provider.provider === ProviderType.GOOGLE) {
        results.push(await this.runGoogleSkeleton(provider.id, trigger));
      }
    }

    return {
      ok: true,
      trigger,
      results,
    };
  }

  async runReviewMetricSync(trigger: "manual" | "scheduled" = "manual") {
    const apps = await this.prisma.app.findMany({
      where: { isActive: true },
      include: {
        storeMappings: {
          include: {
            provider: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const results: Array<Record<string, unknown>> = [];

    for (const app of apps) {
      for (const mapping of app.storeMappings) {
        if (
          mapping.provider.provider === ProviderType.APPLE &&
          mapping.storeAppId
        ) {
          results.push(
            await this.syncAppleReviewsForApp({
              appId: app.id,
              slug: app.slug,
              providerId: mapping.providerId,
              storeAppId: mapping.storeAppId,
              trigger,
            }),
          );
        }

        if (
          mapping.provider.provider === ProviderType.GOOGLE &&
          mapping.packageName
        ) {
          results.push(
            await this.syncGoogleReviewsForApp({
              appId: app.id,
              slug: app.slug,
              providerId: mapping.providerId,
              packageName: mapping.packageName,
              trigger,
            }),
          );
        }
      }
    }

    return {
      ok: true,
      trigger,
      results,
    };
  }

  async getRecentRuns() {
    const runs = await this.prisma.syncRun.findMany({
      include: {
        provider: true,
      },
      orderBy: { startedAt: "desc" },
      take: 30,
    });

    return runs.map((run) => ({
      id: run.id,
      provider: run.provider.provider,
      jobType: run.jobType,
      status: run.status,
      startedAt: run.startedAt.toISOString(),
      finishedAt: run.finishedAt?.toISOString() ?? null,
      message: run.message,
    }));
  }

  private async runAppleDiscovery(
    providerId: string,
    trigger: "manual" | "scheduled",
  ) {
    const run = await this.prisma.syncRun.create({
      data: {
        providerId,
        jobType: SyncJobType.APP_DISCOVERY,
        status: SyncRunStatus.RUNNING,
        startedAt: new Date(),
        message: `Apple discovery started (${trigger}).`,
      },
    });

    try {
      const result = await this.providersService.discoverAppleApps();

      await this.prisma.syncRun.update({
        where: { id: run.id },
        data: {
          status: SyncRunStatus.SUCCESS,
          finishedAt: new Date(),
          message: `Apple discovery completed (${trigger}).`,
          rawPayload: result as any,
        },
      });

      return {
        provider: "APPLE",
        status: "SUCCESS",
        ...result,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Apple discovery failed.";

      this.logger.error(message);

      await this.prisma.syncRun.update({
        where: { id: run.id },
        data: {
          status: SyncRunStatus.FAILED,
          finishedAt: new Date(),
          message,
        },
      });

      return {
        provider: "APPLE",
        status: "FAILED",
        message,
      };
    }
  }

  private async runGoogleSkeleton(
    providerId: string,
    trigger: "manual" | "scheduled",
  ) {
    const message = `Google registry skeleton ran (${trigger}). Mapping is ready; discovery is not required, and package-based sync is enabled separately.`;

    const run = await this.prisma.syncRun.create({
      data: {
        providerId,
        jobType: SyncJobType.METRICS,
        status: SyncRunStatus.SUCCESS,
        startedAt: new Date(),
        finishedAt: new Date(),
        message,
      },
    });

    return {
      provider: "GOOGLE",
      status: run.status,
      message: run.message,
    };
  }

  private async syncAppleReviewsForApp({
    appId,
    slug,
    providerId,
    storeAppId,
    trigger,
  }: {
    appId: string;
    slug: string;
    providerId: string;
    storeAppId: string;
    trigger: "manual" | "scheduled";
  }) {
    const run = await this.prisma.syncRun.create({
      data: {
        providerId,
        jobType: SyncJobType.REVIEWS,
        status: SyncRunStatus.RUNNING,
        startedAt: new Date(),
        message: `Apple review sync started for ${slug} (${trigger}).`,
      },
    });

    try {
      const reviews =
        await this.providersService.fetchAppleCustomerReviewsForApp(storeAppId);

      for (const review of reviews) {
        await this.prisma.storeReview.upsert({
          where: {
            provider_storeReviewId: {
              provider: ProviderType.APPLE,
              storeReviewId: review.storeReviewId,
            },
          },
          update: {
            appId,
            locale: review.locale,
            rating: review.rating,
            title: review.title,
            body: review.body,
            authorName: review.authorName,
            reviewCreatedAt: review.reviewCreatedAt
              ? new Date(review.reviewCreatedAt)
              : null,
            syncedAt: new Date(),
          },
          create: {
            appId,
            provider: ProviderType.APPLE,
            storeReviewId: review.storeReviewId,
            locale: review.locale,
            rating: review.rating,
            title: review.title,
            body: review.body,
            authorName: review.authorName,
            reviewCreatedAt: review.reviewCreatedAt
              ? new Date(review.reviewCreatedAt)
              : null,
            syncedAt: new Date(),
          },
        });
      }

      const allReviews = await this.prisma.storeReview.findMany({
        where: {
          appId,
          provider: ProviderType.APPLE,
        },
      });

      const rating = this.calculateAverageRating(allReviews);

      await this.prisma.storeMetricSnapshot.create({
        data: {
          appId,
          provider: ProviderType.APPLE,
          rating,
          reviewCount: allReviews.length,
          downloadEstimate: null,
          versionLabel: null,
          releaseStatus: "REVIEW_SYNCED",
          rawPayload: {
            syncedReviewCount: reviews.length,
          } as any,
        },
      });

      await this.prisma.syncRun.update({
        where: { id: run.id },
        data: {
          status: SyncRunStatus.SUCCESS,
          finishedAt: new Date(),
          message: `Apple review sync completed for ${slug} (${trigger}).`,
          rawPayload: {
            syncedReviewCount: reviews.length,
          } as any,
        },
      });

      return {
        provider: "APPLE",
        app: slug,
        status: "SUCCESS",
        syncedReviewCount: reviews.length,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Apple review sync failed.";

      const shouldSkip = this.isSkippableAppleCredentialError(message);

      await this.prisma.syncRun.update({
        where: { id: run.id },
        data: {
          status: shouldSkip ? SyncRunStatus.SUCCESS : SyncRunStatus.FAILED,
          finishedAt: new Date(),
          message: shouldSkip
            ? `Apple review sync skipped for ${slug} until valid Apple credentials are saved.`
            : message,
        },
      });

      return {
        provider: "APPLE",
        app: slug,
        status: shouldSkip ? "SKIPPED" : "FAILED",
        message: shouldSkip
          ? "Apple credentials are not ready yet."
          : message,
      };
    }
  }

  private async syncGoogleReviewsForApp({
    appId,
    slug,
    providerId,
    packageName,
    trigger,
  }: {
    appId: string;
    slug: string;
    providerId: string;
    packageName: string;
    trigger: "manual" | "scheduled";
  }) {
    const run = await this.prisma.syncRun.create({
      data: {
        providerId,
        jobType: SyncJobType.REVIEWS,
        status: SyncRunStatus.RUNNING,
        startedAt: new Date(),
        message: `Google review sync started for ${slug} (${trigger}).`,
      },
    });

    try {
      const reviews =
        await this.providersService.fetchGoogleReviewsForPackage(packageName);

      const vitals =
        await this.providersService.fetchGoogleVitalsForPackage(packageName);

      for (const review of reviews) {
        await this.prisma.storeReview.upsert({
          where: {
            provider_storeReviewId: {
              provider: ProviderType.GOOGLE,
              storeReviewId: review.storeReviewId,
            },
          },
          update: {
            appId,
            locale: review.locale,
            rating: review.rating,
            title: review.title,
            body: review.body,
            authorName: review.authorName,
            reviewCreatedAt: review.reviewCreatedAt
              ? new Date(review.reviewCreatedAt)
              : null,
            syncedAt: new Date(),
          },
          create: {
            appId,
            provider: ProviderType.GOOGLE,
            storeReviewId: review.storeReviewId,
            locale: review.locale,
            rating: review.rating,
            title: review.title,
            body: review.body,
            authorName: review.authorName,
            reviewCreatedAt: review.reviewCreatedAt
              ? new Date(review.reviewCreatedAt)
              : null,
            syncedAt: new Date(),
          },
        });
      }

      const allReviews = await this.prisma.storeReview.findMany({
        where: {
          appId,
          provider: ProviderType.GOOGLE,
        },
      });

      const rating = this.calculateAverageRating(allReviews);

      await this.prisma.storeMetricSnapshot.create({
        data: {
          appId,
          provider: ProviderType.GOOGLE,
          rating,
          reviewCount: allReviews.length,
          downloadEstimate: null,
          versionLabel: null,
          releaseStatus: "REVIEW_AND_VITALS_SYNCED",
          rawPayload: {
            syncedReviewCount: reviews.length,
            vitals,
          } as any,
        },
      });

      await this.prisma.syncRun.update({
        where: { id: run.id },
        data: {
          status: SyncRunStatus.SUCCESS,
          finishedAt: new Date(),
          message: `Google review + vitals sync completed for ${slug} (${trigger}).`,
          rawPayload: {
            syncedReviewCount: reviews.length,
            vitals,
          } as any,
        },
      });

      return {
        provider: "GOOGLE",
        app: slug,
        status: "SUCCESS",
        syncedReviewCount: reviews.length,
        vitals,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Google review sync failed.";

      await this.prisma.syncRun.update({
        where: { id: run.id },
        data: {
          status: SyncRunStatus.FAILED,
          finishedAt: new Date(),
          message,
        },
      });

      return {
        provider: "GOOGLE",
        app: slug,
        status: "FAILED",
        message,
      };
    }
  }

  private calculateAverageRating(
    reviews: Array<{ rating: number | null }>,
  ): number | null {
    const rated = reviews.filter((item) => typeof item.rating === "number");

    if (rated.length === 0) {
      return null;
    }

    return Number(
      (
        rated.reduce((sum, item) => sum + (item.rating ?? 0), 0) /
        rated.length
      ).toFixed(2),
    );
  }

  private isSkippableAppleCredentialError(message: string) {
    return (
      message.includes('Apple payload must be valid JSON') ||
      message.includes('Apple payload must contain') ||
      message.includes('Credentials not found for provider: APPLE') ||
      message.includes('Apple credentials were not found')
    );
  }
}