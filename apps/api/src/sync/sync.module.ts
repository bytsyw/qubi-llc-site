import { Module } from "@nestjs/common";
import { SyncController } from "./sync.controller";
import { SyncService } from "./sync.service";
import { ProvidersModule } from "../providers/providers.module";
import { SecurityModule } from "../security/security.module";
import { AuditModule } from "../audit/audit.module";

@Module({
  imports: [ProvidersModule, SecurityModule, AuditModule],
  controllers: [SyncController],
  providers: [SyncService],
})
export class SyncModule {}