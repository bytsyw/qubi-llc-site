import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  getHealth() {
    return this.healthService.getLiveness();
  }

  @Get('liveness')
  getLiveness() {
    return this.healthService.getLiveness();
  }

  @Get('readiness')
  async getReadiness() {
    try {
      return await this.healthService.getReadiness();
    } catch {
      throw new InternalServerErrorException({
        code: 'READINESS_FAILED',
        message: 'Service is not ready.',
        details: {
          database: 'down',
        },
      });
    }
  }
}
