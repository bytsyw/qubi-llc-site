import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 },
    );
  }

  const session = await verifyAdminSessionToken(token);

  if (!session) {
    const response = NextResponse.json(
      { authenticated: false },
      { status: 401 },
    );

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

  return NextResponse.json({
    authenticated: true,
    session,
  });
}