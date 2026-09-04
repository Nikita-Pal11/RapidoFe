import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("access_token")?.value;
  const role = request.cookies.get("role")?.value;

  // Public routes
  const isPublic = pathname === "/LandingPage" || pathname.startsWith("/Auth");

  // Not logged in
  if (!accessToken) {
    if (isPublic) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/LandingPage", request.url));
  }

  // Logged in users shouldn't access auth/landing pages
  if (isPublic) {
    if (role === "rider") {
      return NextResponse.redirect(new URL("/RiderProfile", request.url));
    }

    if (role === "driver") {
      return NextResponse.redirect(new URL("/DriverProfile", request.url));
    }

    return NextResponse.redirect(new URL("/", request.url));
  }

  // Rider cannot access driver routes (/Driver, /DriverProfile, etc.)
  if (role === "rider" && pathname.startsWith("/Driver")) {
    return NextResponse.redirect(new URL("/RiderProfile", request.url));
  }

  // Driver cannot access rider routes (/RiderProfile, etc.)
  if (role === "driver" && pathname.startsWith("/Rider")) {
    return NextResponse.redirect(new URL("/DriverProfile", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/LandingPage",
    "/Auth",
    "/Auth/:path*",
    "/RiderProfile",
    "/RiderProfile/:path*",
    "/DriverProfile",
    "/DriverProfile/:path*",
    "/Driver/:path*",
  ],
};

