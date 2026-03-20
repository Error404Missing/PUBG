import { createClient } from "@supabase/supabase-js"

// Initialize a privileged client for Server Component
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getTeamsBySchedule(scheduleId: string) {
  // 1. Fetch Requests (Using Service Role to bypass RLS)
  const { data: requests } = await supabaseAdmin
    .from("scrim_requests")
    .select("*")
    .eq("schedule_id", scheduleId)

  if (!requests || requests.length === 0) return []

  // 2. Fetch Teams
  const teamIds = requests.map(r => r.team_id)
  const { data: teams } = await supabaseAdmin.from("teams").select("*").in("id", teamIds)

  // 3. Fetch Profiles for leaders
  const leaderIds = teams?.map(t => t.leader_id) || []
  const { data: profiles } = await supabaseAdmin.from("profiles").select("*").in("id", leaderIds)

  const teamsMap = new Map(teams?.map(t => [t.id, t]))
  const profilesMap = new Map(profiles?.map(p => [p.id, p]))

  // 4. Assemble ALL (even pending)
  return requests
    .map(r => {
      const team = teamsMap.get(r.team_id)
      if (!team) return null
      return {
        ...team,
        status: r.status, // Use request status override
        slot_number: r.slot_number || team.slot_number,
        profiles: profilesMap.get(team.leader_id) || null
      }
    })
    .filter(Boolean)
}

export async function fetchActiveSchedules() {
  const { data } = await supabaseAdmin
    .from("schedules")
    .select("*")
    .eq("is_active", true)
    .order("date", { ascending: true })
  return data || []
}
