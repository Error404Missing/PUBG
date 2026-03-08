import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { User, Mail, MessageSquare, Shield, Edit, Send, Award, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: userTeam } = await supabase
    .from("teams")
    .select("*")
    .eq("leader_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  let userVipStatus = null
  if (user) {
    const { data: vipData } = await supabase
      .from("user_vip_status")
      .select("vip_until")
      .eq("user_id", user.id)
      .single()

    if (vipData && new Date(vipData.vip_until) > new Date()) {
      userVipStatus = vipData
    }
  }

  async function requestScrim() {
    "use server"
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    await supabase.from("teams").update({ status: "pending" }).eq("leader_id", user.id).eq("status", "draft")

    redirect("/profile")
  }

  return (
    <div className="min-h-screen py-32 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-6xl relative">
        <div className="mb-16 animate-reveal">
           <div className="flex items-center gap-6 mb-4">
              <div className="w-16 h-16 rounded-2xl glass border border-primary/20 flex items-center justify-center">
                 <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                 <h1 className="text-4xl lg:text-5xl font-black text-white italic tracking-tighter uppercase uppercase">Command <span className="text-primary tracking-normal">Center</span></h1>
                 <p className="text-muted-foreground font-light tracking-[0.2em] uppercase text-xs">მართე შენი ანგარიში და გუნდი</p>
              </div>
           </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8 animate-reveal" style={{ animationDelay: '0.1s' }}>
             <div className="glass-card p-1">
                <div className="p-8">
                   <h2 className="text-xl font-black text-white italic tracking-tighter mb-8 uppercase flex items-center gap-3">
                      <User className="w-5 h-5 text-primary" />
                      Operator Intel
                   </h2>
                   
                   <div className="space-y-6">
                      <div className="group">
                         <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 group-hover:text-primary transition-colors">Callsign</div>
                         <div className="text-lg font-bold text-white italic">{profile?.username || "N/A"}</div>
                      </div>
                      
                      <div className="group">
                         <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 group-hover:text-primary transition-colors">Comm-Link</div>
                         <div className="text-sm font-bold text-white/70 break-all">{profile?.email || "N/A"}</div>
                      </div>

                      <div className="group">
                         <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 group-hover:text-primary transition-colors">Secure Chat</div>
                         <div className="text-lg font-bold text-white italic">{profile?.discord_username || "Not Linked"}</div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-4">
                        {profile?.is_admin && (
                           <Badge variant="gold" className="px-4 py-1.5 text-[10px]">
                              <Shield className="w-3 h-3 mr-2" />
                              ADMIN_LEVEL_01
                           </Badge>
                        )}
                        {userVipStatus && (
                           <Badge variant="gold" className="px-4 py-1.5 text-[10px]">
                              <Zap className="w-3 h-3 mr-2" />
                              VIP_ELITE
                           </Badge>
                        )}
                        {profile?.badge && (
                           <Badge className="bg-primary text-black px-4 py-1.5 text-[10px] font-black">
                              <Award className="w-3 h-3 mr-2" />
                              {profile.badge.toUpperCase()}
                           </Badge>
                        )}
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="lg:col-span-2 animate-reveal" style={{ animationDelay: '0.2s' }}>
             <div className="glass-card p-1">
                <div className="p-8 lg:p-12">
                   <div className="flex items-center justify-between mb-12">
                      <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Unit Status</h2>
                      {userTeam && (
                         <div className="flex gap-2">
                           {userTeam.status === "draft" && <Badge variant="outline" className="border-white/20 text-white/40 uppercase italic px-4 py-1">Draft</Badge>}
                           {userTeam.status === "pending" && <Badge variant="gold" className="animate-pulse uppercase italic px-4 py-1">Awaiting Intel</Badge>}
                           {userTeam.status === "approved" && <Badge className="bg-green-500/20 text-green-500 border border-green-500/20 uppercase italic px-4 py-1">Authorized</Badge>}
                           {userTeam.status === "rejected" && <Badge className="bg-red-500/20 text-red-500 border border-red-500/20 uppercase italic px-4 py-1">Terminated</Badge>}
                           {userTeam.is_vip && <Badge variant="gold">ELITE</Badge>}
                         </div>
                      )}
                   </div>

                   {userTeam ? (
                      <div className="space-y-12">
                         <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                            <div>
                               <div className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2 leading-none">Unit Designation</div>
                               <h3 className="text-5xl lg:text-7xl font-black text-white italic tracking-tighter leading-none">{userTeam.team_name}</h3>
                               <div className="mt-4 text-2xl font-black text-white/20 italic tracking-widest leading-none">[{userTeam.team_tag}]</div>
                            </div>
                            
                            {userTeam.slot_number && (
                               <div className="p-8 glass border border-primary/20 rounded-3xl text-center">
                                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Operations Slot</div>
                                  <div className="text-4xl font-black text-primary italic">#{userTeam.slot_number}</div>
                               </div>
                            )}
                         </div>

                         <div className="grid sm:grid-cols-2 gap-6">
                            <div className="glass p-8 rounded-3xl border border-white/5 group hover:border-primary/30 transition-all">
                               <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Tactical Strength</div>
                               <div className="flex items-baseline gap-2">
                                  <span className="text-4xl font-black text-white italic">{userTeam.players_count || 0}</span>
                                  <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Operators</span>
                               </div>
                            </div>
                            <div className="glass p-8 rounded-3xl border border-white/5 group hover:border-primary/30 transition-all">
                               <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Map Proficiency</div>
                               <div className="flex items-baseline gap-2">
                                  <span className="text-4xl font-black text-white italic">{userTeam.maps_count || 0}</span>
                                  <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Sectors</span>
                               </div>
                            </div>
                         </div>

                         <div className="pt-8 border-t border-white/5 flex flex-wrap gap-4">
                            {userTeam.status === "draft" && (
                               <>
                                  <Button asChild variant="outline" className="h-16 px-10 rounded-2xl border-white/10 hover:bg-white/5 font-black uppercase tracking-widest text-xs">
                                     <Link href="/profile/edit-team">
                                        <Edit className="w-4 h-4 mr-3" />
                                        Mod Unit
                                     </Link>
                                  </Button>
                                  <form action={requestScrim} className="flex-1 min-w-[200px]">
                                     <Button variant="premium" type="submit" className="w-full h-16 rounded-2xl">
                                        <Send className="w-4 h-4 mr-3" />
                                        Deploy to Scrim
                                     </Button>
                                  </form>
                               </>
                            )}
                            {userTeam.status === "pending" && (
                               <div className="p-6 glass border border-primary/20 rounded-2xl w-full">
                                  <p className="text-sm italic font-light text-primary flex items-center gap-3">
                                     <Zap className="w-5 h-5 animate-pulse" />
                                     თქვენი გუნდი ელოდება ადმინისტრაციის დადასტურებას.
                                  </p>
                               </div>
                            )}
                            {userTeam.status === "rejected" && (
                               <div className="space-y-6 w-full">
                                  <div className="p-6 glass border border-red-500/20 rounded-2xl bg-red-500/5">
                                     <p className="text-sm italic font-light text-red-400">
                                        თქვენი გუნდი უარყოფილია. გთხოვთ შეამოწმოთ მონაცემები.
                                     </p>
                                  </div>
                                  <Button asChild variant="premium" className="h-16 w-full lg:w-fit px-12">
                                     <Link href="/profile/register-team">New Registration</Link>
                                  </Button>
                               </div>
                            )}
                         </div>
                      </div>
                   ) : (
                      <div className="text-center py-24 glass border border-white/5 rounded-[3rem]">
                         <div className="w-20 h-20 rounded-3xl glass border border-white/10 flex items-center justify-center mx-auto mb-8">
                            <Zap className="w-10 h-10 text-white/20" />
                         </div>
                         <p className="text-muted-foreground italic font-light mb-10 max-w-xs mx-auto">თქვენ ჯერ არ გაქვთ რეგისტრირებული გუნდი Arena-ზე.</p>
                         <Button asChild variant="premium" className="h-16 px-12">
                            <Link href="/profile/register-team">Register Unit</Link>
                         </Button>
                      </div>
                   )}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
