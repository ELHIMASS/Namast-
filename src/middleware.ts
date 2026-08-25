import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "namaste_admin";

function getExpectedPassword() {
  const envPwd = process.env.ADMIN_PASSWORD || "";
  return envPwd.replace(/^["']|["']$/g, "").trim();
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const expected = getExpectedPassword();
  const session = request.cookies.get(COOKIE_NAME)?.value;
  if (!session || session !== expected) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
