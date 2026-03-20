"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import {
   User, Mail, Shield, Edit3, Camera,
   Award, Zap, Hash, MessageSquare,
   ChevronRight, Save, LogOut, ExternalLink, X,
   AlertTriangle, CheckCircle2, Trash2, Instagram, Music2, Wallet,
   Check, Ban, Crown, Loader2, Calendar, Info, MapPin, Users
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CustomConfirm } from "@/components/ui/custom-confirm"
import { LuxuryToast, ToastType } from "@/components/ui/luxury-toast"
import { format, formatDistanceToNow } from "date-fns"
import { ka } from "date-fns/locale"

export default function ProfilePage() {
   const supabase = createBrowserClient()
   const router = useRouter()
   const [loading, setLoading] = useState(true)
   const [profile, setProfile] = useState<any>(null)
   const [userTeam, setUserTeam] = useState<any>(null)
   const [allRegistrations, setAllRegistrations] = useState<any[]>([])
   const [vipStatus, setVipStatus] = useState<any>(null)
   const [isEditing, setIsEditing] = useState(false)
   const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
   const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
   const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null)

   // Edit States
   const [editData, setEditData] = useState({
      username: "",
      discord_username: "",
      instagram_url: "",
      tiktok_url: "",
      bio: "",
      avatar_url: "",
      banner_url: ""
   })
   const [isUploading, setIsUploading] = useState<{ type: 'avatar' | 'banner' | null }>({ type: null })

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
         .maybeSingle()

      if (profileData) {
         setProfile(profileData)
         setEditData({
            username: profileData.username || "",
            discord_username: profileData.discord_username || "",
            instagram_url: profileData.instagram_url || "",
            tiktok_url: profileData.tiktok_url || "",
            bio: profileData.bio || "",
            avatar_url: profileData.avatar_url || "",
            banner_url: profileData.banner_url || ""
         })
      }

      // Fetch All Teams and Registrations
      const { data: teamsData } = await supabase
         .from("teams")
         .select("*, scrim_requests(*, schedules(*))")
         .eq("leader_id", user.id)
         .order("created_at", { ascending: false })

      if (teamsData && teamsData.length > 0) {
         setUserTeam(teamsData[0])
         
         // Flatten registrations for easy listing
         const regs: any[] = []
         teamsData.forEach(t => {
            if (t.scrim_requests) {
               t.scrim_requests.forEach((r: any) => {
                  regs.push({
                     id: r.id,
                     status: r.status,
                     schedule_title: r.schedules?.title,
                     schedule_date: r.schedules?.date,
                     team_name: t.team_name
                   })
                })
             }
          })
          setAllRegistrations(regs)
       }

      // Fetch VIP
      const { data: vipData } = await supabase
         .from("user_vip_status")
         .select("vip_until")
         .eq("user_id", user.id)
         .maybeSingle()

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
            instagram_url: editData.instagram_url,
            tiktok_url: editData.tiktok_url,
            bio: editData.bio,
            avatar_url: editData.avatar_url,
            banner_url: editData.banner_url
         })
         .eq("id", user.id)

      if (error) {
         console.error("Update Error:", error)
         setToast({ message: "შეცდომა განახლებისას: " + error.message, type: 'error' })
      } else {
         setToast({ message: "მონაცემები წარმატებით განახლდა", type: 'success' })
         await fetchUserData()
         setIsEditing(false)
      }
   }

   const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
      const file = e.target.files?.[0]
      if (!file) return

      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      // Check for GIF and VIP/Admin status
      const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif')
      const isUserAdmin = profile?.is_admin || profile?.role === 'admin'
      const isUserVip = vipStatus && new Date(vipStatus.vip_until) > new Date()

      if (isGif && !isUserAdmin && !isUserVip) {
         setToast({ 
            message: "მოძრავი (GIF) ფოტოების ატვირთვა შესაძლებელია მხოლოდ VIP ან ადმინისტრატორებისთვის", 
            type: 'error' 
         })
         return
      }

      setIsUploading({ type })

      const fileExt = file.name.split('.').pop()
      const fileName = `${authUser.id}-${Math.random()}.${fileExt}`
      const filePath = `${type}s/${fileName}`

      const { error: uploadError } = await supabase.storage
         .from('profiles')
         .upload(filePath, file, { upsert: true })

      if (uploadError) {
         console.error(`Upload ${type} error:`, uploadError)
         setToast({ message: `${type === 'avatar' ? 'ფოტოს' : 'ბანერის'} ატვირთვა ვერ მოხერხდა`, type: 'error' })
         setIsUploading({ type: null })
         return
      }

      const { data: { publicUrl } } = supabase.storage
         .from('profiles')
         .getPublicUrl(filePath)

      setEditData(prev => ({ ...prev, [type === 'avatar' ? 'avatar_url' : 'banner_url']: publicUrl }))
      setIsUploading({ type: null })
      setToast({ message: `${type === 'avatar' ? 'ფოტო' : 'ბანერი'} დროებით აიტვირთა, შესანახად დააჭირეთ 'შენახვას'`, type: 'success' })
   }

   const handleDeleteTeam = async () => {
      if (!userTeam) return
      setLoading(true)
      const { error } = await supabase
         .from("teams")
         .delete()
         .eq("id", userTeam.id)

      if (error) {
         console.error("Delete Error:", error)
         setToast({ message: "შეცდომა წაშლისას", type: 'error' })
         setLoading(false)
      } else {
         const { data: { user } } = await supabase.auth.getUser()
         if (user) {
            await supabase.from("profiles").update({ role: "guest" }).eq("id", user.id).eq("role", "manager")
         }
         setToast({ message: "გუნდი წარმატებით წაიშალა", type: 'success' })
         setUserTeam(null)
         setLoading(false)
         setIsDeleteConfirmOpen(false)
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
               <p className="font-black text-[10px] tracking-widest uppercase italic">მონაცემების კოდიფიკაცია...</p>
            </div>
         </div>
      )
   }

   return (
      <div className="min-h-screen pb-20 bg-background relative selection:bg-primary/30">
         <div className="relative h-64 md:h-80 w-full overflow-hidden">
            <div
               className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
               style={{
                  backgroundImage: `url(${profile?.banner_url || 'https://i.ibb.co/vYm0C2M/default-banner-dark.jpg'})`,
               }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

            {isEditing && (
               <div className="absolute top-8 right-8 z-20">
                  <label className="cursor-pointer">
                     <div className="bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 p-3 rounded-xl transition-all flex items-center gap-2 group">
                        <Camera className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white italic">ბანერის შეცვლა</span>
                     </div>
                     <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'banner')} />
                  </label>
               </div>
            )}

            <div className="absolute -bottom-1 left-0 w-full p-8 md:p-12">
               <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-end gap-6 md:gap-10">
                  <div className="relative group overflow-hidden">
                     <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] glass border-4 border-background overflow-hidden relative z-10 transition-transform hover:scale-105 duration-500">
                        <img
                           src={isEditing ? (editData.avatar_url || 'https://i.ibb.co/vzD7Z0M/default-avatar-dark.png') : (profile?.avatar_url || 'https://i.ibb.co/vzD7Z0M/default-avatar-dark.png')}
                           className={`w-full h-full object-cover ${isUploading.type === 'avatar' ? 'opacity-30 blur-sm' : ''}`}
                        />
                        {isEditing && (
                           <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20">
                              <Camera className="w-8 h-8 text-white" />
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'avatar')} />
                           </label>
                        )}
                     </div>
                  </div>

                  <div className="flex-1 pb-2">
                     <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">{profile?.username || 'ოპერატორი'}</h1>
                         {vipStatus && <Badge variant="gold" className="px-3 py-1">VIP_ELITE</Badge>}
                         <div className="bg-green-500/10 px-3 py-1 rounded-full text-green-400 text-[10px] font-black tracking-widest border border-green-500/20">
                            {profile?.balance || 0} GEL
                         </div>
                     </div>
                      <div className="flex flex-col gap-4">
                        <p className="text-muted-foreground text-[10px] font-black tracking-[0.3em] uppercase flex items-center gap-2 italic">
                           <Shield className="w-3 h-3 text-primary" />
                           {profile?.role === 'admin' ? 'Kommander' : profile?.role === 'manager' ? 'Sector Manager' : 'Operator'}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-3">
                           {profile?.instagram_url && (
                              <a href={profile.instagram_url} target="_blank" className="w-10 h-10 rounded-xl glass border border-white/5 flex items-center justify-center text-white/40 hover:text-primary hover:border-primary/50 transition-all group/social">
                                 <Instagram className="w-5 h-5 group-hover/social:scale-110 transition-transform" />
                              </a>
                           )}
                           {profile?.tiktok_url && (
                              <a href={profile.tiktok_url} target="_blank" className="w-10 h-10 rounded-xl glass border border-white/5 flex items-center justify-center text-white/40 hover:text-primary hover:border-primary/50 transition-all group/social">
                                 <Music2 className="w-5 h-5 group-hover/social:scale-110 transition-transform" />
                              </a>
                           )}
                           {profile?.discord_username && (
                              <div className="flex items-center gap-3 px-4 h-10 rounded-xl glass border border-white/5 text-[11px] font-black text-white/40 italic">
                                 <MessageSquare className="w-4 h-4" /> {profile.discord_username}
                              </div>
                           )}
                           {!profile?.instagram_url && !profile?.tiktok_url && !profile?.discord_username && (
                              <div 
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 h-10 rounded-xl glass border border-dashed border-white/10 text-[10px] font-black text-white/20 italic hover:border-primary/30 hover:text-primary/50 transition-all cursor-pointer"
                              >
                                 <ExternalLink className="w-3 h-3" /> Connect_Socials
                              </div>
                           )}
                        </div>
                      </div>
                  </div>

                  <div className="flex gap-3 pb-2">
                     <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "outline" : "premium"} className="h-12 px-6 rounded-2xl">
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
               <div className="space-y-8">
                  {/* Badges Section */}
                  <div className="glass-card p-8 space-y-8 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Award className="w-32 h-32" />
                     </div>
                     <div className="flex items-center justify-between pb-4 border-b border-white/5">
                        <div className="text-[10px] font-black text-primary uppercase tracking-widest italic">User_Achievements</div>
                        <Award className="w-4 h-4 text-primary" />
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4">
                        <div className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all ${vipStatus ? 'bg-secondary/10 border-secondary/30 shadow-lg shadow-secondary/5' : 'bg-white/5 border-white/5 opacity-50'}`}>
                           <Crown className={`w-8 h-8 ${vipStatus ? 'text-secondary animate-pulse' : 'text-white/20'}`} />
                           <span className={`text-[10px] font-black uppercase tracking-widest ${vipStatus ? 'text-secondary' : 'text-white/20'}`}>Elite_VIP</span>
                        </div>
                        <div className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all ${profile?.role === 'admin' ? 'bg-primary/10 border-primary/30 shadow-lg shadow-primary/5' : 'bg-white/5 border-white/5 opacity-50'}`}>
                           <Shield className={`w-8 h-8 ${profile?.role === 'admin' ? 'text-primary' : 'text-white/20'}`} />
                           <span className={`text-[10px] font-black uppercase tracking-widest ${profile?.role === 'admin' ? 'text-primary' : 'text-white/20'}`}>Commander</span>
                        </div>
                        <div className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all ${profile?.balance > 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/5 opacity-50'}`}>
                           <Wallet className={`w-8 h-8 ${profile?.balance > 0 ? 'text-emerald-500' : 'text-white/20'}`} />
                           <span className={`text-[10px] font-black uppercase tracking-widest ${profile?.balance > 0 ? 'text-emerald-400' : 'text-white/20'}`}>Investor</span>
                        </div>
                        <div className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all ${userTeam ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/5 border-white/5 opacity-50'}`}>
                           <Users className={`w-8 h-8 ${userTeam ? 'text-blue-500' : 'text-white/20'}`} />
                           <span className={`text-[10px] font-black uppercase tracking-widest ${userTeam ? 'text-blue-400' : 'text-white/20'}`}>Team_Leader</span>
                        </div>
                     </div>
                  </div>

                  <div className="glass-card p-8 space-y-6">
                     <div className="flex items-center justify-between pb-4 border-b border-white/5">
                        <div className="text-[10px] font-black text-primary uppercase tracking-widest italic">Operational_Status</div>
                        <Zap className="w-4 h-4 text-primary" />
                     </div>
                     <div className="p-4 rounded-2xl glass border border-white/5 flex items-center justify-between">
                        <span className="text-sm font-bold text-white uppercase tracking-wider">{String(profile?.role || 'USER').toUpperCase()}</span>
                        <Badge variant="outline" className="text-[8px] opacity-50 italic">Verified_Core</Badge>
                     </div>
                     {profile?.role === 'admin' && (
                        <Link href="/admin" className="p-4 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-between group hover:bg-secondary/20 transition-all">
                           <span className="text-sm font-bold text-secondary uppercase tracking-wider">მართვის პანელი</span>
                           <ChevronRight className="w-4 h-4 text-secondary group-hover:translate-x-1 transition-transform" />
                        </Link>
                     )}
                  </div>
               </div>

               <div className="lg:col-span-2 space-y-8">
                  {isEditing ? (
                     <div className="glass-card p-8 lg:p-12 space-y-8 animate-reveal">
                        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">მონაცემების რედაქტირება</h2>
                        <div className="grid md:grid-cols-2 gap-8">
                           <Input value={editData.username} onChange={(e) => setEditData({ ...editData, username: e.target.value })} placeholder="Username" />
                           <Input value={editData.discord_username} onChange={(e) => setEditData({ ...editData, discord_username: e.target.value })} placeholder="Discord" />
                           <Input value={editData.instagram_url} onChange={(e) => setEditData({ ...editData, instagram_url: e.target.value })} placeholder="Instagram URL" />
                           <Input value={editData.tiktok_url} onChange={(e) => setEditData({ ...editData, tiktok_url: e.target.value })} placeholder="TikTok URL" />
                        </div>
                        <textarea 
                           className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-primary transition-all outline-none"
                           value={editData.bio} 
                           onChange={(e) => setEditData({ ...editData, bio: e.target.value })} 
                           placeholder="Bio / მოკლე ინფორმაცია" 
                        />
                        <Button onClick={handleUpdate} variant="premium" className="h-16 w-full rounded-2xl font-black uppercase tracking-widest">
                           <Save className="w-5 h-5 mr-3" /> შენახვა
                        </Button>
                     </div>
                  ) : (
                     <div className="space-y-8">
                        <div className="glass-card p-8 lg:p-12 relative overflow-hidden group">
                           <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-10 italic">გუნდის_სტატუსი</h2>
                           {userTeam ? (
                              <div className="space-y-10">
                                 <div>
                                    <h3 className="text-5xl lg:text-6xl font-black text-white italic tracking-tighter leading-none">{userTeam.team_name}</h3>
                                    <div className="text-xl font-black text-white/20 italic tracking-widest mt-4">[{userTeam.team_tag}]</div>
                                 </div>

                                 <div className="space-y-4 pt-4 border-t border-white/5">
                                    <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-4 italic">მატჩების_ისტორია</div>
                                    {allRegistrations.length > 0 ? (
                                       <div className="grid gap-3">
                                          {allRegistrations.map((reg, idx) => (
                                             <div key={idx} className="flex items-center justify-between p-4 rounded-2xl glass border border-white/5">
                                                <div className="flex items-center gap-4">
                                                   <Calendar className={`w-5 h-5 ${reg.status === 'approved' ? 'text-emerald-400' : reg.status === 'rejected' ? 'text-rose-400' : 'text-amber-500'}`} />
                                                   <div>
                                                      <div className="text-xs font-black text-white italic">{reg.schedule_title}</div>
                                                      <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
                                                         {reg.schedule_date ? format(new Date(reg.schedule_date), "HH:mm") : "N/A"} - {reg.team_name}
                                                      </div>
                                                   </div>
                                                </div>
                                                <Badge className={`uppercase italic font-black text-[8px] tracking-widest ${
                                                   reg.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' :
                                                   reg.status === 'rejected' ? 'bg-rose-500/20 text-rose-400 border-rose-500/20' :
                                                   'bg-amber-500/20 text-amber-500 border-amber-500/20'
                                                }`}>
                                                   {reg.status === 'approved' ? 'Active' : reg.status === 'rejected' ? 'Rejected' : 'Review'}
                                                </Badge>
                                             </div>
                                          ))}
                                       </div>
                                    ) : (
                                       <div className="text-center py-6 opacity-30 text-[9px] font-black uppercase tracking-widest">ჩანაწერები არ მოიძებნა</div>
                                    )}
                                 </div>

                                 <div className="flex gap-4">
                                    <Button asChild variant="outline" className="flex-1 h-14 rounded-2xl border-white/10 hover:bg-white/5">
                                       <Link href="/teams">ნახვა</Link>
                                    </Button>
                                    <Button onClick={() => setIsDeleteConfirmOpen(true)} variant="outline" className="h-14 w-14 rounded-2xl border-rose-500/20 text-rose-500">
                                       <Trash2 className="w-5 h-5" />
                                    </Button>
                                 </div>
                              </div>
                           ) : (
                              <div className="py-12 text-center space-y-8 glass border border-white/5 rounded-[3rem]">
                                 <p className="text-muted-foreground font-light italic px-8">თამაშის დასაწყებად აირჩიეთ სასურველი მატჩი განრიგში.</p>
                                 <Button asChild variant="premium" className="h-16 px-10 rounded-2xl">
                                    <Link href="/schedule">განრიგის ნახვა</Link>
                                 </Button>
                              </div>
                           )}
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </div>

         <CustomConfirm
            isOpen={isDeleteConfirmOpen}
            onClose={() => setIsDeleteConfirmOpen(false)}
            onConfirm={handleDeleteTeam}
            title="გუნდის წაშლა"
            description="დარწმუნებული ხართ რომ გსურთ გუნდის წაშლა?"
            confirmText="გუნდის წაშლა"
            variant="danger"
         />

         {toast && <LuxuryToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
   )
}
