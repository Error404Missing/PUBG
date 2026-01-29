import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const user = await getUser();
  
  if (user?.role !== "FOUNDER") {
    return NextResponse.json({ message: "მხოლოდ დამფუძნებელს შეუძლია როლების შეცვლა" }, { status: 403 });
  }

  try {
    const { userId, role } = await req.json();

    if (!userId || !role) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const supabase = await createClient();

    // Prevent changing other founders
    const { data: targetUser } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (!targetUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    
    if (targetUser.role === "FOUNDER") {
      return NextResponse.json({ message: "ვერ შეცვლით დამფუძნებლის როლს" }, { status: 403 });
    }

    const { data: updatedUser, error } = await supabase
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json({ message: "Failed to update role" }, { status: 500 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
