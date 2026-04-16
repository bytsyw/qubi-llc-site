import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/auth";

const protectedPrefixes = [
  "/dashboard",
  "/apps",
  "/providers",
  "/sync",
  "/webhooks",
  "/audit",
  "/deployment",
];

function isProtectedPath(pathname: string) {
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function buildLoginRedirect(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", request.nextUrl.pathname);
  return url;
}

function buildDashboardRedirect(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/dashboard";
  url.searchParams.delete("next");
  return url;
}

function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const isLoginPage = pathname === "/login";
  const needsProtection = isProtectedPath(pathname);

  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");

  if (!token) {
    if (needsProtection) {
      return NextResponse.redirect(buildLoginRedirect(request));
    }

    return response;
  }

  const session = await verifyAdminSessionToken(token);

  if (!session) {
    if (needsProtection || isLoginPage) {
      return clearSessionCookie(
        NextResponse.redirect(buildLoginRedirect(request)),
      );
    }

    return clearSessionCookie(response);
  }

  if (isLoginPage) {
    return NextResponse.redirect(buildDashboardRedirect(request));
  }

  return response;
}

export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/apps/:path*",
    "/providers/:path*",
    "/sync/:path*",
    "/webhooks/:path*",
    "/audit/:path*",
    "/deployment/:path*",
  ],
};