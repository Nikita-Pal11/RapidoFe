import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const role = cookieStore.get("role")?.value || "rider";
    const accessToken = cookieStore.get("access_token")?.value;

    return NextResponse.json({
      role,
      isAuthenticated: !!accessToken,
    });
  } catch (error) {
    console.error("Error fetching me endpoint:", error);
    return NextResponse.json({ role: "rider", isAuthenticated: false }, { status: 500 });
  }
}
