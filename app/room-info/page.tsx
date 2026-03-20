import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Calendar, KeyRound, Lock, MapIcon, Hash, Info, Shield, Target, Trophy, Zap, Radio, Activity } from "lucide-react"
import { format } from "date-fns"
import { ka } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { CopyButton } from "@/components/copy-button"

export const dynamic = "force-dynamic"
export const revalidate = 0

import { getRoomInfoData } from "./server-helper"

export default async function RoomInfoPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // 1. Fetch ALL data via Service Role bypass
  const { 
    profile, 
    isAdmin, 
    isManager, 
    teamIds, 
    allRequests, 
    approvedRequests, 
    allSchedules,
    allSiteTeams,
    allSiteRequests,
    dbAuthId
  } = await getRoomInfoData(user.id)

  const approvedScheduleMap = new Map()
  approvedRequests.forEach((req: any) => {
    approvedScheduleMap.set(req.schedule_id, {
        team_name: req.teams?.team_name,
        slot_number: req.slot_number ?? req.teams?.slot_number, // prefer scrim_requests, fallback to teams
        preferred_maps: req.preferred_maps
    })
  })

  // Security redirect for non-admins with no team/requests
  if (!isAdmin && !isManager && teamIds.length === 0 && (allRequests?.length || 0) === 0) {
     redirect("/")
  }

  return (
    <div className="min-h-screen py-32 px-4 relative overflow-hidden bg-[#020204]">
      {/* Background Decor */}
      <div className="fixed inset-0 bg-mesh opacity-30 -z-10" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 -z-10 animate-pulse-soft" />
      <div className="container mx-auto max-w-5xl relative">
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

                  <div className={`p-8 md:p-10 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 ${isApproved ? 'bg-emerald-500/5' : 'bg-rose-500/[0.02]'}`}>
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all ${isApproved ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-white/5 border-white/10 text-white/20'}`}>
                        {isApproved ? <Activity className="w-7 h-7 animate-pulse" /> : <Lock className="w-7 h-7" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                           <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">{schedule.title}</h2>
                           {isApproved ? (
                              <Badge className="bg-emerald-500 text-white font-black text-[9px] px-3 py-1 rounded-sm italic animate-reveal">MATCH_READY_AUTHORIZED</Badge>
                           ) : (
                              <Badge variant="destructive" className="font-black text-[9px] px-3 py-1 rounded-sm italic opacity-50">PERMISSION_DENIED</Badge>
                           )}
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] mt-2 italic">
                          <span>{format(new Date(schedule.date), "PPP", { locale: ka })}</span>
                          <span className={isApproved ? "text-emerald-400" : "text-primary"}>{new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tbilisi', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(schedule.date))}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 lg:p-12">
                    {isApproved ? (
                      <div className="space-y-12">
                        {/* Status Message */}
                        <div className="flex items-center gap-4 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 animate-pulse-soft">
                           <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                              <Shield className="w-5 h-5 text-emerald-400" />
                           </div>
                           <div>
                              <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-1">Authorization_Verified</div>
                              <div className="text-sm font-bold text-white/90 italic tracking-tight">თქვენ გაქვთ წვდომა ამ მატჩის მონაცემებზე</div>
                           </div>
                        </div>

                        {/* Briefing Module - The Core Info */}
                        <div className="grid lg:grid-cols-2 gap-8">
                           {/* Left Side: Room Credentials */}
                           <div className="space-y-6">
                              <div className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] mb-4 italic">Mission_Briefing_Secure_Link</div>
                              
                              <div className="glass-darker p-8 rounded-[2rem] border border-white/5 space-y-8 relative overflow-hidden group">
                                 <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-[40px] rounded-full" />
                                 
                                 <div className="flex items-center justify-between relative group">
                                    <div>
                                       <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic mb-3">Room_ID</div>
                                       <div className="text-4xl font-black text-white italic tracking-tighter">
                                          {schedule.room_id || "NOT_ASSIGNED"}
                                       </div>
                                    </div>
                                    <CopyButton value={schedule.room_id || ""} label="Room ID" />
                                 </div>

                                 <div className="h-px bg-gradient-to-r from-white/10 to-transparent" />

                                 <div className="flex items-center justify-between relative group">
                                    <div>
                                       <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic mb-3">Pass_Key</div>
                                       <div className="text-4xl font-black text-white italic tracking-tighter">
                                          {schedule.room_password || "ENCRYPTED"}
                                       </div>
                                    </div>
                                    <CopyButton value={schedule.room_password || ""} label="Password" />
                                 </div>
                              </div>
                           </div>

                           {/* Right Side: Deployment Stats */}
                           <div className="space-y-6">
                              <div className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] mb-4 italic">Deployment_Intel</div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="glass-darker p-6 rounded-[1.5rem] border border-white/5 space-y-4">
                                    <div className="flex items-center gap-3">
                                       <MapIcon className="w-4 h-4 text-emerald-400" />
                                       <span className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">Map_Sector</span>
                                    </div>
                                    <div className="text-xl font-black text-white italic uppercase tracking-tighter">
                                       {(schedule as any).room_map || schedule.map_name || "PENDING"}
                                    </div>
                                 </div>

                                 <div className="glass-darker p-6 rounded-[1.5rem] border border-white/5 space-y-4">
                                    <div className="flex items-center gap-3">
                                       <Activity className="w-4 h-4 text-orange-400" />
                                       <span className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">Start_Time</span>
                                    </div>
                                    <div className="text-xl font-black text-white italic uppercase tracking-tighter">
                                       {(schedule as any).room_time || "LIVE"}
                                    </div>
                                 </div>
                                 
                                 {teamInfo && (
                                    <div className="col-span-2 glass p-8 rounded-[1.5rem] bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between relative overflow-hidden group">
                                       <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                          <Shield className="w-20 h-20 text-emerald-400" />
                                       </div>
                                       <div>
                                          <div className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] italic mb-3">თქვენი სლოტია:</div>
                                          <div className="text-lg font-black text-white italic tracking-tight">{teamInfo.team_name}</div>
                                       </div>
                                       <div className="text-6xl font-black text-emerald-400 italic tracking-tighter z-10">
                                          #{teamInfo.slot_number || "??"}
                                       </div>
                                    </div>
                                 )}
                              </div>
                           </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-24 space-y-8 opacity-40">
                         <div className="w-24 h-24 rounded-[2rem] glass border border-white/10 flex items-center justify-center">
                           <Lock className="w-10 h-10 text-white/40" />
                         </div>
                         <div className="text-center">
                            <h3 className="text-2xl font-black text-white/40 italic uppercase tracking-tighter leading-none mb-3">Access_Restricted</h3>
                            <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em]">ამ მატჩის მონაცემები თქვენთვის დახურულია.</p>
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
