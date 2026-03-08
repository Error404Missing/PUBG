"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { 
  User, Mail, Shield, Edit3, Camera, 
  Award, Zap, Hash, MessageSquare, 
  ChevronRight, Save, LogOut, ExternalLink, X,
  AlertTriangle, CheckCircle2, Trash2
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
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  
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
    const { data: profileData, error: profileError } = await supabase
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
    } else if (profileError) {
       console.error("Profile Fetch Error:", profileError)
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
    setMessage(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from("profiles")
      .update({
        username: editData.username,
        discord_username: editData.discord_username,
        bio: editData.bio,
        avatar_url: editData.avatar_url,
        banner_url: editData.banner_url
      })
      .eq("id", user.id)

    if (error) {
      console.error("Update Error:", error)
      setMessage({ type: 'error', text: "შეცდომა განახლებისას: " + error.message })
    } else {
      setMessage({ type: 'success', text: "მონაცემები წარმატებით განახლდა" })
      await fetchUserData()
      setIsEditing(false)
      // Auto-hide message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleDeleteTeam = async () => {
    if (!confirm("დარწმუნებული ხართ რომ გსურთ გუნდის წაშლა? ეს ქმედება შეუქცევადია.")) return
    
    setLoading(true)
    const { error } = await supabase
      .from("teams")
      .delete()
      .eq("id", userTeam.id)

    if (error) {
       setMessage({ type: 'error', text: "შეცდომა წაშლისას: " + error.message })
       setLoading(false)
    } else {
       setMessage({ type: 'success', text: "გუნდი წარმატებით წაიშალა" })
       setUserTeam(null)
       setLoading(false)
       setTimeout(() => setMessage(null), 3000)
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
              <p className="text-muted-foreground animate-pulse font-black text-[10px] tracking-widest uppercase italic">მონაცემების კოდიფიკაცია...</p>
           </div>
        </div>
     )
  }

  return (
    <div className="min-h-screen pb-20 bg-background relative selection:bg-primary/30">
      {/* Messages */}
      {message && (
         <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[110] px-6 py-4 rounded-2xl border backdrop-blur-xl animate-reveal flex items-center gap-3 ${
            message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
         }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <span className="text-sm font-bold italic tracking-tight">{message.text}</span>
         </div>
      )}

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
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] glass border-4 border-background overflow-hidden relative z-10 transition-transform hover:scale-105 duration-500">
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
                     <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">{profile?.username || 'ოპერატორი'}</h1>
                     {vipStatus && (
                        <div className="flex items-center gap-1.5 bg-secondary/20 px-3 py-1 rounded-full text-secondary text-[10px] font-black tracking-widest border border-secondary/30">
                           <Zap className="w-3 h-3" />
                           VIP_ELITE
                        </div>
                     )}
                  </div>
                  <p className="text-muted-foreground text-xs font-bold tracking-[0.3em] uppercase flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                     {profile?.role === 'admin' ? 'კომენდანტი' : profile?.role === 'manager' ? 'სექტორის მენეჯერი' : 'ოპერატორი'} // აქტიური სტატუსი
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
                     {isEditing ? "გაუქმება" : "მონაცემები"}
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
                        <div className="text-[10px] font-black text-primary uppercase tracking-widest italic">Permission_Level</div>
                        <Shield className="w-4 h-4 text-primary" />
                     </div>
                     
                     <div className="space-y-4">
                        <div className="p-4 rounded-2xl glass border border-white/5 flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                 <Award className="w-4 h-4 text-primary" />
                              </div>
                              <span className="text-sm font-bold text-white uppercase tracking-wider">{String(profile?.role || 'USER').toUpperCase()}</span>
                           </div>
                           <Badge variant="outline" className="text-[8px] border-white/10 opacity-50 italic">Verified</Badge>
                        </div>

                        {profile?.is_admin && (
                           <Link href="/admin" className="p-4 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-between group hover:bg-secondary/20 transition-all">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                                    <Shield className="w-4 h-4 text-secondary" />
                                 </div>
                                 <span className="text-sm font-bold text-secondary uppercase tracking-wider">მართვის პანელი</span>
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
                     <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-6 italic">პერსონალური_ლოგი</h3>
                     
                     <div className="space-y-6">
                        <div className="flex items-center gap-4 group">
                           <div className="w-10 h-10 rounded-xl glass border border-white/5 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                              <Hash className="w-4 h-4" />
                           </div>
                           <div>
                              <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic">Discord_ჰენდლი</div>
                              <div className="text-xs font-bold text-white tracking-wider italic">{profile?.discord_username || "დაუკავშირებელი"}</div>
                           </div>
                        </div>

                        <div className="flex items-center gap-4 group">
                           <div className="w-10 h-10 rounded-xl glass border border-white/5 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                              <Mail className="w-4 h-4" />
                           </div>
                           <div>
                              <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic">კავშირის_არხი</div>
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
                        <div className="flex items-center justify-between">
                           <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">მონაცემების რედაქტირება</h2>
                           <Badge variant="outline" className="border-primary/20 text-primary">Edit_Mode</Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-8">
                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic">მომხმარებლის სახელი</label>
                              <Input 
                                value={editData.username}
                                onChange={(e) => setEditData({...editData, username: e.target.value})}
                                placeholder="შეიყვანეთ სახელი"
                                className="h-14 bg-black/40 border-white/10 rounded-2xl focus:border-primary/50 transition-all font-bold" 
                              />
                           </div>
                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic">Discord ID</label>
                              <Input 
                                value={editData.discord_username}
                                onChange={(e) => setEditData({...editData, discord_username: e.target.value})}
                                placeholder="Username#0000"
                                className="h-14 bg-black/40 border-white/10 rounded-2xl focus:border-primary/50 transition-all font-bold" 
                              />
                           </div>
                        </div>

                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic">ავატარის ლინკი (URL)</label>
                           <Input 
                             value={editData.avatar_url}
                             onChange={(e) => setEditData({...editData, avatar_url: e.target.value})}
                             placeholder="https://example.com/image.jpg"
                             className="h-14 bg-black/40 border-white/10 rounded-2xl focus:border-primary/50 transition-all font-bold" 
                           />
                        </div>

                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic">ბანერის ლინკი (URL)</label>
                           <Input 
                             value={editData.banner_url}
                             onChange={(e) => setEditData({...editData, banner_url: e.target.value})}
                             placeholder="https://example.com/banner.jpg"
                             className="h-14 bg-black/40 border-white/10 rounded-2xl focus:border-primary/50 transition-all font-bold" 
                           />
                        </div>

                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic">ბიოგრაფია / სტატუსი</label>
                           <textarea 
                             value={editData.bio}
                             onChange={(e) => setEditData({...editData, bio: e.target.value})}
                             placeholder="დაწერეთ თქვენი სტატუსი..."
                             className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:border-primary/50 outline-none transition-all font-medium italic"
                           />
                        </div>

                        <Button onClick={handleUpdate} variant="premium" className="h-16 w-full rounded-2xl text-md font-black uppercase tracking-widest transition-transform active:scale-[0.98]">
                           <Save className="w-5 h-5 mr-3" />
                           ცვლილებების შენახვა
                        </Button>
                     </div>
                  </div>
               ) : (
                  <div className="space-y-8 animate-reveal" style={{animationDelay: '0.1s'}}>
                     {/* Bio Section */}
                     <div className="glass-card p-1">
                        <div className="p-8 lg:p-12">
                           <div className="flex items-center justify-between mb-8">
                              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter italic">ტაქტიკური_ბიო</h2>
                              <div className="w-12 h-1 bg-primary/20 rounded-full" />
                           </div>
                           <p className="text-muted-foreground font-light leading-relaxed whitespace-pre-wrap italic text-lg leading-relaxed">
                              {profile?.bio || "ამ ოპერატორის შესახებ ტაქტიკური მონაცემები არ არის მოწოდებული. მონაცემთა ბაზა ცარიელია."}
                           </p>
                        </div>
                     </div>

                     {/* Unit Status Card */}
                     <div className="glass-card p-1">
                        <div className="p-8 lg:p-12 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-8">
                              <Zap className="w-20 h-20 text-white/5 group-hover:text-primary/10 transition-colors duration-500" />
                           </div>
                           
                           <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-10 italic">გუნდის_სტატუსი</h2>

                           {userTeam ? (
                              <div className="space-y-10">
                                 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                    <div>
                                       <div className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2 italic">დეზიგნაცია</div>
                                       <h3 className="text-5xl lg:text-6xl font-black text-white italic tracking-tighter leading-none">{userTeam.team_name}</h3>
                                       <div className="text-xl font-black text-white/20 italic tracking-widest mt-4">[{userTeam.team_tag}]</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                       <Badge className={`px-4 py-1.5 uppercase italic font-black text-[10px] tracking-widest ${
                                          userTeam.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 'bg-secondary/20 text-secondary border-secondary/20'
                                       }`}>
                                          {userTeam.status === 'approved' ? 'ავტორიზებული' : userTeam.status === 'pending' ? 'განხილვაში' : 'უარყოფილი'}
                                       </Badge>
                                       {userTeam.is_vip && <Badge variant="gold" className="px-4 py-1.5 font-black text-[10px] tracking-widest">ELITE_UNIT</Badge>}
                                    </div>
                                 </div>

                                 <div className="grid grid-cols-2 gap-6">
                                    <div className="p-6 glass border border-white/5 rounded-3xl transition-colors hover:border-white/10">
                                       <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 italic">სამხედრო_შემადგენლობა</div>
                                       <div className="text-3xl font-black text-white italic">{userTeam.players_count || 4} OPS</div>
                                    </div>
                                    <div className="p-6 glass border border-white/5 rounded-3xl transition-colors hover:border-white/10">
                                       <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 italic">სლოტ_იდენტიფიკატორი</div>
                                       <div className="text-3xl font-black text-primary italic">#{userTeam.slot_number || "N/A"}</div>
                                    </div>
                                 </div>

                                 <div className="flex gap-4">
                                    <Button asChild variant="outline" className="flex-1 h-14 rounded-2xl border-white/10 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest group">
                                       <Link href="/teams">
                                          <ExternalLink className="w-4 h-4 mr-3 transition-transform group-hover:scale-110" />
                                          ნახვა
                                       </Link>
                                    </Button>
                                    <Button 
                                      onClick={handleDeleteTeam}
                                      variant="outline" 
                                      className="h-14 w-14 rounded-2xl border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-colors"
                                    >
                                       <Trash2 className="w-5 h-5" />
                                    </Button>
                                 </div>
                              </div>
                           ) : (
                              <div className="py-12 text-center space-y-8 glass border border-white/5 rounded-[3rem]">
                                 <p className="text-muted-foreground font-light italic">ამ ოპერატორისთვის რეგისტრირებული გუნდი არ მოიძებნა.</p>
                                 <Button asChild variant="premium" className="h-16 px-10 rounded-2xl uppercase tracking-widest text-[10px] font-black italic transition-transform hover:scale-105 active:scale-95">
                                    <Link href="/profile/register-team">ახალი გუნდის რეგისტრაცია</Link>
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
