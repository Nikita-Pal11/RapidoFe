import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token")?.value;
    if (!access_token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/rider/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify(body),
      },
    );

    const data = await resp.json();
    if (!resp.ok) {
      return NextResponse.json(data, { status: resp.status });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.log("Error in /api/users/rider POST:", error);
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 },
    );
  }
}
