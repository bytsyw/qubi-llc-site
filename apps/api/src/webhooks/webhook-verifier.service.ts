import { Injectable } from "@nestjs/common";
import { OAuth2Client } from "google-auth-library";
import {
  Environment,
  SignedDataVerifier,
} from "@apple/app-store-server-library";
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";

type VerificationResult =
  | {
      verified: true;
      details: Record<string, unknown>;
    }
  | {
      verified: false;
      reason: string;
    };

@Injectable()
export class WebhookVerifierService {
  private readonly googleClient = new OAuth2Client();

  async verifyAppleSignedPayload(
    signedPayload?: string | null,
  ): Promise<VerificationResult> {
    if (!signedPayload) {
      return {
        verified: false,
        reason: "missing_signed_payload",
      };
    }

    const bundleId = process.env.APPLE_BUNDLE_ID?.trim();
    if (!bundleId) {
      return {
        verified: false,
        reason: "missing_apple_bundle_id",
      };
    }

    const appleRootCAs = this.loadAppleRootCAs();
    if (appleRootCAs.length === 0) {
      return {
        verified: false,
        reason: "missing_apple_root_certs",
      };
    }

    const environment =
      (process.env.APPLE_SERVER_ENVIRONMENT || "SANDBOX").toUpperCase() ===
      "PRODUCTION"
        ? Environment.PRODUCTION
        : Environment.SANDBOX;

    const rawAppleId = process.env.APPLE_APPLE_ID?.trim();
    const appAppleId =
      environment === Environment.PRODUCTION && rawAppleId
        ? Number(rawAppleId)
        : undefined;

    try {
      const verifier = new SignedDataVerifier(
        appleRootCAs,
        true,
        environment,
        bundleId,
        appAppleId,
      );

      const decoded = await verifier.verifyAndDecodeNotification(signedPayload);

      return {
        verified: true,
        details: {
          notificationType: decoded.notificationType ?? null,
          subtype: decoded.subtype ?? null,
          notificationUUID: decoded.notificationUUID ?? null,
          decoded,
        },
      };
    } catch (error) {
      return {
        verified: false,
        reason: error instanceof Error ? error.message : "apple_verify_failed",
      };
    }
  }

  async verifyGooglePushAuthorization(
    authorizationHeader?: string | null,
  ): Promise<VerificationResult> {
    if (!authorizationHeader?.startsWith("Bearer ")) {
      return {
        verified: false,
        reason: "missing_bearer_token",
      };
    }

    const audience = process.env.GOOGLE_PUBSUB_AUDIENCE?.trim();
    if (!audience) {
      return {
        verified: false,
        reason: "missing_google_pubsub_audience",
      };
    }

    const token = authorizationHeader.slice("Bearer ".length).trim();

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        return {
          verified: false,
          reason: "missing_google_claims",
        };
      }

      if (
        payload.iss !== "accounts.google.com" &&
        payload.iss !== "https://accounts.google.com"
      ) {
        return {
          verified: false,
          reason: "invalid_google_issuer",
        };
      }

      const expectedEmail = process.env.GOOGLE_PUBSUB_EXPECTED_EMAIL?.trim();
      if (expectedEmail && payload.email !== expectedEmail) {
        return {
          verified: false,
          reason: "unexpected_google_email",
        };
      }

      return {
        verified: true,
        details: {
          aud: payload.aud ?? null,
          iss: payload.iss ?? null,
          sub: payload.sub ?? null,
          email: payload.email ?? null,
          email_verified: payload.email_verified ?? null,
        },
      };
    } catch (error) {
      return {
        verified: false,
        reason: error instanceof Error ? error.message : "google_verify_failed",
      };
    }
  }

  private loadAppleRootCAs(): Buffer[] {
    const certDir = join(process.cwd(), "certs", "apple");

    if (!existsSync(certDir)) {
      return [];
    }

    const files = readdirSync(certDir).filter((file) =>
      [".cer", ".crt", ".pem"].some((ext) => file.toLowerCase().endsWith(ext)),
    );

    return files.map((file) => readFileSync(join(certDir, file)));
  }
}