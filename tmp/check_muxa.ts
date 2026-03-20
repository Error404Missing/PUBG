import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function check() {
  const { data: schedules } = await supabase.from("schedules").select("*").ilike("title", "%MUXA%")
  console.log("Schedules:", JSON.stringify(schedules, null, 2))
  
  if (schedules && schedules.length > 0) {
    const { data: requests } = await supabase
      .from("scrim_requests")
      .select("*, teams(*)")
      .eq("schedule_id", schedules[0].id)
    console.log("Requests for MUXA:", JSON.stringify(requests, null, 2))
  }
}

check()
