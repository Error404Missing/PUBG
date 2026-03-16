"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import {
   User, Mail, Shield, Award, Zap, Hash,
   MessageSquare, ChevronLeft, ExternalLink,
   Target, Calendar, Users, Instagram, Music2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { format, formatDistanceToNow } from "date-fns"
import { ka } from "date-fns/locale"

export default function PublicProfilePage() {
   const supabase = createBrowserClient()
   const router = useRouter()
   const { id } = useParams()
   const [loading, setLoading] = useState(true)
   const [profile, setProfile] = useState<any>(null)
   const [userTeam, setUserTeam] = useState<any>(null)
   const [vipStatus, setVipStatus] = useState<any>(null)

   useEffect(() => {
      if (id) {
         fetchUserData()
      }
   }, [id])

   const fetchUserData = async () => {
      setLoading(true)

      // Fetch Profile
      const { data: profileData, error: profileError } = await supabase
         .from("profiles")
         .select("*")
         .eq("id", id)
         .single()

      if (profileData) {
         setProfile(profileData)
      } else {
         console.error("Profile Fetch Error:", profileError)
         router.push("/404")
         return
      }

      // Fetch Team
      const { data: teamData } = await supabase
         .from("teams")
         .select("*")
         .eq("leader_id", id)
         .eq("status", "approved")
         .maybeSingle()

      setUserTeam(teamData)

      // Fetch VIP
      const { data: vipData } = await supabase
         .from("user_vip_status")
         .select("vip_until")
         .eq("user_id", id)
         .maybeSingle()

      if (vipData && new Date(vipData.vip_until) > new Date()) {
         setVipStatus(vipData)
      }

      setLoading(false)
   }

   if (loading) {
      return (
         <div className="min-h-screen flex items-center justify-center">
            <div className="space-y-4 text-center">
               <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
               <p className="text-muted-foreground animate-pulse uppercase tracking-widest text-[10px] font-black">Scanning Identity...</p>
            </div>
         </div>
      )
   }

   return (
      <div className="min-h-screen py-32 px-4 relative overflow-hidden bg-background">
         {/* Background Decor */}
         <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,rgba(255,180,0,0.05),transparent_70%)] -z-10" />
         <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_100%,rgba(0,180,255,0.03),transparent_70%)] -z-10" />

         <div className="container mx-auto max-w-6xl relative">
            <Link
               href="/teams"
               className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-12 group"
            >
               <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">გუნდებში დაბრუნება</span>
            </Link>

            {/* Profile Card */}
            <div className="glass-card overflow-hidden animate-reveal">
               {/* Banner */}
               <div className="h-64 md:h-80 relative overflow-hidden group">
                  {profile.banner_url ? (
                     <img src={profile.banner_url} alt="Banner" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                     <div className="w-full h-full bg-zinc-900" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
               </div>

               {/* Profile Header Info */}
               <div className="px-8 lg:px-12 pb-12 -mt-20 relative">
                  <div className="flex flex-col md:flex-row items-end gap-8 mb-12">
                     <div className="relative group">
                        <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] p-1.5 glass-darker border border-white/20 overflow-hidden shadow-2xl relative z-10">
                           <img
                              src={profile.avatar_url || "https://i.ibb.co/vzD7Z0M/default-avatar-dark.png"}
                              alt="Avatar"
                              className="w-full h-full object-cover rounded-[2.2rem]"
                           />
                        </div>
                        <div className="absolute inset-x-0 inset-y-0 bg-primary/20 blur-3xl rounded-full -z-10 opacity-50" />
                     </div>

                     <div className="flex-1 pb-4">
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                           <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
                              {profile.username}
                           </h1>
                           <div className="flex gap-2">
                              {profile.is_admin && <Badge variant="secondary" className="px-3 py-1 font-black text-[9px] tracking-widest uppercase italic">Admin_Lv3</Badge>}
                              {profile.role === 'manager' && <Badge variant="premium" className="px-3 py-1 font-black text-[9px] tracking-widest uppercase italic bg-blue-500/20 text-blue-400 border-blue-500/20">Manager</Badge>}
                              {vipStatus && <Badge variant="gold" className="px-3 py-1 font-black text-[9px] tracking-widest uppercase italic">Elite</Badge>}
                              {profile.badge && <Badge className="bg-primary/20 text-primary border border-primary/20 px-3 py-1 font-black text-[9px] tracking-widest uppercase italic">{profile.badge}</Badge>}
                           </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-6 text-muted-foreground italic text-xs tracking-widest font-bold uppercase">
                           <div className="flex items-center gap-2">
                              <User className="w-3.5 h-3.5 text-primary" />
                              ID: {profile.id.slice(0, 8)}
                           </div>
                           <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-primary" />
                              შემოუერთდა: {format(new Date(profile.created_at), "MMMM yyyy", { locale: ka })}
                           </div>
                           <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${
                                 profile?.last_seen_at && new Date().getTime() - new Date(profile.last_seen_at).getTime() < 1000 * 60 * 3
                                    ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                                    : 'bg-zinc-600'
                              }`} />
                              <span className="text-[10px] font-black uppercase tracking-widest italic text-white/50">
                                 {profile?.last_seen_at && new Date().getTime() - new Date(profile.last_seen_at).getTime() < 1000 * 60 * 3
                                    ? 'ხაზზეა'
                                    : (profile?.last_seen_at && new Date(profile.last_seen_at).getFullYear() > 2024)
                                       ? `ბოლოს ნანახია: ${formatDistanceToNow(new Date(profile.last_seen_at), { addSuffix: true, locale: ka })}`
                                       : 'ხაზგარეშე'}
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-8">
                     {/* Bio & Details */}
                     <div className="lg:col-span-2 space-y-8">
                        <div className="glass p-8 md:p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group">
                           <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-6 italic flex items-center gap-2">
                              <MessageSquare className="w-3 h-3" />
                              Unit_Biography
                           </h3>
                           <p className="text-muted-foreground font-light leading-relaxed italic text-lg whitespace-pre-wrap">
                              {profile.bio || "ინფორმაცია პროფილის შესახებ არ არის მითითებული."}
                           </p>
                           <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                              <Shield className="w-48 h-48 text-white" />
                           </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                           <div className="glass p-8 rounded-[2.5rem] border border-white/5 group hover:border-primary/20 transition-colors">
                              <div className="flex items-center justify-between mb-4">
                                 <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Hash className="w-5 h-5 text-primary" />
                                 </div>
                                 <div className="text-[8px] font-black text-white/20 uppercase tracking-widest italic">Discord_Intel</div>
                              </div>
                              <div className="text-xl font-black text-white italic tracking-tight truncate">{profile.discord_username || "Not Connected"}</div>
                              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1 italic">Communication_Link</div>
                           </div>

                           <div className="glass p-8 rounded-[2.5rem] border border-white/5 group hover:border-blue-400/20 transition-colors">
                              <div className="flex items-center justify-between mb-4">
                                 <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center">
                                    <Award className="w-5 h-5 text-blue-400" />
                                 </div>
                                 <div className="text-[8px] font-black text-white/20 uppercase tracking-widest italic">Honor_Index</div>
                              </div>
                              <div className="text-xl font-black text-white italic tracking-tight truncate">{vipStatus ? "Elite_Rank" : "Standard_Rank"}</div>
                              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1 italic">Security_Access_Lv</div>
                           </div>

                           <div className="glass p-8 rounded-[2.5rem] border border-white/5 group hover:border-primary/20 transition-colors">
                              <div className="flex items-center justify-between mb-4">
                                 <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Instagram className="w-5 h-5 text-primary" />
                                 </div>
                                 <div className="text-[8px] font-black text-white/20 uppercase tracking-widest italic">Instagram</div>
                              </div>
                              {profile.instagram_url ? (
                                 <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer" className="text-xl font-black text-white italic tracking-tight hover:text-primary transition-colors hover:underline truncate block">
                                    View Profile
                                 </a>
                              ) : (
                                 <div className="text-xl font-black text-white italic tracking-tight truncate">Not Connected</div>
                              )}
                              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1 italic">Social_Link</div>
                           </div>

                           <div className="glass p-8 rounded-[2.5rem] border border-white/5 group hover:border-primary/20 transition-colors">
                              <div className="flex items-center justify-between mb-4">
                                 <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Music2 className="w-5 h-5 text-primary" />
                                 </div>
                                 <div className="text-[8px] font-black text-white/20 uppercase tracking-widest italic">TikTok</div>
                              </div>
                              {profile.tiktok_url ? (
                                 <a href={profile.tiktok_url} target="_blank" rel="noopener noreferrer" className="text-xl font-black text-white italic tracking-tight hover:text-primary transition-colors hover:underline truncate block">
                                    View Profile
                                 </a>
                              ) : (
                                 <div className="text-xl font-black text-white italic tracking-tight truncate">Not Connected</div>
                              )}
                              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1 italic">Social_Link</div>
                           </div>
                        </div>
                     </div>

                     {/* Team Info */}
                     <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] ml-4 italic">Assigned_Unit</h3>
                        {userTeam ? (
                           <div className={`glass-card p-1 group transition-transform hover:scale-[1.02] duration-500 ${userTeam.is_vip ? 'border-secondary/30' : ''}`}>
                              <div className="p-8 space-y-6">
                                 <div className="flex items-start justify-between">
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                       <Users className={`w-7 h-7 ${userTeam.is_vip ? 'text-secondary' : 'text-primary'}`} />
                                    </div>
                                    <Badge variant="outline" className="border-white/10 text-[9px] font-black italic tracking-widest uppercase">Member Since {format(new Date(userTeam.created_at), "yyyy")}</Badge>
                                 </div>
                                 <div>
                                    <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter truncate">{userTeam.team_name}</h4>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">[{userTeam.team_tag}] Tactical Unit</p>
                                 </div>
                                 <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                       <Target className="w-4 h-4 text-primary" />
                                       <span className="text-xs font-bold text-white">{userTeam.maps_count} Maps</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                       <Zap className="w-4 h-4 text-blue-400" />
                                       <span className="text-xs font-bold text-white">{userTeam.players_count} Players</span>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        ) : (
                           <div className="glass p-12 rounded-[3rem] border border-dashed border-white/10 text-center space-y-4">
                              <Users className="w-10 h-10 text-muted-foreground mx-auto opacity-20" />
                              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">No Tactical Unit Assigned</p>
                           </div>
                        )}

                        {/* Stats or other info could go here */}
                        <div className="glass p-8 rounded-[2.5rem] border border-white/5">
                           <div className="flex items-center gap-4 mb-6">
                              <div className="w-1 h-8 bg-primary rounded-full" />
                              <h4 className="text-lg font-black text-white italic uppercase tracking-tighter italic">Tactical Summary</h4>
                           </div>
                           <div className="space-y-4">
                              {[
                                 { label: "Matches", value: "Locked", icon: Zap },
                                 { label: "Win Rate", value: "Locked", icon: Target },
                                 { label: "Stability", value: "Verified", icon: Shield }
                              ].map((stat, i) => (
                                 <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-3">
                                       <stat.icon className="w-4 h-4 text-muted-foreground" />
                                       <span className="text-[10px] font-black uppercase text-muted-foreground italic">{stat.label}</span>
                                    </div>
                                    <span className={`text-[10px] font-black uppercase italic ${stat.value === 'Verified' ? 'text-emerald-400' : 'text-white/20'}`}>{stat.value}</span>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}
