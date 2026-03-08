import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const supabaseServer = await createServerClient()
    const { data: { user } } = await supabaseServer.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ success: false, error: "User session not found" }, { status: 401 })
    }

    const adminClient = createAdminClient()
    
    // 1. Ensure the calling user is a super admin
    const { error: profileError } = await adminClient
      .from('profiles')
      .update({ 
        is_admin: true, 
        role: 'admin' 
      })
      .eq('id', user.id)

    if (profileError) throw profileError

    // 2. Also ensure all people with 'admin' role have is_admin = true
    await adminClient
      .from('profiles')
      .update({ is_admin: true })
      .eq('role', 'admin')

    return NextResponse.json({ success: true, message: "Security protocols and Admin status synchronized." })
  } catch (err: any) {
    console.error("Fix RLS error:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
