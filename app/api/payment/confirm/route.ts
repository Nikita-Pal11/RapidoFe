import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { ride_id } = await request.json();
    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token")?.value;
    
    const resp = await fetch(
      "http://127.0.0.1:8000/payments/confirm-payment/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({ ride_id }),
      },
    );
    const data = await resp.json();

    if (!resp.ok) {
      return NextResponse.json(data, { status: resp.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Internal Error in payment confirm API proxy:", error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error}` },
      { status: 500 },
    );
  }
}
