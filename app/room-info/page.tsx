import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Calendar, KeyRound, Lock, Map as MapIcon, Hash, Info, Shield, Target, Bug, ClipboardCopy, Trophy, Zap, Radio, Activity, Mail, UserCircle } from "lucide-react"
import { format } from "date-fns"
import { ka } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { CopyButton } from "@/components/copy-button"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function RoomInfoPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_admin")
    .eq("id", user.id)
    .single()

  const isManager = profile?.role === "manager"
  const isAdmin = profile?.is_admin

  // 1. Fetch user's profile and teams (DIAGNOSTIC)
  const [{ data: userTeams }, { data: allRequests }, { data: allSiteTeams }, { data: allSiteRequests }] = await Promise.all([
    supabase.from("teams").select("*").eq("leader_id", user.id),
    supabase.from("scrim_requests").select(`
        *,
        teams!inner(id, team_name, leader_id)
    `).eq("teams.leader_id", user.id),
    isAdmin ? supabase.from("teams").select("id, team_name, leader_id").limit(10) : Promise.resolve({ data: null }),
    isAdmin ? supabase.from("scrim_requests").select("id, team_id, status").limit(10) : Promise.resolve({ data: null })
  ])

  // Diagnostic values
  const teamIds = userTeams?.map(t => t.id) || []
  const approvedRequests = allRequests?.filter(r => 
      r.status?.toLowerCase() === "approved" || 
      r.status?.toLowerCase() === "verified"
  ) || []

  // Create a map of schedule_id -> request_info
  const approvedScheduleMap = new Map()
  approvedRequests.forEach((req: any) => {
    approvedScheduleMap.set(req.schedule_id, {
        team_name: req.teams?.team_name,
        slot_number: req.slot_number,
        preferred_maps: req.preferred_maps
    })
  })

  // Fetch all active schedules
  const { data: allSchedules } = await supabase
    .from("schedules")
    .select("*")
    .eq("is_active", true)
    .order("date", { ascending: true })

  const approvedScheduleIds = Array.from(approvedScheduleMap.keys())

  // Access Denial FIX: Only if user REALLY has no connection to teams AND is not Admin/Manager
  if (!isAdmin && !isManager && teamIds.length === 0 && (allRequests?.length || 0) === 0) {
     redirect("/")
  }

  return (
    <div className="min-h-screen py-32 px-4 relative overflow-hidden bg-[#020204]">
      {/* Background Decor */}
      <div className="fixed inset-0 bg-mesh opacity-30 -z-10" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 -z-10 animate-pulse-soft" />

      <div className="container mx-auto max-w-5xl relative">
        {/* DIAGNOSTIC PANEL FOR ALL USERS (FOR NOW) */}
        {(isAdmin || true) && (
           <div className="mb-12 animate-reveal">
              <div className="glass-darker p-6 rounded-[2.5rem] border border-white/5 space-y-4">
                 <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Bug className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">USER_CONTEXT_DIAGNOSTIC</div>
                        <div className="flex items-center gap-3 text-sm font-black text-white italic tracking-tighter uppercase">
                           <UserCircle className="w-4 h-4 text-primary" /> {user.email?.split('@')[0]}
                           <span className="w-1 h-1 rounded-full bg-white/10" />
                           <Mail className="w-4 h-4 text-primary" /> {user.email}
                        </div>
                      </div>
                    </div>
                    <div className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-[11px] font-black text-white/40 uppercase tracking-[0.2em] italic">
                       Status: {isAdmin ? 'ADMIN_MODE' : isManager ? 'MANAGER_MODE' : 'PLAYER_MODE'}
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-black/40 rounded-3xl border border-white/5">
                    {[
                        { label: "Full_Profile_UUID", value: user.id },
                        { label: "Teams_Found", value: teamIds.length },
                        { label: "Requests_Found", value: allRequests?.length || 0 },
                        { label: "Approved_Regs", value: approvedRequests.length }
                    ].map((s, i) => (
                      <div key={i} className="space-y-1 text-center border-r border-white/5 last:border-0 pr-4 last:pr-0">
                         <div className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">{s.label}</div>
                         <div className={`text-[11px] font-black text-primary italic break-all ${s.label.includes('UUID') ? 'text-[8px] font-mono' : ''}`}>{s.value}</div>
                      </div>
                    ))}
                 </div>

                 {isAdmin && (
                   <div className="mt-4 p-4 bg-orange-500/5 border border-orange-500/20 rounded-2xl space-y-3">
                      <div className="text-[9px] font-black text-orange-400 uppercase tracking-widest">Admin Site-Wide Sample Data (Diagnostics)</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-1">
                            <div className="text-[8px] text-white/20">Site Teams (Leader/Name):</div>
                            {(allSiteTeams as any[])?.map(t => (
                              <div key={t.id} className="text-[7px] font-mono text-white/40">
                                 {t.leader_id.slice(0,10)}.. | {t.team_name}
                              </div>
                            ))}
                         </div>
                         <div className="space-y-1">
                            <div className="text-[8px] text-white/20">Site Requests Status:</div>
                            {(allSiteRequests as any[])?.map(r => (
                              <div key={r.id} className="text-[7px] font-mono text-white/40">
                                 {r.id.slice(0,5)}.. | Status: {r.status}
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>
                 )}
              </div>
           </div>
        )}

        {/* Hero Section */}
        <div className="mb-24 text-center animate-reveal">
          <div className="relative inline-block mb-10">
            <div className="w-24 h-24 rounded-[2.5rem] glass border border-primary/20 flex items-center justify-center relative group">
              <Radio className="w-11 h-11 text-primary animate-pulse" />
            </div>
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-6 text-white tracking-tighter italic uppercase text-glow">
            Tactical <span className="text-primary opacity-80">Intel</span>
          </h1>
          <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.5em] italic">Operation_Secure_Link</p>
        </div>

        <div className="space-y-16">
          {allSchedules?.map((schedule, i) => {
            const teamInfo = approvedScheduleMap.get(schedule.id)
            const isApproved = !!teamInfo || isAdmin
            
            return (
              <div key={schedule.id} className="animate-reveal" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className={`glass-card p-1 relative overflow-hidden transition-all duration-700 ${isApproved ? 'border-primary/20 bg-white/[0.02]' : 'opacity-40 grayscale'}`}>
                  {isApproved && (
                    <div className="absolute top-0 right-0 px-8 py-3 bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] italic rounded-bl-[2rem] z-20 shadow-xl">
                      <Zap className="w-3.5 h-3.5 fill-white animate-pulse inline-block mr-2" />
                      {isAdmin && !teamInfo ? 'Override_Access' : 'Authorized_Access'}
                    </div>
                  )}

                  <div className={`p-8 md:p-10 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 ${isApproved ? 'bg-primary/5' : 'bg-black/20'}`}>
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all ${isApproved ? 'bg-primary/20 border-primary/40' : 'bg-white/5 border-white/10'}`}>
                        <Target className={`w-7 h-7 ${isApproved ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">{schedule.title}</h2>
                        <div className="flex items-center gap-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] mt-2 italic">
                          <span>{format(new Date(schedule.date), "PPP", { locale: ka })}</span>
                          <span className="text-primary">{new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tbilisi', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(schedule.date))}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 lg:p-12">
                    {isApproved ? (
                      <div className="space-y-10">
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                          {/* Room ID Module */}
                          <div className="glass-darker p-8 rounded-3xl border border-white/5 space-y-4 group relative overflow-hidden h-40 flex flex-col justify-between">
                             <div className="text-[11px] font-black text-primary uppercase tracking-[0.3em] italic opacity-60">Room_ID</div>
                             <div className="text-3xl font-black text-white italic tracking-tighter truncate text-glow">
                                {schedule.room_id || "NOT_ASSIGNED"}
                             </div>
                             <CopyButton value={schedule.room_id || ""} label="Room ID" />
                          </div>

                          {/* Password Module */}
                          <div className="glass-darker p-8 rounded-3xl border border-white/5 space-y-4 group relative overflow-hidden h-40 flex flex-col justify-between">
                             <div className="text-[11px] font-black text-primary uppercase tracking-[0.3em] italic opacity-60">Pass_Key</div>
                             <div className="text-3xl font-black text-white italic tracking-tighter truncate text-glow">
                                {schedule.room_password || "ENCRYPTED"}
                             </div>
                             <CopyButton value={schedule.room_password || ""} label="Password" />
                          </div>

                          {/* Map Module */}
                          <div className="glass-darker p-8 rounded-3xl border border-white/5 h-40 flex flex-col justify-between bg-accent/[0.02]">
                            <div className="text-[11px] font-black text-accent uppercase tracking-[0.3em] italic opacity-60">Map_Sector</div>
                            <div className="text-2xl font-black text-white italic uppercase flex items-center gap-3">
                               {(schedule as any).room_map || schedule.map_name || "PENDING"}
                            </div>
                          </div>

                          {/* Time Module */}
                          <div className="glass-darker p-8 rounded-3xl border border-white/5 h-40 flex flex-col justify-between bg-orange-500/[0.02]">
                             <div className="text-[11px] font-black text-orange-400 uppercase tracking-[0.3em] italic opacity-60">Drop_Time</div>
                             <div className="text-2xl font-black text-white italic uppercase">
                                {(schedule as any).room_time || "LIVE"}
                             </div>
                          </div>
                        </div>

                        {teamInfo && (
                         <div className="glass p-8 rounded-[2.5rem] bg-emerald-500/[0.02] border border-emerald-500/10 flex items-center justify-between">
                            <div>
                               <div className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em] italic mb-2">თქვენი გუნდის სლოტია:</div>
                               <div className="text-sm font-bold text-white/50 tracking-wider">REG: {teamInfo.team_name}</div>
                            </div>
                            <div className="text-6xl font-black text-emerald-400 italic tracking-tighter">
                              #{teamInfo.slot_number || "??"}
                            </div>
                         </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 space-y-6 opacity-40">
                         <Lock className="w-12 h-12 text-white/40" />
                         <div className="text-center">
                            <h3 className="text-xl font-black text-white/40 italic uppercase tracking-tighter leading-none mb-2">Access_Restricted</h3>
                            <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em]">ამ მატჩის მონაცემები თქვენთვის დახურულია.</p>
                         </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
