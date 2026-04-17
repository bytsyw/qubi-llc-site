import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ProvidersService } from './providers.service';
import { UpdateProviderCredentialsDto } from './dto/update-provider-credentials.dto';
import { AdminSessionGuard } from '../security/admin-session.guard';
import { AuditService } from '../audit/audit.service';
import { AdminThrottlerGuard } from '../security/admin-throttler.guard';

@UseGuards(AdminSessionGuard, AdminThrottlerGuard)
@Throttle({ default: { limit: 40, ttl: 60000 } })
@Controller('admin/providers')
export class ProvidersController {
  constructor(
    private readonly providersService: ProvidersService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  async getProviders() {
    return this.providersService.getProviders();
  }

  @Patch('credentials')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async saveCredentials(
    @Body() body: UpdateProviderCredentialsDto,
    @Req() req: any,
  ) {
    const result = await this.providersService.saveCredentials(body);

    await this.auditService.logAction({
      adminEmail: req.adminSession?.email || 'unknown',
      action: 'PROVIDER_CREDENTIALS_SAVED',
      entityType: 'ProviderCredential',
      entityId: result?.id ?? null,
      targetLabel: body.provider,
      details: {
        provider: body.provider,
        accountLabel: body.accountLabel ?? null,
      },
    });

    return result;
  }

  @Post('apple/discover')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async discoverAppleApps(@Req() req: any) {
    const result = await this.providersService.discoverAppleApps();

    await this.auditService.logAction({
      adminEmail: req.adminSession?.email || 'unknown',
      action: 'APPLE_DISCOVERY_TRIGGERED',
      entityType: 'ProviderConnection',
      targetLabel: 'APPLE',
      details: result,
    });

    return result;
  }
}
