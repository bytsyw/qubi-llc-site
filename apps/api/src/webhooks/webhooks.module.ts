import { Module } from "@nestjs/common";
import { WebhooksController } from "./webhooks.controller";
import { WebhooksService } from "./webhooks.service";
import { WebhookVerifierService } from "./webhook-verifier.service";
import { SecurityModule } from "../security/security.module";
import { AuditModule } from "../audit/audit.module";

@Module({
  imports: [SecurityModule, AuditModule],
  controllers: [WebhooksController],
  providers: [WebhooksService, WebhookVerifierService],
  exports: [WebhooksService],
})
export class WebhooksModule {}