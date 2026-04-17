import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateDeploymentTaskDto } from './dto/update-deployment-task.dto';

const defaultTasks = [
  {
    key: 'prod-domain-ssl',
    title: 'Production domain + SSL',
    category: 'manual',
    status: 'pending',
    description:
      'Gerçek domain, HTTPS ve reverse proxy yapılandırması kontrol edilmeli.',
  },
  {
    key: 'monitoring-alerting',
    title: 'Monitoring / alerting',
    category: 'manual',
    status: 'pending',
    description: 'Log takibi, hata bildirimi ve uptime izleme aracı eklenmeli.',
  },
  {
    key: 'backup-restore',
    title: 'Backup strategy',
    category: 'manual',
    status: 'pending',
    description: 'Mongo backup ve restore prosedürü netleştirilmeli.',
  },
  {
    key: 'apple-live-validation',
    title: 'Apple live credential validation',
    category: 'manual',
    status: 'pending',
    description: 'Apple credentials geldikten sonra canlı doğrulama yapılmalı.',
  },
  {
    key: 'final-smoke-tests',
    title: 'Final store smoke tests',
    category: 'manual',
    status: 'pending',
    description:
      'Google/Apple sync, webhook, metrics ve admin auth akışı canlıya yakın şekilde test edilmeli.',
  },
] as const;

@Injectable()
export class DeploymentService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureDefaults() {
    for (const task of defaultTasks) {
      await this.prisma.deploymentTask.upsert({
        where: { key: task.key },
        update: {},
        create: {
          key: task.key,
          title: task.title,
          category: task.category,
          status: task.status,
          description: task.description,
        },
      });
    }
  }

  async getTasks() {
    await this.ensureDefaults();

    const tasks = await this.prisma.deploymentTask.findMany({
      orderBy: [{ category: 'asc' }, { createdAt: 'asc' }],
    });

    return tasks.map((item) => ({
      id: item.id,
      key: item.key,
      title: item.title,
      category: item.category,
      status: item.status,
      description: item.description,
      note: item.note,
      updatedAt: item.updatedAt.toISOString(),
      createdAt: item.createdAt.toISOString(),
    }));
  }
  async getSmokeTestRuns() {
    const runs = await this.prisma.smokeTestRun.findMany({
      orderBy: { executedAt: 'desc' },
      take: 100,
    });

    return runs.map((item) => ({
      id: item.id,
      key: item.key,
      title: item.title,
      result: item.result,
      note: item.note,
      testerEmail: item.testerEmail,
      executedAt: item.executedAt.toISOString(),
      createdAt: item.createdAt.toISOString(),
    }));
  }
  async createSmokeTestRun(
    dto: {
      key: string;
      title: string;
      result: string;
      note?: string;
    },
    testerEmail: string,
  ) {
    const created = await this.prisma.smokeTestRun.create({
      data: {
        key: dto.key,
        title: dto.title,
        result: dto.result,
        note: dto.note ?? null,
        testerEmail,
      },
    });

    return {
      id: created.id,
      key: created.key,
      title: created.title,
      result: created.result,
      note: created.note,
      testerEmail: created.testerEmail,
      executedAt: created.executedAt.toISOString(),
      createdAt: created.createdAt.toISOString(),
    };
  }

  async updateTask(key: string, dto: UpdateDeploymentTaskDto) {
    await this.ensureDefaults();

    const updated = await this.prisma.deploymentTask.update({
      where: { key },
      data: {
        status: dto.status,
        note: dto.note ?? null,
      },
    });

    return {
      id: updated.id,
      key: updated.key,
      title: updated.title,
      category: updated.category,
      status: updated.status,
      description: updated.description,
      note: updated.note,
      updatedAt: updated.updatedAt.toISOString(),
      createdAt: updated.createdAt.toISOString(),
    };
  }
}
