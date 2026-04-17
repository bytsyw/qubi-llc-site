import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DeploymentService } from './deployment.service';
import { UpdateDeploymentTaskDto } from './dto/update-deployment-task.dto';
import { CreateSmokeTestRunDto } from './dto/create-smoke-test-run.dto';
import { AdminSessionGuard } from '../security/admin-session.guard';
import { AdminThrottlerGuard } from '../security/admin-throttler.guard';
import { AuditService } from '../audit/audit.service';
import { Throttle } from '@nestjs/throttler';

@UseGuards(AdminSessionGuard, AdminThrottlerGuard)
@Throttle({ default: { limit: 40, ttl: 60000 } })
@Controller('admin/deployment')
export class DeploymentController {
  constructor(
    private readonly deploymentService: DeploymentService,
    private readonly auditService: AuditService,
  ) {}

  @Get('tasks')
  async getTasks() {
    return this.deploymentService.getTasks();
  }

  @Patch('tasks/:key')
  async updateTask(
    @Param('key') key: string,
    @Body() body: UpdateDeploymentTaskDto,
    @Req() req: any,
  ) {
    const result = await this.deploymentService.updateTask(key, body);

    await this.auditService.logAction({
      adminEmail: req.adminSession?.email || 'unknown',
      action: 'DEPLOYMENT_TASK_UPDATED',
      entityType: 'DeploymentTask',
      entityId: result.id,
      targetLabel: key,
      details: {
        key,
        status: body.status,
        note: body.note ?? null,
      },
    });

    return result;
  }

  @Get('smoke-tests')
  async getSmokeTests() {
    return this.deploymentService.getSmokeTestRuns();
  }

  @Post('smoke-tests')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async createSmokeTest(@Body() body: CreateSmokeTestRunDto, @Req() req: any) {
    const testerEmail = req.adminSession?.email || 'unknown';

    const result = await this.deploymentService.createSmokeTestRun(
      body,
      testerEmail,
    );

    await this.auditService.logAction({
      adminEmail: testerEmail,
      action: 'SMOKE_TEST_RECORDED',
      entityType: 'SmokeTestRun',
      entityId: result.id,
      targetLabel: body.key,
      details: {
        key: body.key,
        title: body.title,
        result: body.result,
        note: body.note ?? null,
      },
    });

    return result;
  }
}
