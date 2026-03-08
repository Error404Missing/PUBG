"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { 
  User, Mail, Shield, Edit3, Camera, 
  Award, Zap, Hash, MessageSquare, 
  ChevronRight, Save, LogOut, ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ProfilePage() {
  const supabase = createBrowserClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [userTeam, setUserTeam] = useState<any>(null)
  const [vipStatus, setVipStatus] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  
  // Edit States
  const [editData, setEditData] = useState({
    username: "",
    discord_username: "",
    bio: "",
    avatar_url: "",
    banner_url: ""
  })

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login")
      return
    }

    // Fetch Profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileData) {
      setProfile(profileData)
      setEditData({
        username: profileData.username || "",
        discord_username: profileData.discord_username || "",
        bio: profileData.bio || "",
        avatar_url: profileData.avatar_url || "",
        banner_url: profileData.banner_url || ""
      })
    }

    // Fetch Team
    const { data: teamData } = await supabase
      .from("teams")
      .select("*")
      .eq("leader_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()
    
    setUserTeam(teamData)

    // Fetch VIP
    const { data: vipData } = await supabase
      .from("user_vip_status")
      .select("vip_until")
      .eq("user_id", user.id)
      .single()

    if (vipData && new Date(vipData.vip_until) > new Date()) {
      setVipStatus(vipData)
    }

    setLoading(false)
  }

  const handleUpdate = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from("profiles")
      .update(editData)
      .eq("id", user.id)

    if (!error) {
      await fetchUserData()
      setIsEditing(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-background">
           <div className="space-y-4 text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground animate-pulse font-black text-[10px] tracking-widest uppercase">Decrypting Profile...</p>
           </div>
        </div>
     )
  }

  return (
    <div className="min-h-screen pb-20 bg-background relative selection:bg-primary/30">
      {/* Banner Section */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
         <div 
           className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
           style={{ 
             backgroundImage: `url(${profile?.banner_url || 'https://images.unsplash.com/photo-1624206112918-f140f087f9b5?q=80&w=2070&auto=format&fit=crop'})`,
           }}
         />
         <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
         
         {/* Profile Info Overlay */}
         <div className="absolute -bottom-1 left-0 w-full p-8 md:p-12">
            <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-end gap-6 md:gap-10">
               {/* Avatar */}
               <div className="relative group overflow-hidden">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] glass border-4 border-background overflow-hidden relative z-10">
                     <img 
                       src={profile?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + profile?.username} 
                       alt="Avatar"
                       className="w-full h-full object-cover"
                     />
                  </div>
                  <div className="absolute inset-0 rounded-[2.5rem] bg-primary/20 blur-xl -z-0 animate-pulse-soft" />
               </div>

               {/* Text Info */}
               <div className="flex-1 pb-2">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                     <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase">{profile?.username}</h1>
                     {vipStatus && (
                        <div className="flex items-center gap-1.5 bg-secondary/20 px-3 py-1 rounded-full text-secondary text-[10px] font-black tracking-widest border border-secondary/30">
                           <Zap className="w-3 h-3" />
                           VIP_ELITE
                        </div>
                     )}
                  </div>
                  <p className="text-muted-foreground text-xs font-bold tracking-[0.3em] uppercase flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                     {profile?.role || 'Operator'} // Active_Status
                  </p>
               </div>

               {/* Actions */}
               <div className="flex gap-3 pb-2">
                  <Button 
                    onClick={() => setIsEditing(!isEditing)}
                    variant={isEditing ? "outline" : "premium"}
                    className="h-12 px-6 rounded-2xl"
                  >
                     {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
                     {isEditing ? "Cancel" : "Modify Intel"}
                  </Button>
                  <Button onClick={handleLogout} variant="destructive" className="h-12 w-12 rounded-2xl p-0">
                     <LogOut className="w-4 h-4" />
                  </Button>
               </div>
            </div>
         </div>
      </div>

      <div className="container mx-auto max-w-6xl mt-12 px-8">
         <div className="grid lg:grid-cols-3 gap-12">
            {/* Left Column: Stats & Role */}
            <div className="space-y-8">
               {/* Role Card */}
               <div className="glass-card p-1">
                  <div className="p-8 space-y-6">
                     <div className="flex items-center justify-between">
                        <div className="text-[10px] font-black text-primary uppercase tracking-widest">Permission_Level</div>
                        <Shield className="w-4 h-4 text-primary" />
                     </div>
                     
                     <div className="space-y-4">
                        <div className="p-4 rounded-2xl glass border border-white/5 flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                 <Award className="w-4 h-4 text-primary" />
                              </div>
                              <span className="text-sm font-bold text-white uppercase tracking-wider">{profile?.role?.toUpperCase() || 'USER'}</span>
                           </div>
                           <Badge variant="outline" className="text-[8px] border-white/10 opacity-50">Verified</Badge>
                        </div>

                        {profile?.is_admin && (
                           <Link href="/admin" className="p-4 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-between group hover:bg-secondary/20 transition-all">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                                    <Shield className="w-4 h-4 text-secondary" />
                                 </div>
                                 <span className="text-sm font-bold text-secondary uppercase tracking-wider">Command_Center</span>
                              </div>
                              <ChevronRight className="w-4 h-4 text-secondary group-hover:translate-x-1 transition-transform" />
                           </Link>
                        )}
                     </div>
                  </div>
               </div>

               {/* Socials & Logs */}
               <div className="glass-card p-1">
                  <div className="p-8">
                     <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-6">Personal_Logs</h3>
                     
                     <div className="space-y-6">
                        <div className="flex items-center gap-4 group">
                           <div className="w-10 h-10 rounded-xl glass border border-white/5 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                              <Hash className="w-4 h-4" />
                           </div>
                           <div>
                              <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Discord_Link</div>
                              <div className="text-xs font-bold text-white tracking-wider">{profile?.discord_username || "Not Linked"}</div>
                           </div>
                        </div>

                        <div className="flex items-center gap-4 group">
                           <div className="w-10 h-10 rounded-xl glass border border-white/5 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                              <Mail className="w-4 h-4" />
                           </div>
                           <div>
                              <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Comm_Channel</div>
                              <div className="text-xs font-bold text-white tracking-wider truncate max-w-[150px]">{profile?.email}</div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Right Column: Content & Editing */}
            <div className="lg:col-span-2 space-y-8">
               {isEditing ? (
                  <div className="glass-card p-1 animate-reveal">
                     <div className="p-8 lg:p-12 space-y-8">
                        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Modify Intel</h2>
                        
                        <div className="grid md:grid-cols-2 gap-8">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2">Username</label>
                              <Input 
                                value={editData.username}
                                onChange={(e) => setEditData({...editData, username: e.target.value})}
                                className="h-14 bg-black/40 border-white/5 rounded-2xl focus:border-primary/50" 
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2">Discord ID</label>
                              <Input 
                                value={editData.discord_username}
                                onChange={(e) => setEditData({...editData, discord_username: e.target.value})}
                                className="h-14 bg-black/40 border-white/5 rounded-2xl focus:border-primary/50" 
                              />
                           </div>
                        </div>

                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2">Avatar URL</label>
                           <Input 
                             value={editData.avatar_url}
                             onChange={(e) => setEditData({...editData, avatar_url: e.target.value})}
                             placeholder="https://..."
                             className="h-14 bg-black/40 border-white/5 rounded-2xl focus:border-primary/50" 
                           />
                        </div>

                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2">Banner URL</label>
                           <Input 
                             value={editData.banner_url}
                             onChange={(e) => setEditData({...editData, banner_url: e.target.value})}
                             placeholder="https://..."
                             className="h-14 bg-black/40 border-white/5 rounded-2xl focus:border-primary/50" 
                           />
                        </div>

                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2">Bio / Callsign Status</label>
                           <textarea 
                             value={editData.bio}
                             onChange={(e) => setEditData({...editData, bio: e.target.value})}
                             className="w-full h-32 bg-black/40 border border-white/5 rounded-2xl p-4 text-sm focus:border-primary/50 outline-none transition-all"
                           />
                        </div>

                        <Button onClick={handleUpdate} variant="premium" className="h-16 w-full rounded-2xl text-md">
                           <Save className="w-5 h-5 mr-3" />
                           Commit Changes
                        </Button>
                     </div>
                  </div>
               ) : (
                  <div className="space-y-8">
                     {/* Bio Section */}
                     <div className="glass-card p-1">
                        <div className="p-8 lg:p-12">
                           <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-6">Tactical_Bio</h2>
                           <p className="text-muted-foreground font-light leading-relaxed whitespace-pre-wrap italic">
                              {profile?.bio || "No tactical data provided for this operator profile. Field logs are currently empty."}
                           </p>
                        </div>
                     </div>

                     {/* Unit Status Card */}
                     <div className="glass-card p-1">
                        <div className="p-8 lg:p-12 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-8">
                              <Zap className="w-20 h-20 text-white/5 group-hover:text-primary/10 transition-colors" />
                           </div>
                           
                           <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-10">Unit_Status</h2>

                           {userTeam ? (
                              <div className="space-y-10">
                                 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                    <div>
                                       <div className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2">Designation</div>
                                       <h3 className="text-5xl font-black text-white italic tracking-tighter leading-none">{userTeam.team_name}</h3>
                                       <div className="text-xl font-black text-white/20 italic tracking-widest mt-2 mt-4">[{userTeam.team_tag}]</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                       <Badge className={`px-4 py-1 uppercase italic ${
                                          userTeam.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-secondary/20 text-secondary'
                                       }`}>
                                          {userTeam.status}
                                       </Badge>
                                       {userTeam.is_vip && <Badge variant="gold">ELITE_UNIT</Badge>}
                                    </div>
                                 </div>

                                 <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 glass border border-white/5 rounded-2xl">
                                       <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Squad_Size</div>
                                       <div className="text-2xl font-black text-white italic">{userTeam.players_count || 4} OPS</div>
                                    </div>
                                    <div className="p-6 glass border border-white/5 rounded-2xl">
                                       <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Slot_ID</div>
                                       <div className="text-2xl font-black text-primary italic">#{userTeam.slot_number || "N/A"}</div>
                                    </div>
                                 </div>

                                 <Button asChild variant="outline" className="w-full h-14 rounded-xl border-white/10 hover:bg-white/5 text-xs font-black uppercase tracking-widest">
                                    <Link href="/teams">
                                       <ExternalLink className="w-4 h-4 mr-2" />
                                       View Full Roster
                                    </Link>
                                 </Button>
                              </div>
                           ) : (
                              <div className="py-12 text-center space-y-8">
                                 <p className="text-muted-foreground font-light italic">No registered unit detected for this operator.</p>
                                 <Button asChild variant="premium" className="h-14 px-8 rounded-xl uppercase tracking-widest text-xs">
                                    <Link href="/profile/register-team">Enlist New Unit</Link>
                                 </Button>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  )
}
