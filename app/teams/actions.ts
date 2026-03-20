"use server"

import { createServerClient } from "@/lib/supabase/server"

export async function getScheduleTeams(scheduleId: string) {
  const supabase = await createServerClient()
  
  // 1. Fetch all requests for this schedule
  const { data: requests, error: reqError } = await supabase
    .from("scrim_requests")
    .select("*")
    .eq("schedule_id", scheduleId)

  if (reqError) {
    console.error("Server Action Error (Requests):", reqError)
    return { error: reqError.message }
  }

  if (!requests || requests.length === 0) {
    return { data: [] }
  }

  // 2. Fetch Teams and Profiles
  const teamIds = requests.map(r => r.team_id)
  const [{ data: teams }, { data: profiles }] = await Promise.all([
    supabase.from("teams").select("*").in("id", teamIds),
    supabase.from("profiles").select("*").in("id", requests.map(r => r.team_id)) // Wait, join logic
  ])

  // Get leader IDs for profiles
  const leaderIds = teams?.map(t => t.leader_id) || []
  const { data: profilesData } = await supabase.from("profiles").select("*").in("id", leaderIds)

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

  return { data: assembled }
}

export async function getSiteRequestsDump() {
    const supabase = await createServerClient()
    const { data } = await supabase.from('scrim_requests').select('status, schedule_id, team_id').limit(50)
    return { data }
}
