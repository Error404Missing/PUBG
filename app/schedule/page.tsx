import { createClient } from "@/lib/supabase/server"
import { Calendar, MapPin, Users, Zap } from "lucide-react"
import { format } from "date-fns"
import { ka } from "date-fns/locale"
import { ScheduleClient } from "@/components/schedule-client"

export default async function SchedulePage() {
  const supabase = await createClient()

  // Start fetching user and schedules in parallel
  const [userRes, schedulesRes] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("schedules").select("*").eq("is_active", true).order("date", { ascending: true })
  ])

  const user = userRes.data.user
  const schedules = schedulesRes.data

  let userTeam = null // kept for fallback
  let userVipStatus = null
  let userTeamBySchedule: Record<string, any> = {} // map: schedule_id -> team

  if (user) {
    const [teamRes, vipRes] = await Promise.all([
      supabase
        .from("teams")
        .select("*")
        .eq("leader_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from("user_vip_status")
        .select("vip_until")
        .eq("user_id", user.id)
        .single()
    ])

    userTeam = teamRes.data
    const vipStatus = vipRes.data

    if (vipStatus && new Date(vipStatus.vip_until) > new Date()) {
      userVipStatus = vipStatus
    }

    // Fetch all approved/pending scrim_requests for this user, to know which schedules they're in
    if (userTeam) {
      // Get all teams this user leads
      const { data: allUserTeams } = await supabase
        .from("teams")
        .select("id")
        .eq("leader_id", user.id)

      if (allUserTeams && allUserTeams.length > 0) {
        const teamIds = allUserTeams.map(t => t.id)
        const { data: requests } = await supabase
          .from("scrim_requests")
          .select("schedule_id, team_id, status, teams(*)")
          .in("team_id", teamIds)

        // Build a map: schedule_id -> { team, status }
        requests?.forEach((r: any) => {
          userTeamBySchedule[r.schedule_id] = {
            team: r.teams,
            status: r.status?.toLowerCase().trim()
          }
        })
      }
    }
  }

  return (
    <div className="min-h-screen py-32 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-20 text-center animate-reveal">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] glass border border-primary/20 mb-8">
            <Calendar className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 text-white tracking-tighter italic">
            მატჩების <span className="text-primary tracking-normal">განრიგი</span>
          </h1>
          <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
            დაგეგმილი scrim მატჩები და ტურნირები
          </p>
        </div>

        <div className="grid gap-8">
          {schedules && schedules.length > 0 ? (
            schedules.map((schedule, i) => (
              <div
                key={schedule.id}
                className="glass-card p-1 animate-reveal"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <h2 className="text-3xl font-black text-white italic tracking-tight">{schedule.title}</h2>
                        {userVipStatus && (
                          <div className="flex items-center gap-1.5 bg-secondary/20 px-3 py-1 rounded-full text-secondary text-[10px] font-black uppercase tracking-widest border border-secondary/30">
                            <Zap className="w-3 h-3" />
                            VIP
                          </div>
                        )}
                      </div>
                      <p className="text-muted-foreground font-light text-lg leading-relaxed max-w-xl">
                        {schedule.description}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start lg:items-center gap-6 lg:gap-12 p-6 rounded-2xl glass border border-white/5">
                      <div className="space-y-4">
                        <div className="flex items-center text-white/80 group">
                          <div className="w-8 h-8 rounded-lg glass border border-white/10 flex items-center justify-center mr-3 group-hover:border-primary/50 transition-colors">
                            <Calendar className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Date</div>
                            <div className="text-sm font-bold">{format(new Date(schedule.date), "PPP", { locale: ka })}</div>
                          </div>
                        </div>
                        <div className="flex items-center text-white/80 group">
                          <div className="w-8 h-8 rounded-lg glass border border-white/10 flex items-center justify-center mr-3 group-hover:border-primary/50 transition-colors">
                            <Calendar className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Time</div>
                            <div className="text-sm font-bold">
                              {new Intl.DateTimeFormat('ka-GE', { 
                                timeZone: 'Asia/Tbilisi', 
                                hour: '2-digit', 
                                minute: '2-digit', 
                                hour12: false 
                              }).format(new Date(schedule.date))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="h-px sm:h-12 w-full sm:w-px bg-white/10" />

                      <div className="space-y-4">
                        {schedule.map_name && (
                          <div className="flex items-center text-white/80 group">
                            <div className="w-8 h-8 rounded-lg glass border border-white/10 flex items-center justify-center mr-3 group-hover:border-primary/50 transition-colors">
                              <MapPin className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Map</div>
                              <div className="text-sm font-bold">{schedule.map_name}</div>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center text-white/80 group">
                          <div className="w-8 h-8 rounded-lg glass border border-white/10 flex items-center justify-center mr-3 group-hover:border-primary/50 transition-colors">
                            <Users className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Quota</div>
                            <div className="text-sm font-bold">Max {schedule.max_teams} Teams</div>
                          </div>
                        </div>
                        <div className="flex items-center text-white/80 group">
                          <div className="w-8 h-8 rounded-lg glass border border-primary/20 flex items-center justify-center mr-3 group-hover:border-primary/50 transition-colors">
                            <Zap className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <div className="text-[10px] font-black text-primary/60 uppercase tracking-widest leading-none mb-1">Maps</div>
                            <div className="text-sm font-bold text-primary">{(schedule as any).maps_count || 4} Maps</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex -space-x-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-background glass bg-gradient-to-br from-white/10 to-transparent" />
                      ))}
                      <div className="w-10 h-10 rounded-full border-2 border-background glass flex items-center justify-center text-[10px] font-black">
                        +12
                      </div>
                    </div>
                     <ScheduleClient
                      scheduleId={schedule.id}
                      scheduleTitle={schedule.title}
                      userTeam={userTeamBySchedule[schedule.id]?.team || userTeam}
                      hasTeamForThisSchedule={!!userTeamBySchedule[schedule.id]}
                      requestStatusForSchedule={userTeamBySchedule[schedule.id]?.status}
                      user={user}
                      registrationStatus={schedule.registration_status}
                      logoRequired={schedule.logo_required}
                      isUserVip={!!userVipStatus}
                      mapsCount={(schedule as any).maps_count || 4}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-card p-20 text-center border-dashed border-white/10 opacity-50">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground lowercase font-black tracking-widest">ამჟამად დაგეგმილი მატჩები არ არის</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
