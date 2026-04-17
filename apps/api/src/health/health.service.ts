import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  getLiveness() {
    return {
      ok: true,
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }

  async getReadiness() {
    const startedAt = Date.now();

    await this.prisma.app.findFirst({
      select: { id: true },
    });

    return {
      ok: true,
      status: 'ready',
      checks: {
        database: 'up',
      },
      responseTimeMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    };
  }
}
