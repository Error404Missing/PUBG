import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getRoomInfoData(userId: string) {
  // 1. Fetch User Profile
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role, is_admin")
    .eq("id", userId)
    .single()

  const isAdmin = profile?.is_admin
  const isManager = profile?.role === "manager"

  // 2. Fetch User's Teams
  const { data: userTeams } = await supabaseAdmin
    .from("teams")
    .select("id, team_name")
    .eq("leader_id", userId)

  const teamIds = userTeams?.map(t => t.id) || []

  // 3. Fetch ALL of the user's scrim_requests (Bypassing RLS)
  // slot_number is on scrim_requests, not teams
  let allRequests: any[] = []
  if (teamIds.length > 0) {
    const { data } = await supabaseAdmin
      .from("scrim_requests")
      .select(`
          id,
          team_id,
          schedule_id,
          status,
          slot_number,
          preferred_maps,
          teams (id, team_name, leader_id)
      `)
      .in("team_id", teamIds)
    allRequests = data || []
  }

  // 4. Filter approved
  const approvedRequests = allRequests.filter(r => 
    r.status?.toLowerCase() === 'approved' || r.status?.toLowerCase() === 'verified'
  )

  // 5. Fetch Active Schedules
  const { data: allSchedules } = await supabaseAdmin
    .from("schedules")
    .select("*")
    .eq("is_active", true)
    .order("date", { ascending: true })

  // 5. Diagnostics for Admin Site-wide
  let allSiteTeams = null
  let allSiteRequests = null
  let dbAuthId = null

  if (isAdmin) {
    allSiteTeams = (await supabaseAdmin.from("teams").select("id, team_name, leader_id").limit(10)).data
    allSiteRequests = (await supabaseAdmin.from("scrim_requests").select("*, teams(team_name)").limit(10)).data
    // dbAuthId is tricky on server without RPC, let's just use user.id
    dbAuthId = userId
  }

  return {
    profile,
    isAdmin,
    isManager,
    teamIds,
    allRequests: allRequests || [],
    approvedRequests,
    allSchedules: allSchedules || [],
    allSiteTeams,
    allSiteRequests,
    dbAuthId
  }
}
