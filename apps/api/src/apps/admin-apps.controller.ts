import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { AppsService } from "./apps.service";
import { UpdateAppContentDto } from "./dto/update-app-content.dto";
import { UpdateAppMappingDto } from "./dto/update-app-mapping.dto";
import { AdminSessionGuard } from "../security/admin-session.guard";
import { AuditService } from "../audit/audit.service";
import { AdminThrottlerGuard } from "../security/admin-throttler.guard";

@UseGuards(AdminSessionGuard, AdminThrottlerGuard)
@Throttle({ default: { limit: 90, ttl: 60000 } })
@Controller("admin/apps")
export class AdminAppsController {
  constructor(
    private readonly appsService: AppsService,
    private readonly auditService: AuditService,
  ) {}

  @Get(":slug/metrics")
  async getAppMetrics(@Param("slug") slug: string) {
    return this.appsService.getAdminAppMetricsBySlug(slug);
  }

  @Patch(":slug/content/:locale")
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async updateAppContent(
    @Param("slug") slug: string,
    @Param("locale") locale: string,
    @Body() body: UpdateAppContentDto,
    @Req() req: any,
  ) {
    const result = await this.appsService.upsertAppContentBySlug(slug, locale, body);

    await this.auditService.logAction({
      adminEmail: req.adminSession?.email || "unknown",
      action: "APP_CONTENT_UPDATED",
      entityType: "AppContent",
      entityId: result?.id ?? null,
      targetLabel: `${slug}:${locale}`,
      details: {
        slug,
        locale,
        fields: Object.keys(body || {}),
      },
    });

    return result;
  }

  @Patch(":slug/mapping/:provider")
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async updateAppMapping(
    @Param("slug") slug: string,
    @Param("provider") provider: string,
    @Body() body: UpdateAppMappingDto,
    @Req() req: any,
  ) {
    const result = await this.appsService.upsertAppMappingBySlug(slug, provider, body);

    await this.auditService.logAction({
      adminEmail: req.adminSession?.email || "unknown",
      action: "APP_MAPPING_UPDATED",
      entityType: "AppStoreMapping",
      entityId: result?.id ?? null,
      targetLabel: `${slug}:${provider}`,
      details: {
        slug,
        provider,
        fields: Object.keys(body || {}),
      },
    });

    return result;
  }
}