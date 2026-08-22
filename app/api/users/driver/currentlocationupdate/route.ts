import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const access_token = cookieStore.get('access_token')?.value;
        const body = await req.json();
        const resp = await fetch(
          "http://127.0.0.1:8000/locations/get-current-location/",
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
        return NextResponse.json(data);
    }
    catch(e) {
      console.log("error", e);
      return NextResponse.json({ message: "internal server error" }, { status: 500 });
    }
}
