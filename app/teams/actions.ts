"use server"

import { createClient } from "@supabase/supabase-js"

// Initialize a privileged client that bypasses RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getScheduleTeams(scheduleId: string) {
  // 1. Fetch all requests for this schedule (Using Service Role to bypass RLS)
  const { data: requests, error: reqError, count } = await supabaseAdmin
    .from("scrim_requests")
    .select("*", { count: 'exact' })
    .eq("schedule_id", scheduleId)

  console.log(`Server Action (Admin Client): Found ${count} requests for ${scheduleId}`)

  if (reqError) {
    console.error("Server Action Error (Requests):", reqError)
    return { error: reqError.message }
  }

  if (!requests || requests.length === 0) {
    return { data: [], debug: "Zero rows found with Service Role client." }
  }

  // 2. Fetch Teams and Profiles
  const teamIds = requests.map(r => r.team_id)
  const { data: teams } = await supabaseAdmin.from("teams").select("*").in("id", teamIds)
  const leaderIds = teams?.map(t => t.leader_id) || []
  const { data: profilesData } = await supabaseAdmin.from("profiles").select("*").in("id", leaderIds)

  const teamsMap = new Map(teams?.map(t => [t.id, t]))
  const profilesMap = new Map(profilesData?.map(p => [p.id, p]))

  const assembled = requests
    .filter(r => r.status?.toLowerCase() === 'approved' || r.status?.toLowerCase() === 'verified')
    .map(r => {
      const team = teamsMap.get(r.team_id)
      if (!team) return null
      return {
        ...team,
        slot_number: r.slot_number || team.slot_number,
        profiles: profilesMap.get(team.leader_id) || null
      }
    })
    .filter(Boolean)

  return { data: assembled, count: count }
}

export async function getSiteRequestsDump() {
    const { data, count } = await supabaseAdmin
        .from('scrim_requests')
        .select('status, schedule_id, team_id', { count: 'exact' })
        .limit(50)
    return { data, totalCount: count }
}
