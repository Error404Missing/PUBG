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

  // 3. Fetch User's Requests (Bypassing RLS)
  const { data: allRequests } = await supabaseAdmin
    .from("scrim_requests")
    .select(`
        *,
        teams (id, team_name, leader_id)
    `)
    .or(`team_id.in.(${teamIds.length ? teamIds.join(',') : '00000000-0000-0000-0000-000000000000'})`)

  // 4. Filter approved and verified
  const approvedRequests = allRequests?.filter(r => 
    r.status?.toLowerCase() === 'approved' || r.status?.toLowerCase() === 'verified'
  ) || []

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
