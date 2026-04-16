import { Module } from "@nestjs/common";
import { AppsService } from "./apps.service";
import { PublicAppsController } from "./public-apps.controller";
import { AdminAppsController } from "./admin-apps.controller";
import { SecurityModule } from "../security/security.module";
import { AuditModule } from "../audit/audit.module";

@Module({
  imports: [SecurityModule, AuditModule],
  providers: [AppsService],
  controllers: [PublicAppsController, AdminAppsController],
})
export class AppsModule {}