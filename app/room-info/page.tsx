import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Calendar, KeyRound, Lock, Map as MapIcon, Hash, Info, Shield, Target, Bug, ClipboardCopy, Trophy, Zap, Radio, Activity } from "lucide-react"
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

  // 1. Fetch user's teams
  const { data: userTeams } = await supabase
    .from("teams")
    .select("*")
    .eq("leader_id", user.id)

  const teamIds = userTeams?.map(t => t.id) || []

  // 2. Fetch all requests for these teams
  const { data: requests } = await supabase
    .from("scrim_requests")
    .select("schedule_id, team_id, status")
    .in("team_id", teamIds)
  
  const approvedRequests = requests?.filter(r => r.status?.toLowerCase() === "approved") || []

  // 3. Create a map of schedule_id -> team_data
  const approvedScheduleMap = new Map()
  
  // From Approved Requests
  approvedRequests.forEach((req: any) => {
    const team = userTeams?.find(t => t.id === req.team_id)
    if (team) {
       approvedScheduleMap.set(req.schedule_id, team)
    }
  })

  // Fallback
  userTeams?.forEach(team => {
      if (team.schedule_id && team.status === 'approved') {
          if (!approvedScheduleMap.has(team.schedule_id)) {
             approvedScheduleMap.set(team.schedule_id, team)
          }
      }
  })

  // Fetch all active schedules
  const { data: allSchedules } = await supabase
    .from("schedules")
    .select("*")
    .eq("is_active", true)
    .order("date", { ascending: true })

  const approvedScheduleIds = Array.from(approvedScheduleMap.keys())

  if (!isAdmin && !isManager && approvedScheduleMap.size === 0) {
     redirect("/")
  }

  return (
    <div className="min-h-screen py-32 px-4 relative overflow-hidden bg-[#020204]">
      {/* Dynamic Background */}
      <div className="fixed inset-0 bg-mesh opacity-30 -z-10" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 -z-10 animate-pulse-soft" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 -z-10" />

      <div className="container mx-auto max-w-5xl relative">
        {/* Admin Hub Bar */}
        {isAdmin && (
           <div className="mb-12 animate-reveal">
              <div className="glass-darker p-4 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-primary/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Bug className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic leading-none">Access_Override</div>
                      <div className="text-sm font-black text-white italic tracking-tighter">ADMIN_OVERWATCH_ENABLED</div>
                    </div>
                    <div className="h-8 w-px bg-white/5" />
                    <div className="grid grid-cols-4 gap-6">
                      {[
                        { label: "Teams", value: teamIds.length },
                        { label: "Reqs", value: requests?.length || 0 },
                        { label: "Approve", value: approvedScheduleMap.size },
                        { label: "Role", value: profile?.role?.toUpperCase() }
                      ].map((stat, i) => (
                        <div key={i} className="space-y-0.5 text-center">
                          <div className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">{stat.label}</div>
                          <div className="text-[11px] font-black text-primary italic">{stat.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="px-4 py-2 rounded-xl bg-primary/5 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">
                   System_Stable
                </div>
              </div>
           </div>
        )}

        {/* Hero Section */}
        <div className="mb-24 text-center animate-reveal">
          <div className="relative inline-block mb-10">
            <div className="w-24 h-24 rounded-[2.5rem] glass border border-primary/20 flex items-center justify-center relative group">
              <div className="absolute inset-0 rounded-[2.5rem] bg-primary/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <Radio className="w-11 h-11 text-primary relative z-10 animate-pulse" />
            </div>
            <div className="absolute -top-4 -right-4 w-12 h-12 rounded-2xl glass border border-emerald-500/20 flex items-center justify-center animate-float-subtle">
               <Activity className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black mb-6 text-white tracking-tighter italic uppercase leading-[0.85] text-glow">
            Tactical <span className="text-primary tracking-normal opacity-80">Intel</span>
          </h1>
          <div className="flex items-center justify-center gap-4">
             <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/10" />
             <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.5em] italic">Operation_Secure_Link</p>
             <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/10" />
          </div>
        </div>

        <div className="space-y-16 lg:space-y-24">
          {allSchedules?.map((schedule, i) => {
            const teamInfo = approvedScheduleMap.get(schedule.id)
            const isApproved = !!teamInfo || isAdmin
            
            return (
              <div key={schedule.id} className="animate-reveal" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className={`glass-card p-1 relative group/card transition-all duration-700 ${isApproved ? 'border-primary/20 shadow-[0_0_80px_-15px_rgba(59,130,246,0.15)] bg-white/[0.02]' : 'opacity-40 grayscale hover:grayscale-0'}`}>
                  {/* Neon Glow on Hover */}
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 -z-10" />
                  
                  {/* Status Banner */}
                  {isApproved && (
                    <div className="absolute top-0 right-0 px-8 py-3 bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] italic rounded-bl-[2rem] z-20 shadow-xl shadow-primary/20 flex items-center gap-3">
                      <Zap className="w-3.5 h-3.5 fill-white animate-pulse" />
                      {isAdmin && !teamInfo ? 'Override_Access' : 'Authorized_Access'}
                    </div>
                  )}

                  {/* Header Module */}
                  <div className={`p-8 md:p-10 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors duration-500 ${isApproved ? 'bg-primary/5' : 'bg-black/20'}`}>
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${isApproved ? 'bg-primary/20 border-primary/40 text-glow scale-110' : 'bg-white/5 border-white/10'}`}>
                        <Target className={`w-7 h-7 ${isApproved ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-4 mb-1">
                           <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">{schedule.title}</h2>
                           {isApproved && (
                             <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-black text-[9px] tracking-widest px-3 py-1">
                               STATUS: CONFIRMED
                             </Badge>
                           )}
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] mt-2 italic">
                          <span className="flex items-center gap-2 px-2 py-0.5 rounded bg-white/5"><Calendar className="w-3 h-3 text-primary" /> {format(new Date(schedule.date), "PPP", { locale: ka })}</span>
                          <span className="flex items-center gap-2 px-2 py-0.5 rounded bg-white/5 text-primary"><Hash className="w-3 h-3" /> {new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tbilisi', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(schedule.date))}</span>
                        </div>
                      </div>
                    </div>
                    {!isApproved && (
                       <div className="px-6 py-3 rounded-2xl bg-black/40 border border-white/5 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] italic flex items-center gap-3">
                          <Lock className="w-3.5 h-3.5" />
                          STANDBY_PROTOCOL
                       </div>
                    )}
                  </div>

                  {/* Intel Modules Grid */}
                  <div className="p-8 lg:p-12">
                    {isApproved ? (
                      <div className="space-y-10">
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
                          {/* Room ID Module */}
                          <div className="glass-darker p-8 rounded-3xl border border-white/5 space-y-4 group/module hover:border-primary/40 hover:bg-white/[0.01] transition-all relative overflow-hidden h-[160px] flex flex-col justify-between">
                             <div className="flex items-center justify-between">
                                <span className="text-[11px] font-black text-primary uppercase tracking-[0.3em] italic opacity-60">Room_ID</span>
                                <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                                   <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                </div>
                             </div>
                             <div className="text-3xl font-black text-white italic tracking-tighter truncate text-glow group-hover/module:text-primary transition-colors">
                                {schedule.room_id || "NOT_ASSIGNED"}
                             </div>
                             <CopyButton value={schedule.room_id || ""} label="Room ID" />
                          </div>

                          {/* Password Module */}
                          <div className="glass-darker p-8 rounded-3xl border border-white/5 space-y-4 group/module hover:border-primary/40 transition-all relative overflow-hidden h-[160px] flex flex-col justify-between">
                             <div className="flex items-center justify-between">
                                <span className="text-[11px] font-black text-primary uppercase tracking-[0.3em] italic opacity-60">Pass_Key</span>
                                <KeyRound className="w-4 h-4 text-primary opacity-40 group-hover/module:rotate-12 transition-transform" />
                             </div>
                             <div className="text-3xl font-black text-white italic tracking-tighter truncate text-glow group-hover/module:text-primary transition-colors">
                                {schedule.room_password || "ENCRYPTED"}
                             </div>
                             <CopyButton value={schedule.room_password || ""} label="Password" />
                          </div>

                          {/* Map Module */}
                          <div className="glass-darker p-8 rounded-3xl border border-white/5 space-y-4 hover:border-accent/40 transition-all relative overflow-hidden h-[160px] flex flex-col justify-between bg-accent/[0.02]">
                            <div className="text-[11px] font-black text-accent uppercase tracking-[0.3em] italic opacity-60">Map_Sector</div>
                            <div className="text-2xl font-black text-white italic tracking-tighter uppercase flex items-center gap-3">
                               <MapIcon className="w-5 h-5 text-accent opacity-50" />
                               {(schedule as any).room_map || schedule.map_name || "PENDING"}
                            </div>
                          </div>

                          {/* Time Module */}
                          <div className="glass-darker p-8 rounded-3xl border border-white/5 space-y-4 hover:border-orange-500/40 transition-all relative overflow-hidden h-[160px] flex flex-col justify-between bg-orange-500/[0.02]">
                             <div className="text-[11px] font-black text-orange-400 uppercase tracking-[0.3em] italic opacity-60">Drop_Time</div>
                             <div className="text-2xl font-black text-white italic tracking-tighter uppercase flex items-center gap-3">
                                <Activity className="w-5 h-5 text-orange-400 opacity-50" />
                                {(schedule as any).room_time || (schedule.date ? new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tbilisi', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(schedule.date)) : "LIVE")}
                             </div>
                          </div>
                        </div>

                        {/* Player Specific Data */}
                        <div className="flex flex-col md:flex-row gap-6">
                           {teamInfo && (
                             <div className="flex-1 glass p-8 rounded-[2.5rem] border border-emerald-500/10 bg-emerald-500/[0.02] flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                                <div>
                                   <div className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em] italic mb-2">Deployed_Unit_Slot</div>
                                   <div className="text-sm font-bold text-white/50 tracking-wider">REG: {teamInfo.team_name}</div>
                                </div>
                                <div className="text-6xl font-black text-emerald-400 italic tracking-tighter group-hover:scale-110 transition-transform duration-500">
                                  #{teamInfo.slot_number || "??"}
                                </div>
                             </div>
                           )}
                           
                           <div className="flex-[1.5] glass p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 italic flex items-center gap-6">
                              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                 <Info className="w-6 h-6 text-primary" />
                              </div>
                              <div className="space-y-1">
                                 {isAdmin && !teamInfo ? (
                                   <>
                                      <p className="text-[11px] font-black text-white/40 uppercase tracking-widest italic leading-none">Status_Log</p>
                                      <p className="text-xs text-white/80 font-bold uppercase tracking-wide">თქვენ ხედავთ ამ ინფორმაციას რადგან ხართ **ადმინისტრატორი**.</p>
                                   </>
                                 ) : (
                                   <>
                                      <p className="text-[11px] font-black text-white/40 uppercase tracking-widest italic leading-none">Deployment_Protocol</p>
                                      <p className="text-xs text-white/80 font-bold uppercase tracking-wide leading-relaxed">
                                         თქვენ ხართ ამ კონკრეტულ ოთახში (<b>{schedule.title}</b>). დარწმუნდით რომ შედიხართ სწორ სლოტზე: <b className="text-emerald-400">#{teamInfo?.slot_number || "TDB"}</b>.
                                      </p>
                                   </>
                                 )}
                              </div>
                           </div>
                        </div>
                      </div>
                    ) : (
                      /* Access Denied Module */
                      <div className="flex flex-col items-center justify-center py-16 px-8 rounded-[3rem] bg-black/40 border border-white/5 space-y-6 opacity-60">
                         <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center relative group">
                            <Lock className="w-10 h-10 text-white/20 group-hover:text-white/40 transition-colors" />
                            <div className="absolute inset-0 rounded-[2rem] border border-white/10 group-hover:scale-110 transition-transform duration-500" />
                         </div>
                         <div className="text-center space-y-2">
                            <h3 className="text-2xl font-black text-white/40 italic uppercase tracking-tighter">Access_Restricted</h3>
                            <p className="text-xs text-white/20 font-bold uppercase tracking-[0.2em]">ამ ოპერაციის მონაცემები თქვენთვის დახურულია.</p>
                         </div>
                         <div className="px-6 py-2 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black text-white/10 uppercase tracking-widest italic">
                            Awaiting_Verification_Signature
                         </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {(!allSchedules || allSchedules.length === 0) && (
            <div className="glass-card p-40 text-center opacity-30">
               <Radio className="w-20 h-20 text-white/10 mx-auto mb-8 animate-pulse" />
               <p className="text-muted-foreground font-black text-xs tracking-[0.5em] uppercase italic">NO_OPERATIONS_FOUND</p>
            </div>
          )}
        </div>

        {/* Tactical Briefing Module */}
        {approvedScheduleIds.length > 0 && (
          <div className="mt-32 animate-reveal" style={{ animationDelay: '0.6s' }}>
             <div className="glass-card p-1 border-primary/10">
                <div className="p-10 md:p-16 relative overflow-hidden bg-primary/[0.01]">
                   <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none -rotate-12 translate-x-12 -translate-y-12">
                      <Shield className="w-64 h-64 text-white" />
                   </div>
                   
                   <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-10">
                         <div className="w-12 h-1 bg-primary rounded-full" />
                         <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">Tactical <span className="text-primary">Briefing</span></h3>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
                         {[
                           { title: "Authentication", content: "გამოიყენეთ მითითებული ოთახის ID და პაროლი თამაშში შესასველად. არ გასცეთ გარეშე პირებზე." },
                           { title: "Deployment", content: "დაიკავეთ მხოლოდ თქვენი კუთვნილი სლოტი. არასწორი სლოტის დაკავება გამოიწვევს კიკს." },
                           { title: "Timeline", content: "შესვლა დაიწყეთ მითითებულ დროს 10-15 წუთით ადრე, რათა თავიდან ავიცილოთ შეფერხებები." },
                           { title: "Communication", content: "ნებისმიერი პრობლემის შემთხვევაში გამოიყენეთ მხარდაჭერის ჩათი ან დაუკავშირდით ადმინისტრაციას." }
                         ].map((item, i) => (
                           <div key={i} className="space-y-3 group">
                              <div className="flex items-center gap-3">
                                 <div className="w-1.5 h-1.5 rounded-full bg-primary group-hover:scale-150 transition-transform" />
                                 <span className="text-[11px] font-black text-white uppercase tracking-widest italic">{item.title}</span>
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed font-bold italic border-l border-white/5 pl-4 ml-0.5">
                                 {item.content}
                              </p>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}
