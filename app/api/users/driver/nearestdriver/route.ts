import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token")?.value;
    const searchparams = req.nextUrl.searchParams;
    const pickup_long = searchparams.get("pickup_long");
    const pickup_lat = searchparams.get("pickup_lat");
    const dropoff_long = searchparams.get("dropoff_long");
    const dropoff_lat = searchparams.get("dropoff_lat");
    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/rides/nearest-driver/?pickup_long=${pickup_long}&pickup_lat=${pickup_lat}&dropoff_long=${dropoff_long}&dropoff_lat=${dropoff_lat}`,
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
  } catch (error) {
    console.log("Error", error);
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 },
    );
  }
}
