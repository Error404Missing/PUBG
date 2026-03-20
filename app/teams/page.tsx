import { createServerClient } from "@/lib/supabase/server"
import { Users, Crown, Shield, Gamepad2, Calendar, ChevronLeft, Target, Zap, ShieldCheck, Activity, Users2 } from "lucide-react"
import { format } from "date-fns"
import { ka } from "date-fns/locale"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { getTeamsBySchedule, fetchActiveSchedules } from "./server-helper"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function TeamsPage({
  searchParams,
}: {
  searchParams: { schedule?: string }
}) {
  const scheduleId = searchParams.schedule
  const schedules = await fetchActiveSchedules()
  const selectedSchedule = schedules.find(s => s.id === scheduleId)
  
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
                        <span className="text-primary">{format(new Date(s.date), "p", { locale: ka })}</span>
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
             <span className="text-primary">{teams.length} UNITS_CONFIRMED</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teams.length > 0 ? (
            teams.map((team, i) => (
              <div key={team.id} className={`glass-card p-1 relative overflow-hidden group animate-reveal ${team.is_vip ? 'border-secondary/20 bg-secondary/5' : ''}`} style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="p-8">
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-5">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 ${team.is_vip ? 'border-secondary bg-secondary/10 shadow-[0_0_20px_-5px_secondary]' : 'border-white/10 bg-white/5'}`}>
                        {team.logo_url ? (
                          <img src={team.logo_url} className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                          team.is_vip ? <Crown className="w-8 h-8 text-secondary" /> : <Shield className="w-8 h-8 text-primary/40" />
                        )}
                      </div>
                      <div>
                        <h3 className={`text-2xl font-black italic tracking-tighter uppercase ${team.is_vip ? 'text-secondary' : 'text-white'}`}>{team.team_name}</h3>
                        <Badge variant="outline" className="border-white/10 text-[9px] font-black uppercase tracking-widest text-white/40 py-1">{team.team_tag}</Badge>
                      </div>
                    </div>
                    {team.slot_number && (
                      <div className="text-right">
                        <div className="text-[9px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">Slot</div>
                        <div className="text-3xl font-black text-primary italic leading-none">#{team.slot_number}</div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl glass-darker border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden">
                          <img src={team.profiles?.avatar_url || "https://i.ibb.co/vzD7Z0M/default-avatar-dark.png"} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">Commander</p>
                          <p className="text-[11px] font-bold text-white uppercase italic">{team.profiles?.username || "Unknown"}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase italic text-white/40">
                         <Users2 className="w-3.5 h-3.5" /> {team.players_count || 4} OPS
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest italic tracking-[0.2em]">VERIFIED_UNIT</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-32 text-center glass-card border-dashed border-white/5 opacity-50">
              <Users className="w-16 h-16 text-white/10 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-white/20 italic uppercase tracking-tighter mb-2">No_Data_Returned</h3>
              <p className="text-[10px] text-white/10 font-bold uppercase tracking-[0.3em]">ამ განრიგში გუნდები ჯერ არ მოიძებნა.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
