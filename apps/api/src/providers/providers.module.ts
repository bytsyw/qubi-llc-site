import { Module } from "@nestjs/common";
import { ProvidersController } from "./providers.controller";
import { ProvidersService } from "./providers.service";
import { SecurityModule } from "../security/security.module";
import { AuditModule } from "../audit/audit.module";

@Module({
  imports: [SecurityModule, AuditModule],
  controllers: [ProvidersController],
  providers: [ProvidersService],
  exports: [ProvidersService],
})
export class ProvidersModule {}