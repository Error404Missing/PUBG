import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Calendar, KeyRound, Lock, Map as MapIcon, Hash, Info, Shield, Target } from "lucide-react"
import { format } from "date-fns"
import { ka } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"

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

  if (!isManager && !isAdmin) {
    redirect("/")
  }

  // Fetch user's team
  const { data: teamData } = await supabase
    .from("teams")
    .select("id, slot_number, team_name")
    .eq("leader_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  // Fetch all active schedules
  const { data: allSchedules } = await supabase
    .from("schedules")
    .select("*")
    .eq("is_active", true)
    .order("date", { ascending: true })

  // Fetch user's approved requests for these schedules
  let approvedScheduleIds: string[] = []
  if (teamData) {
    const { data: approvedRequests } = await supabase
      .from("scrim_requests")
      .select("schedule_id")
      .eq("team_id", teamData.id)
      .eq("status", "approved")
    
    approvedScheduleIds = approvedRequests?.map(r => r.schedule_id) || []
  }

  return (
    <div className="min-h-screen py-32 px-4 relative overflow-hidden bg-background">
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,rgba(0,180,255,0.03),transparent_70%)] -z-10" />

      <div className="container mx-auto max-w-5xl relative">
        <div className="mb-20 text-center animate-reveal">
           <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] glass border border-primary/20 mb-8 relative group">
            <Lock className="w-10 h-10 text-primary transition-transform group-hover:scale-110 duration-500" />
            <div className="absolute inset-0 rounded-[2rem] bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 text-white tracking-tighter italic uppercase leading-none">
            Tactical <span className="text-primary tracking-normal">Intel</span>
          </h1>
          <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto italic">
            თამაშის დეტალები და შესვლის მონაცემები ყველა აქტიური ოპერაციისთვის
          </p>
        </div>

        <div className="space-y-16">
          {allSchedules?.sort((a, b) => {
            const aApproved = approvedScheduleIds.includes(a.id)
            const bApproved = approvedScheduleIds.includes(b.id)
            if (aApproved && !bApproved) return -1
            if (!aApproved && bApproved) return 1
            return new Date(a.date).getTime() - new Date(b.date).getTime()
          }).map((schedule, i) => {
            const isApproved = approvedScheduleIds.includes(schedule.id)
            
            return (
              <div key={schedule.id} className="animate-reveal" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={`glass-card p-1 border-white/5 relative overflow-hidden ${isApproved ? 'shadow-[0_0_80px_-12px_rgba(0,180,255,0.2)] scale-[1.02] border-primary/30' : 'opacity-60 grayscale-[0.5] grayscale hover:grayscale-0 transition-all'}`}>
                  {/* Status Indicator for Approved matches */}
                  {isApproved && (
                    <div className="absolute top-0 right-0 px-6 py-2 bg-emerald-500 text-black font-black text-[10px] uppercase tracking-widest italic rounded-bl-2xl z-20">
                      Approved_Unit_Active
                    </div>
                  )}

                  {/* Match Header */}
                  <div className={`p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${isApproved ? 'bg-primary/10' : 'bg-white/2'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${isApproved ? 'bg-primary/20 border-primary/30' : 'bg-white/5 border-white/10'}`}>
                        <Target className={`w-6 h-6 ${isApproved ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                           <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">{schedule.title}</h2>
                           {isApproved && <Badge className="bg-primary/20 text-primary border-primary/30 animate-pulse-soft">Confirmed</Badge>}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(schedule.date), "PPP", { locale: ka })}</span>
                          <span className="flex items-center gap-1 italic"><Hash className="w-3 h-3" /> {new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tbilisi', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(schedule.date))}</span>
                        </div>
                      </div>
                    </div>
                    {!isApproved && (
                       <div className="text-[10px] font-black text-white/20 uppercase tracking-widest italic">Standby_Mode</div>
                    )}
                  </div>

                  <div className="p-8 lg:p-12">
                    {isApproved ? (
                      /* Show Room Info */
                      <div className="space-y-8">
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                          <div className="glass p-6 rounded-2xl border border-white/10 space-y-2 group hover:border-primary/50 transition-colors bg-black/40">
                             <div className="flex items-center justify-between">
                                <div className="text-[10px] font-black text-primary uppercase tracking-widest italic">Room ID</div>
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                             </div>
                             <div className="text-2xl font-black text-white italic tracking-tighter break-all select-all cursor-pointer hover:text-primary transition-colors" title="დააკლიკეთ მოსანიშნად">
                                {schedule.room_id || "PENDING"}
                             </div>
                          </div>
                          <div className="glass p-6 rounded-2xl border border-white/10 space-y-2 group hover:border-primary/50 transition-colors bg-black/40">
                             <div className="flex items-center justify-between">
                                <div className="text-[10px] font-black text-primary uppercase tracking-widest italic">Password</div>
                                <KeyRound className="w-3 h-3 text-primary/50" />
                             </div>
                             <div className="text-2xl font-black text-white italic tracking-tighter break-all select-all cursor-pointer hover:text-primary transition-colors" title="დააკლიკეთ მოსანიშნად">
                                {schedule.room_password || "PENDING"}
                             </div>
                          </div>
                          <div className="glass p-6 rounded-2xl border border-white/10 space-y-2 group hover:border-primary/30 transition-colors">
                            <div className="text-[10px] font-black text-sky-400 uppercase tracking-widest italic">Sector (Map)</div>
                            <div className="text-2xl font-black text-white italic tracking-tighter uppercase">{(schedule as any).room_map || schedule.map_name || "N/A"}</div>
                          </div>
                          <div className="glass p-6 rounded-2xl border border-amber-500/10 bg-amber-500/5 space-y-2 group hover:border-amber-500/30 transition-colors">
                             <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest italic">Room Start Time</div>
                             <div className="text-2xl font-black text-white italic tracking-tighter uppercase">
                                {(schedule as any).room_time || (schedule.date ? new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tbilisi', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(schedule.date)) : "N/A")}
                             </div>
                          </div>
                          <div className="glass p-6 rounded-2xl border border-emerald-500/10 bg-emerald-500/5 space-y-2">
                             <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">Your Slot</div>
                             <div className="text-3xl font-black text-white italic tracking-tighter">#{teamData?.slot_number || "TBD"}</div>
                          </div>
                        </div>

                        {/* Visual Distinction for Multiple Rooms */}
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 italic flex items-center gap-4">
                           <Info className="w-5 h-5 text-primary" />
                           <p className="text-xs text-muted-foreground">
                              თქვენ ხართ ამ კონკრეტულ ოთახში (<b>{schedule.title}</b>). 
                              დარწმუნდით რომ შედიხართ სწორ სლოტზე: <b>#{teamData?.slot_number || "TDB"}</b>.
                           </p>
                        </div>
                      </div>
                    ) : (
                      /* Restricted Message */
                      <div className="flex items-center gap-6 p-8 rounded-2xl bg-white/2 border border-white/5 italic opacity-40">
                         <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                            <Lock className="w-6 h-6 text-white/20" />
                         </div>
                         <div className="space-y-1">
                            <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest text-[10px]">Access_Denied</p>
                            <p className="text-xs text-white/40">ამ ოპერაციის მონაცემები თქვენთვის დახურულია.</p>
                         </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {(!allSchedules || allSchedules.length === 0) && (
            <div className="glass-card p-32 text-center opacity-50">
               <Calendar className="w-16 h-16 text-white/10 mx-auto mb-6" />
               <p className="text-muted-foreground font-black text-[10px] tracking-widest uppercase italic font-bold">აქტიური განრიგი ვერ მოიძებნა</p>
            </div>
          )}
        </div>

        {approvedScheduleIds.length > 0 && (
          <div className="mt-20 glass-card p-12 border-sky-500/20 bg-sky-500/5 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <Target className="w-48 h-48 text-white" />
             </div>
             <div className="relative z-10">
                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-6 leading-none">Tactical Briefing</h3>
                <div className="grid md:grid-cols-2 gap-10">
                   <div className="space-y-4">
                      <p className="text-sm text-muted-foreground leading-relaxed flex items-start gap-4 italic font-bold">
                         <span className="w-2 h-2 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                         გამოიყენეთ მითითებული ოთახის ID და პაროლი თამაშში შესასველად.
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed flex items-start gap-4 italic font-bold">
                         <span className="w-2 h-2 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                         დაიკავეთ მხოლოდ თქვენი კუთვნილი სლოტი, წინააღმდეგ შემთხვევაში გაიკიკებით.
                      </p>
                   </div>
                   <div className="space-y-4">
                      <p className="text-sm text-muted-foreground leading-relaxed flex items-start gap-4 italic font-bold">
                         <span className="w-2 h-2 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                         აკრძალულია ინფორმაციის გადაცემა მესამე პირებისთვის.
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed flex items-start gap-4 italic font-bold">
                         <span className="w-2 h-2 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                         შესვლა დაიწყეთ მითითებულ დროს 10-15 წუთით ადრე.
                      </p>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}
