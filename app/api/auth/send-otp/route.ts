import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
 try {
   const body = await req.json()
   const email = body.email;
   const resp = await fetch("http://127.0.0.1:8000/auth/send-otp/", {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
     },
     body: JSON.stringify({ email }),
   });
   const data = await resp.json();
   if (!resp.ok) {
     return NextResponse.json(data, {status:resp.status})
   }
  return NextResponse.json(data)
 } catch (error) {
   console.log("Error", error);
   return NextResponse.json({message:"internal server error"}, {status:500})
 }
} 