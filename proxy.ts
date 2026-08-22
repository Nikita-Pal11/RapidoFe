import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Next.js 16: middleware is renamed to proxy.
// Cookies must be read from request.cookies (not next/headers).
export function proxy(request: NextRequest) {
  const access_token = request.cookies.get("access_token")?.value;
  if (!access_token) {
    return NextResponse.redirect(new URL("/LandingPage", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/",
};
