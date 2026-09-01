import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token")?.value;
    const resp = await fetch("http://127.0.0.1:8000/users/profile/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      }
    });
    const data = await resp.json();
    if (!resp.ok) {
      return NextResponse.json(data, { status: resp.status });
    }
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in profile GET:", error);
    return NextResponse.json({ message: "internal server error", error: error.message || String(error), stack: error.stack }, { status: 500 });
  }
}
