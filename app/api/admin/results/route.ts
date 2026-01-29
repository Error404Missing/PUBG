import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user = await getUser();
  if (user?.role !== "ADMIN" && user?.role !== "FOUNDER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { scrimId, image, description } = await req.json();

    if (!scrimId || !image) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: result, error } = await supabase
      .from('results')
      .insert({
        scrim_id: scrimId,
        image_url: image,
        description,
        team_id: null, // Image-based result
        placement: 0,
        kills: 0,
        points: 0
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json({ message: "Failed to create result" }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating result:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const user = await getUser();
  if (user?.role !== "ADMIN" && user?.role !== "FOUNDER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { resultId } = await req.json();
    if (!resultId) {
      return NextResponse.json({ message: "Missing resultId" }, { status: 400 });
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('results')
      .delete()
      .eq('id', resultId);

    if (error) {
      console.error(error);
      return NextResponse.json({ message: "Failed to delete result" }, { status: 500 });
    }

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("Error deleting result:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
