import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

function getKey() {
  const raw = process.env.APP_ENCRYPTION_KEY || "";
  return createHash("sha256").update(raw).digest();
}

export function encryptJson(value: unknown): string {
  const iv = randomBytes(12);
  const key = getKey();

  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const plaintext = JSON.stringify(value);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return JSON.stringify({
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    data: encrypted.toString("base64"),
  });
}

export function decryptJson<T = unknown>(payload: string): T {
  const parsed = JSON.parse(payload) as {
    iv: string;
    tag: string;
    data: string;
  };

  const key = getKey();

  const decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(parsed.iv, "base64"),
  );

  decipher.setAuthTag(Buffer.from(parsed.tag, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(parsed.data, "base64")),
    decipher.final(),
  ]);

  return JSON.parse(decrypted.toString("utf8")) as T;
}