import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AdminSessionGuard } from '../security/admin-session.guard';

@UseGuards(AdminSessionGuard)
@Controller('admin/audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  async getRecentLogs() {
    return this.auditService.getRecentLogs();
  }
}
