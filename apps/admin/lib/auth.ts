import { SignJWT, jwtVerify } from "jose";

export const ADMIN_SESSION_COOKIE = "qubi_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function getAdminSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "ADMIN_SESSION_SECRET must be set and at least 32 characters long.",
    );
  }

  return new TextEncoder().encode(secret);
}

export async function createAdminSessionToken(payload: { email: string }) {
  return new SignJWT({
    email: payload.email,
    role: "admin",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_SESSION_MAX_AGE}s`)
    .sign(getAdminSessionSecret());
}

export async function verifyAdminSessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getAdminSessionSecret());

    if (payload.role !== "admin") {
      return null;
    }

    return {
      email: typeof payload.email === "string" ? payload.email : "",
    };
  } catch {
    return null;
  }
}