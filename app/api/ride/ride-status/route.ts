import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token")?.value;
    const body = await req.json();

    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/rides/ride-status/`,
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
    console.log("Error in ride-status Next.js proxy:", error);
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 },
    );
  }
}
