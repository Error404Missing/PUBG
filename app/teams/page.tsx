import { createServerClient } from "@/lib/supabase/server"
import { Users, Crown, Shield, Gamepad2, Calendar, ChevronLeft, Target, Zap, ShieldCheck, Activity, Users2 } from "lucide-react"
import { format } from "date-fns"
import { ka } from "date-fns/locale"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { getTeamsBySchedule, fetchActiveSchedules } from "./server-helper"
import { TeamsClient } from "./teams-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function TeamsPage({
  searchParams,
}: {
  searchParams: any
}) {
  // In Next.js 14/15, searchParams might need to be awaited or accessed directly
  const params = await searchParams
  const scheduleId = params?.schedule
  const schedules = await fetchActiveSchedules()
  const selectedSchedule = schedules.find(s => String(s.id) === String(scheduleId))
  
  console.log("TeamsPage Debug:", { scheduleId, schedulesCount: schedules.length, found: !!selectedSchedule })
  
  let teams: any[] = []
  if (scheduleId) {
    teams = await getTeamsBySchedule(scheduleId)
  }

  // --- RENDERING SELECTOR ---
  if (!selectedSchedule) {
    return (
      <div className="min-h-screen py-32 px-4 relative bg-[#020204]">
        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="mb-20 text-center animate-reveal">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] glass border border-primary/20 mb-8">
              <Calendar className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 text-white tracking-tighter italic uppercase">
               Squad <span className="text-primary tracking-normal italic">Lineup</span>
            </h1>
            <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.5em] italic">Operation_Select_Schedule</p>
          </div>

          <div className="grid gap-6">
            {schedules.map((s, i) => (
              <Link 
                key={s.id} 
                href={`/teams?schedule=${s.id}`}
                className="glass-card p-1 group animate-reveal block"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                  <div className="p-8 flex items-center gap-8">
                    <div className="w-16 h-16 rounded-2xl glass border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform bg-primary/5">
                      <Gamepad2 className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-3xl font-black text-white group-hover:text-primary transition-colors italic tracking-tighter uppercase">
                        {s.title}
                      </h3>
                      <div className="flex items-center gap-3 text-[10px] font-black text-white/30 uppercase tracking-widest mt-1">
                        <span>{format(new Date(s.date), "PPP", { locale: ka })}</span>
                        <span className="w-1 h-1 rounded-full bg-primary" />
                        <span className="text-primary">
                          {new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tbilisi', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(s.date))}
                        </span>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 px-6 py-3 rounded-2xl glass border border-white/5 opacity-0 group-hover:opacity-100 transition-all">
                      <span className="text-[10px] font-black uppercase tracking-widest">DEPLOY_VIEW</span>
                      <Zap className="w-4 h-4 text-primary animate-pulse" />
                    </div>
                  </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // --- RENDERING TEAMS LIST ---
  return (
    <div className="min-h-screen py-32 px-4 relative bg-[#020204]">
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="mb-12 animate-reveal">
          <Link
            href="/teams"
            className="text-muted-foreground hover:text-primary transition-all group inline-flex items-center gap-3"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="uppercase tracking-[0.3em] text-[10px] font-black italic">Return_To_Schedules</span>
          </Link>
        </div>

         <div className="mb-24 text-center animate-reveal">
           <h1 className="text-6xl md:text-8xl font-black mb-6 text-white tracking-tighter italic uppercase text-glow">
             {selectedSchedule.title}
           </h1>
           <div className="flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-[0.4em] text-white/40 italic">
              <span>{format(new Date(selectedSchedule.date), "PPP", { locale: ka })}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-primary">
                {new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tbilisi', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(selectedSchedule.date))}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-primary">{teams.length} UNITS_LOGGED</span>
           </div>
         </div>

         <div key={scheduleId}>
            <TeamsClient teams={teams} />
         </div>
      </div>
    </div>
  )
}
