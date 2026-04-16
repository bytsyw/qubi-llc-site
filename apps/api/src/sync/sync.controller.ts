import { Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { SyncService } from "./sync.service";
import { AdminSessionGuard } from "../security/admin-session.guard";
import { AuditService } from "../audit/audit.service";
import { AdminThrottlerGuard } from "../security/admin-throttler.guard";

@UseGuards(AdminSessionGuard, AdminThrottlerGuard)
@Throttle({ default: { limit: 30, ttl: 60000 } })
@Controller("admin/sync")
export class SyncController {
  constructor(
    private readonly syncService: SyncService,
    private readonly auditService: AuditService,
  ) {}

  @Get("runs")
  async getRecentRuns() {
    return this.syncService.getRecentRuns();
  }

  @Post("run")
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async runNow(@Req() req: any) {
    const result = await this.syncService.runProviderRegistrySync("manual");

    await this.auditService.logAction({
      adminEmail: req.adminSession?.email || "unknown",
      action: "MANUAL_REGISTRY_SYNC_TRIGGERED",
      entityType: "SyncRun",
      targetLabel: "registry",
      details: result,
    });

    return result;
  }

  @Post("reviews-metrics")
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async runReviewMetricSyncNow(@Req() req: any) {
    const result = await this.syncService.runReviewMetricSync("manual");

    await this.auditService.logAction({
      adminEmail: req.adminSession?.email || "unknown",
      action: "MANUAL_REVIEW_METRIC_SYNC_TRIGGERED",
      entityType: "SyncRun",
      targetLabel: "reviews-metrics",
      details: result,
    });

    return result;
  }
}