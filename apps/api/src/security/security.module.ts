import { Module } from '@nestjs/common';
import { AdminSessionGuard } from './admin-session.guard';
import { AdminThrottlerGuard } from './admin-throttler.guard';

@Module({
  providers: [AdminSessionGuard, AdminThrottlerGuard],
  exports: [AdminSessionGuard, AdminThrottlerGuard],
})
export class SecurityModule {}
