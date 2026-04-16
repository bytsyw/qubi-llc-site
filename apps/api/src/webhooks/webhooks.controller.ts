import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { WebhooksService } from "./webhooks.service";
import { AdminSessionGuard } from "../security/admin-session.guard";
import { AuditService } from "../audit/audit.service";
import { AdminThrottlerGuard } from "../security/admin-throttler.guard";

@Controller()
export class WebhooksController {
  constructor(
    private readonly webhooksService: WebhooksService,
    private readonly auditService: AuditService,
  ) {}

  @Post("webhooks/apple/app-store")
  async ingestApple(@Body() body: any) {
    return this.webhooksService.ingestAppleNotification(body);
  }

  @Post("webhooks/google/rtdn")
  async ingestGoogle(
    @Body() body: any,
    @Headers("authorization") authorization?: string,
  ) {
    return this.webhooksService.ingestGoogleRtdn(body, authorization);
  }

  @UseGuards(AdminSessionGuard, AdminThrottlerGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Get("admin/webhooks/events")
  async getEvents() {
    return this.webhooksService.getRecentWebhookEvents();
  }

  @UseGuards(AdminSessionGuard, AdminThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post("admin/webhooks/process-pending")
  async processPending(@Req() req: any) {
    const result = await this.webhooksService.processPendingEvents();

    await this.auditService.logAction({
      adminEmail: req.adminSession?.email || "unknown",
      action: "PENDING_WEBHOOKS_PROCESSED",
      entityType: "WebhookEvent",
      targetLabel: "process-pending",
      details: result,
    });

    return result;
  }
}