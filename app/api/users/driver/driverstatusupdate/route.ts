import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const access_token = cookieStore.get('access_token')?.value;
        const body = await req.json();
        const resp = await fetch(
            "http://127.0.0.1:8000/users/driverstatus/",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${access_token}`,
                },
                body: JSON.stringify({
                    ...body,
                }),
            },
        );

        const data = await resp.json();
        return NextResponse.json({ data });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}