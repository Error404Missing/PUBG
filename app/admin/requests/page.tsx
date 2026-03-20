import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Zap,
  ChevronLeft,
  Clock,
  CheckCircle,
  XCircle,
  Gamepad2,
  Users,
  Calendar,
  ArrowRight,
  Shield
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ka } from "date-fns/locale"
import { AdminRequestActions } from "@/components/admin-request-actions"

export default async function AdminRequestsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

  if (!profile?.is_admin) {
    redirect("/")
  }

  const { data: requests } = await supabase
    .from("scrim_requests")
    .select(`
      *,
      teams (id, team_name, team_tag, leader_id, logo_url),
      schedules (id, title, date)
    `)
    .order("created_at", { ascending: false })

  // Get team leader usernames
  const leaderIds = [...new Set(requests?.map((r) => r.teams?.leader_id).filter(Boolean) || [])]
  let leaderMap: Record<string, string> = {}
  let leaderVipMap: Record<string, boolean> = {}
  if (leaderIds.length > 0) {
    const { data: leaders } = await supabase
      .from("profiles")
      .select(`
        id, 
        username,
        user_vip_status(vip_until)
      `)
      .in("id", leaderIds)

    if (leaders) {
      for (const l of (leaders as any[])) {
        leaderMap[l.id] = l.username || "უცნობი"
        const vipUntil = l.user_vip_status?.[0]?.vip_until
        leaderVipMap[l.id] = vipUntil ? new Date(vipUntil) > new Date() : false
      }
    }
  }

  const pendingCount = requests?.filter((r) => r.status === "pending").length || 0
  const approvedCount = requests?.filter((r) => r.status === "approved").length || 0
  const rejectedCount = requests?.filter((r) => r.status === "rejected").length || 0

  return (
    <div className="min-h-screen py-32 px-4 relative overflow-hidden bg-background">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(0,180,255,0.03),transparent_70%)] -z-10" />

      <div className="container mx-auto max-w-7xl relative">
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-12 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">მართვის პანელი</span>
        </Link>

        {/* Header */}
        <div className="mb-16 animate-reveal">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-[2rem] glass border border-emerald-500/20 flex items-center justify-center relative group">
              <Gamepad2 className="w-10 h-10 text-emerald-400 transition-transform group-hover:scale-110 duration-500" />
              <div className="absolute inset-0 rounded-[2rem] bg-emerald-500/20 blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <h1 className="text-5xl lg:text-7xl font-black text-white italic tracking-tighter uppercase leading-none">Game <span className="text-emerald-400 tracking-normal">Requests</span></h1>
              <p className="text-muted-foreground font-light tracking-[0.3em] uppercase text-xs mt-4 italic">თამაშის მოთხოვნების ადმინისტრირება</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-reveal" style={{ animationDelay: '0.1s' }}>
          {[
            { label: "მოლოდინში", count: pendingCount, color: "yellow", icon: Clock },
            { label: "დადასტურებული", count: approvedCount, color: "emerald", icon: CheckCircle },
            { label: "უარყოფილი", count: rejectedCount, color: "rose", icon: XCircle }
          ].map((stat, i) => (
             <div key={i} className={`p-8 rounded-[2.5rem] glass border border-${stat.color}-500/10 group hover:scale-[1.02] transition-all duration-500`}>
                <div className="flex items-center justify-between mb-4">
                   <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                   </div>
                   <div className="text-[10px] font-black text-white/20 uppercase tracking-widest italic font-bold">Live_Stats</div>
                </div>
                <div className="text-4xl md:text-5xl font-black text-white italic tracking-tighter mb-1">{stat.count}</div>
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] italic">{stat.label}</div>
             </div>
          ))}
        </div>

        {/* Requests List */}
        <div className="space-y-6 animate-reveal" style={{ animationDelay: '0.2s' }}>
          {requests && requests.length > 0 ? (
            requests.map((req) => {
              const themeColor =
                req.status === "approved"
                  ? "emerald"
                  : req.status === "rejected"
                    ? "rose"
                    : "yellow"

              return (
                <div key={req.id} className={`glass-card p-1 transition-all duration-500 hover:scale-[1.005] ${
                   req.has_vip ? 'shadow-[0_0_50px_-12px_rgba(255,180,0,0.1)]' : ''
                }`}>
                   <div className="p-6 md:p-8">
                     <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                       <div className="flex-1 min-w-0">
                         <div className="flex flex-wrap items-center gap-4 mb-4">
                           <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-xl bg-${themeColor}-500/10 border border-${themeColor}-500/20 flex items-center justify-center overflow-hidden`}>
                                 {req.teams?.logo_url ? (
                                    <img src={req.teams.logo_url} alt={req.teams.team_name} className="w-full h-full object-cover" />
                                 ) : (
                                    <Shield className={`w-6 h-6 text-${themeColor}-400`} />
                                 )}
                              </div>
                              <div>
                                 <div className="flex items-center gap-2">
                                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">{req.teams?.team_name || "უცნობი გუნდი"}</h3>
                                    <span className="text-lg font-black text-white/20 italic tracking-widest">[{req.teams?.team_tag}]</span>
                                 </div>
                                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1 italic flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                       <Users className="w-3 h-3 text-primary" />
                                       ლიდერი: <span className="text-white">{req.teams?.leader_id ? leaderMap[req.teams.leader_id] || "უცნობი" : "უცნობი"}</span>
                                       {req.teams?.leader_id && leaderVipMap[req.teams.leader_id] && (
                                          <span className="flex items-center gap-1 text-secondary animate-pulse-soft">
                                            <Zap className="w-2.5 h-2.5 fill-current" />
                                            <span className="text-[8px] font-black">VIP_ACTIVE</span>
                                          </span>
                                        )}
                                    </div>
                                    <div className="text-[8px] font-mono text-white/30 truncate max-w-md">
                                       LEADER_UUID: {req.teams?.leader_id} | TEAM_ID: {req.teams?.id}
                                    </div>
                                  </div>
                              </div>
                           </div>

                           <div className="flex items-center gap-2">
                              {req.has_vip && (
                                <Badge variant="gold" className="px-3 py-1 font-black text-[9px] tracking-widest">
                                  <Zap className="w-3 h-3 mr-1" />
                                  ELITE_UNIT
                                </Badge>
                              )}
                              <Badge className={`px-3 py-1 uppercase italic font-black text-[9px] tracking-widest border ${
                                req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                req.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                'bg-red-500/10 text-red-400 border-red-500/20'
                              }`}>
                                {req.status === "approved" ? "Auth_Verified" : req.status === "rejected" ? "Denied" : "Awaiting_Review"}
                              </Badge>
                           </div>
                         </div>
                         
                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="glass p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                  <Calendar className="w-5 h-5 text-blue-400" />
                               </div>
                               <div>
                                  <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic">ოპერატიული_მატჩი</div>
                                  <div className="text-sm font-bold text-white italic tracking-tight">{req.schedules?.title || "უცნობი"}</div>
                               </div>
                            </div>
                            <div className="glass p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                  <Clock className="w-5 h-5 text-purple-400" />
                               </div>
                               <div>
                                  <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic">დროის_შტამპი</div>
                                  <div className="text-sm font-bold text-white italic tracking-tight lowercase">
                                     {req.schedules?.date ? format(new Date(req.schedules.date), "PPP", { locale: ka }) : "N/A"}
                                  </div>
                               </div>
                            </div>
                            <div className="glass p-4 rounded-2xl border border-amber-500/10 flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                                  <Gamepad2 className="w-5 h-5" />
                               </div>
                               <div>
                                  <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic">მაპები / სლოტი</div>
                                  <div className="text-sm font-bold text-white italic tracking-tight uppercase">
                                     {req.preferred_maps || 0} Maps {req.slot_number ? `| Slot #${req.slot_number}` : ""}
                                  </div>
                                </div>
                            </div>
                          </div>

                         <div className="mt-4 flex items-center gap-2 text-[9px] font-black text-white/30 uppercase tracking-[0.2em] italic">
                            Intel_Logged: {format(new Date(req.created_at), "PPP p", { locale: ka })}
                         </div>
                       </div>

                       {req.status === "pending" && (
                         <div className="flex-shrink-0 lg:pl-8 lg:border-l lg:border-white/5">
                            <AdminRequestActions requestId={req.id} teamId={req.teams?.id || ""} />
                         </div>
                       )}
                     </div>
                   </div>
                </div>
              )
            })
          ) : (
             <div className="glass-card p-20 text-center">
                <Gamepad2 className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-10" />
                <p className="text-muted-foreground font-black text-[10px] tracking-widest uppercase italic">მოთხოვნები არ მოიძებნა</p>
             </div>
          )}
        </div>
      </div>
    </div>
  )
}
