import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token")?.value;
    const contentType = req.headers.get("content-type") || "";

    let resp: Response;
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      resp = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/driver/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
          body: formData,
        },
      );
    } else {
      const body = await req.json();
      resp = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/driver/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
          body: JSON.stringify(body),
        },
      );
    }

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
