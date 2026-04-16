import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import * as Joi from "joi";
import { ThrottlerModule } from "@nestjs/throttler";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthModule } from "./health/health.module";
import { AppsModule } from "./apps/apps.module";
import { ProvidersModule } from "./providers/providers.module";
import { SyncModule } from "./sync/sync.module";
import { WebhooksModule } from "./webhooks/webhooks.module";
import { DeploymentModule } from "./deployment/deployment.module";
import { AuditModule } from "./audit/audit.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid("development", "production", "test")
          .default("development"),
        PORT: Joi.number().default(4000),

        DATABASE_URL: Joi.string().required(),

        APP_ENCRYPTION_KEY: Joi.string().min(16).required(),
        JWT_SECRET: Joi.string().min(16).required(),
        ADMIN_SESSION_SECRET: Joi.string().min(32).required(),

        PUBLIC_SITE_URL: Joi.string().uri().required(),
        ADMIN_PANEL_URL: Joi.string().uri().required(),

        APPLE_SERVER_ENVIRONMENT: Joi.string()
          .valid("SANDBOX", "PRODUCTION")
          .optional(),
        APPLE_BUNDLE_ID: Joi.string().optional(),
        APPLE_APPLE_ID: Joi.string().allow("").optional(),

        GOOGLE_PUBSUB_AUDIENCE: Joi.string().optional(),
        GOOGLE_PUBSUB_EXPECTED_EMAIL: Joi.string().allow("").optional(),
      }),
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 120,
        },
      ],
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    HealthModule,
    AppsModule,
    ProvidersModule,
    SyncModule,
    DeploymentModule,
    WebhooksModule,
    AuditModule,
  ],
})
export class AppModule {}