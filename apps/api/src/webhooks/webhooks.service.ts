import { Injectable } from '@nestjs/common';
import { WebhookSource } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WebhookVerifierService } from './webhook-verifier.service';

@Injectable()
export class WebhooksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly verifier: WebhookVerifierService,
  ) {}

  async ingestAppleNotification(body: any) {
    const signedPayload =
      typeof body?.signedPayload === 'string' ? body.signedPayload : null;

    const verification =
      await this.verifier.verifyAppleSignedPayload(signedPayload);

    const eventType = this.buildAppleEventType(body, verification);
    const externalEventId = this.resolveAppleExternalEventId(
      body,
      verification,
    );

    const record = externalEventId
      ? await this.prisma.webhookEvent.upsert({
          where: {
            source_externalEventId: {
              source: WebhookSource.APPLE_SERVER_NOTIFICATIONS,
              externalEventId,
            },
          },
          update: {
            eventType,
            payload: {
              raw: body,
              verification,
            } as any,
            processed: verification.verified,
            processedAt: verification.verified ? new Date() : null,
          },
          create: {
            source: WebhookSource.APPLE_SERVER_NOTIFICATIONS,
            eventType,
            externalEventId,
            payload: {
              raw: body,
              verification,
            } as any,
            processed: verification.verified,
            processedAt: verification.verified ? new Date() : null,
          },
        })
      : await this.prisma.webhookEvent.create({
          data: {
            source: WebhookSource.APPLE_SERVER_NOTIFICATIONS,
            eventType,
            externalEventId: null,
            payload: {
              raw: body,
              verification,
            } as any,
            processed: verification.verified,
            processedAt: verification.verified ? new Date() : null,
          },
        });

    return {
      ok: true,
      source: record.source,
      eventType: record.eventType,
      id: record.id,
      verified: verification.verified,
      verificationReason: verification.verified ? null : verification.reason,
    };
  }

  async ingestGoogleRtdn(body: any, authorizationHeader?: string | null) {
    const decoded = this.decodeGoogleBody(body);
    const verification =
      await this.verifier.verifyGooglePushAuthorization(authorizationHeader);

    const eventType = this.resolveGoogleEventType(decoded);
    const externalEventId =
      typeof body?.message?.messageId === 'string'
        ? body.message.messageId
        : null;

    const record = externalEventId
      ? await this.prisma.webhookEvent.upsert({
          where: {
            source_externalEventId: {
              source: WebhookSource.GOOGLE_RTDN,
              externalEventId,
            },
          },
          update: {
            eventType,
            payload: {
              raw: body,
              decoded,
              verification,
            } as any,
            processed: verification.verified,
            processedAt: verification.verified ? new Date() : null,
          },
          create: {
            source: WebhookSource.GOOGLE_RTDN,
            eventType,
            externalEventId,
            payload: {
              raw: body,
              decoded,
              verification,
            } as any,
            processed: verification.verified,
            processedAt: verification.verified ? new Date() : null,
          },
        })
      : await this.prisma.webhookEvent.create({
          data: {
            source: WebhookSource.GOOGLE_RTDN,
            eventType,
            externalEventId: null,
            payload: {
              raw: body,
              decoded,
              verification,
            } as any,
            processed: verification.verified,
            processedAt: verification.verified ? new Date() : null,
          },
        });

    return {
      ok: true,
      source: record.source,
      eventType: record.eventType,
      id: record.id,
      verified: verification.verified,
      verificationReason: verification.verified ? null : verification.reason,
    };
  }

  async processPendingEvents() {
    const pending = await this.prisma.webhookEvent.findMany({
      where: { processed: false },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });

    const results: Array<Record<string, unknown>> = [];

    for (const event of pending) {
      if (event.source === WebhookSource.APPLE_SERVER_NOTIFICATIONS) {
        const rawSignedPayload =
          typeof (event.payload as any)?.raw?.signedPayload === 'string'
            ? (event.payload as any).raw.signedPayload
            : null;

        const verification =
          await this.verifier.verifyAppleSignedPayload(rawSignedPayload);

        if (verification.verified) {
          const eventType = this.buildAppleEventType(
            (event.payload as any)?.raw ?? {},
            verification,
          );

          await this.prisma.webhookEvent.update({
            where: { id: event.id },
            data: {
              eventType,
              payload: {
                ...(event.payload as any),
                verification,
              } as any,
              processed: true,
              processedAt: new Date(),
            },
          });

          results.push({
            id: event.id,
            source: event.source,
            status: 'processed',
          });
        } else {
          await this.prisma.webhookEvent.update({
            where: { id: event.id },
            data: {
              payload: {
                ...(event.payload as any),
                verification,
              } as any,
            },
          });

          results.push({
            id: event.id,
            source: event.source,
            status: 'pending',
            reason: verification.reason,
          });
        }

        continue;
      }

      results.push({
        id: event.id,
        source: event.source,
        status: 'pending',
        reason: 'google_events_must_be_verified_at_ingest_time',
      });
    }

    return {
      ok: true,
      processedCount: results.filter((item) => item.status === 'processed')
        .length,
      results,
    };
  }

  async getRecentWebhookEvents() {
    const events = await this.prisma.webhookEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return events.map((event) => ({
      id: event.id,
      source: event.source,
      eventType: event.eventType,
      externalEventId: event.externalEventId,
      processed: event.processed,
      processedAt: event.processedAt?.toISOString() ?? null,
      createdAt: event.createdAt.toISOString(),
      payload: event.payload,
    }));
  }

  private buildAppleEventType(body: any, verification: any) {
    const notificationType =
      (verification?.verified &&
        typeof verification?.details?.notificationType === 'string' &&
        verification.details.notificationType) ||
      (typeof body?.notificationType === 'string'
        ? body.notificationType
        : 'UNKNOWN');

    const subtype =
      (verification?.verified &&
        typeof verification?.details?.subtype === 'string' &&
        verification.details.subtype) ||
      (typeof body?.subtype === 'string' ? body.subtype : null);

    return subtype ? `${notificationType}:${subtype}` : notificationType;
  }

  private resolveAppleExternalEventId(body: any, verification: any) {
    if (
      verification?.verified &&
      typeof verification?.details?.notificationUUID === 'string'
    ) {
      return verification.details.notificationUUID;
    }

    if (typeof body?.notificationUUID === 'string') {
      return body.notificationUUID;
    }

    return null;
  }

  private decodeGoogleBody(body: any) {
    const dataBase64 =
      typeof body?.message?.data === 'string' ? body.message.data : null;

    if (!dataBase64) {
      return body;
    }

    try {
      const decodedText = Buffer.from(dataBase64, 'base64').toString('utf8');
      return JSON.parse(decodedText);
    } catch {
      return body;
    }
  }

  private resolveGoogleEventType(decoded: any) {
    if (decoded?.subscriptionNotification?.notificationType != null) {
      return `SUBSCRIPTION:${decoded.subscriptionNotification.notificationType}`;
    }

    if (decoded?.oneTimeProductNotification?.notificationType != null) {
      return `ONE_TIME:${decoded.oneTimeProductNotification.notificationType}`;
    }

    if (decoded?.voidedPurchaseNotification?.productType != null) {
      return `VOIDED:${decoded.voidedPurchaseNotification.productType}`;
    }

    if (decoded?.testNotification) {
      return 'TEST';
    }

    return 'UNKNOWN';
  }
}
