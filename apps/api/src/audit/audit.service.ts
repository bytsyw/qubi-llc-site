import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async logAction(params: {
    adminEmail: string;
    action: string;
    entityType: string;
    entityId?: string | null;
    targetLabel?: string | null;
    details?: unknown;
  }) {
    return this.prisma.adminAuditLog.create({
      data: {
        adminEmail: params.adminEmail,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId ?? null,
        targetLabel: params.targetLabel ?? null,
        details: params.details as any,
      },
    });
  }

  async getRecentLogs() {
    const logs = await this.prisma.adminAuditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return logs.map((item) => ({
      id: item.id,
      adminEmail: item.adminEmail,
      action: item.action,
      entityType: item.entityType,
      entityId: item.entityId,
      targetLabel: item.targetLabel,
      details: item.details,
      createdAt: item.createdAt.toISOString(),
    }));
  }
}
