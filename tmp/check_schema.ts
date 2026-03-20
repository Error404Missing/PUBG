import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function check() {
  const { data: teams } = await supabase.from("teams").select("*").limit(1)
  console.log("Team Columns:", Object.keys(teams?.[0] || {}))
  
  // Try to find if there's a unique constraint failing
  const { error } = await supabase.from("teams").insert({
     team_name: "MockTeam_" + Date.now(),
     team_tag: "MOCK",
     leader_id: "7b55d215-a1c3-4f3e-9ae7-6b94e06e1794", // arbitrary
     schedule_id: "f833ad8f-f978-44af-a953-00678c9c9d10"
  })
  console.log("Trial Insert Error:", error)
}

check()
