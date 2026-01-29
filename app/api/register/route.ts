import { NextResponse } from "next/server";

// This route is no longer needed as registration is handled by Supabase Auth
// Keeping it as a redirect to the new auth flow

export async function POST() {
  return NextResponse.json(
    { 
      message: "Registration is now handled through Supabase Auth. Please use the /register page." 
    }, 
    { status: 400 }
  );
}
