import next from "next";
import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp, role } = body;
    const resp = await fetch("http://127.0.0.1:8000/auth/verify-otp/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp, role }),
    });
    const data = await resp.json();
    if (!resp.ok) {
      return NextResponse.json(data, { status: resp.status });
    }
    const nextresp = NextResponse.json({
      message: "otp verified successfully",
      driver: data.driver,
    });
    const userRole = role || (data.driver ? "driver" : "rider");
    nextresp.cookies.set("access_token", data.access, {
      httpOnly: true,
      path: "/",
    });
    nextresp.cookies.set("refresh_token", data.refresh, {
      httpOnly: true,
      path: "/",
    });
    nextresp.cookies.set("role", userRole, {
      httpOnly: true,
      path: "/",
    });
    return nextresp;
  } catch (error) {
    console.log("Error", error);
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 },
    );
  }
}
