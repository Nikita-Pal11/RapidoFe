import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token")?.value;
    const body = await req.json();
    const resp = await fetch("http://127.0.0.1:8000/rides/booking/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify(body),
    });
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

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token")?.value;
    const resp = await fetch(`http://127.0.0.1:8000/rides/curr-ride/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
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
        stack: error.stack,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(req:NextRequest){
    try {
      const cookieStore = await cookies();
      const access_token = cookieStore.get("access_token")?.value;
      const body = await req.json();
      const resp = await fetch(`http://127.0.0.1:8000/rides/cancel-ride/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body:JSON.stringify(body)
      });
      const data = await resp.json();
      if (!resp.ok) {
        return NextResponse.json(data, { status: resp.status });
      }
      return NextResponse.json(data);
    } catch (error: any) {
      console.error("Error in deleting ride:", error);
      return NextResponse.json(
        {
          message: "internal server error",
          error: error.message || String(error),
          stack: error.stack,
        },
        { status: 500 },
      );
    }
}