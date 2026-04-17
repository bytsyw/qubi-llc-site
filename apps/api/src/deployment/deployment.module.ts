import { Module } from '@nestjs/common';
import { DeploymentService } from './deployment.service';
import { DeploymentController } from './deployment.controller';
import { SecurityModule } from '../security/security.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [SecurityModule, AuditModule],
  providers: [DeploymentService],
  controllers: [DeploymentController],
})
export class DeploymentModule {}
