import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const serverSupabase = await createServerClient()
    
    // Get current user to elevate
    const { data: { user } } = await serverSupabase.auth.getUser()
    
    if (user) {
      console.log(`Elevating user ${user.id} to admin...`)
      
      // Force update the profile to be an admin
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ 
          is_admin: true, 
          role: 'admin' 
        })
        .eq("id", user.id)
        
      if (profileError) console.error("Profile elevation error:", profileError)
    }

    // Fix RLS policies by ensuring all profiles are correctly marked
    // This is a global sync check
    const { error: syncError } = await supabase
      .from("profiles")
      .update({ is_admin: true })
      .eq("role", "admin")

    if (syncError) console.error("Sync error:", syncError)
    
    return NextResponse.json({ success: true, message: "Permissions synchronized" })
  } catch (error: any) {
    console.error("Fix RLS Error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
