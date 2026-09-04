import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token")?.value;
    if (!access_token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/profile/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      },
    );
    const data = await resp.json();
    if (!resp.ok) {
      return NextResponse.json(data, { status: resp.status });
    }
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in profile GET:", error);
    return NextResponse.json(
      {
        message: "internal server error",
        error: error.message || String(error),
      },
      { status: 500 },
    );
  }
}
