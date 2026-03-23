"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { 
  Shield, 
  Award, 
  Zap, 
  Target, 
  MessageSquare, 
  Instagram, 
  Music2, 
  Star, 
  Clock,
  Calendar,
  Users,
  ChevronLeft
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { ka } from "date-fns/locale"

export default function UserPublicProfile() {
  const { id } = useParams()
  const supabase = createBrowserClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [userTeam, setUserTeam] = useState<any>(null)

  useEffect(() => {
    if (id) fetchUserData()
  }, [id])

  const fetchUserData = async () => {
    setLoading(true)
    
    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single()

    if (profileData) {
      setProfile(profileData)
      
      // Fetch team
      const { data: teamData } = await supabase
        .from("teams")
        .select("*")
        .eq("leader_id", id)
        .eq("status", "approved")
        .maybeSingle()
      
      setUserTeam(teamData)
    }
    
    setLoading(false)
  }

  if (loading) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-background">
           <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
     )
  }

  if (!profile) {
     return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8">
           <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">User_Not_Found</h1>
           <p className="text-muted-foreground text-center mb-8">მომხმარებლის პროფილი ვერ მოიძებნა</p>
           <Button onClick={() => router.push("/")} variant="outline" className="h-14 px-8 rounded-2xl">უკან დაბრუნება</Button>
        </div>
     )
  }

  return (
    <div className="min-h-screen bg-background pb-32 selection:bg-primary/30">
      {/* Banner Area */}
      <div className="relative h-80 md:h-[450px] w-full overflow-hidden">
         <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ backgroundImage: `url(${profile.banner_url || 'https://i.ibb.co/vYm0C2M/default-banner-dark.jpg'})` }} 
         />
         <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
         
         <div className="absolute top-10 left-10 z-20">
            <Button onClick={() => router.back()} variant="outline" className="h-12 px-6 rounded-2xl glass border-white/10 text-white italic uppercase tracking-widest text-[10px] font-black group">
               <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> უკან
            </Button>
         </div>
      </div>

      <div className="container mx-auto max-w-6xl -mt-24 md:-mt-32 relative z-10 px-8">
         <div className="flex flex-col md:flex-row items-end gap-8 mb-16">
            <div className="relative group">
               <div className={`w-40 h-40 md:w-56 md:h-56 rounded-[3rem] glass border-4 px-1 py-1 overflow-hidden transition-all duration-700 hover:scale-105 ${profile.is_owner ? 'border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.2)]' : 'border-background shadow-2xl'}`}>
                  <img src={profile.avatar_url || 'https://i.ibb.co/vzD7Z0M/default-avatar-dark.png'} className="w-full h-full object-cover rounded-[2.5rem]" alt={profile.username} />
               </div>
            </div>

            <div className="flex-1 text-center md:text-left">
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                  <h1 className={`text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none ${profile.is_owner ? 'text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.4)] animate-pulse-soft' : 'text-white'}`}>
                     {profile.username}
                  </h1>
                  {profile.is_owner && (
                     <Badge className="bg-red-600 text-white border-0 px-4 py-2 font-black italic tracking-widest text-[11px] animate-glow">
                        FOUNDER_ELITE
                     </Badge>
                  )}
               </div>

               <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                  <p className={`text-[11px] font-black tracking-[0.4em] uppercase flex items-center gap-2 italic ${profile.is_owner ? 'text-red-500' : 'text-primary/60'}`}>
                     <Shield className={`w-4 h-4 ${profile.is_owner ? 'text-red-500' : 'text-primary'}`} />
                     {profile.is_owner ? (profile.owner_title || 'საიტის მფლობელი და დამფუძნებელი') : (profile.role === 'admin' ? 'Kommander' : profile.role === 'manager' ? 'Sector Manager' : 'Operator')}
                  </p>
                  
                  <div className="flex gap-4">
                     {profile.instagram_url && (
                        <a href={profile.instagram_url} target="_blank" className="text-muted-foreground hover:text-pink-500 transition-colors">
                           <Instagram className="w-5 h-5" />
                        </a>
                     )}
                     {profile.tiktok_url && (
                        <a href={profile.tiktok_url} target="_blank" className="text-muted-foreground hover:text-white transition-colors">
                           <Music2 className="w-5 h-5" />
                        </a>
                     )}
                  </div>
               </div>
            </div>
         </div>

         <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
               {/* Bio Section */}
               <div className="glass-card p-10 md:p-14 border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                     <Target className="w-48 h-48 rotate-12" />
                  </div>
                  <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-10 italic">Tactical_Intelligence</h2>
                  <p className="text-xl text-white font-light italic leading-relaxed max-w-2xl">
                     {profile.bio || "ეს მომხმარებელი ჯერ-ჯერობით საიდუმლო ინახავს საკუთარ ბიოგრაფიას."}
                  </p>
               </div>

               {/* Stats / Team Details */}
               {userTeam && (
                  <div className="glass-card p-10 md:p-14 border-white/5 bg-gradient-to-br from-primary/5 to-transparent">
                     <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-10 italic">active_unit_details</h2>
                     
                     <div className="flex flex-col md:flex-row gap-12 items-center">
                        <div className="w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] glass border border-white/10 flex items-center justify-center p-3">
                           <div className="w-full h-full rounded-[2rem] bg-background border border-white/5 flex items-center justify-center">
                              <Users className="w-12 h-12 text-primary" />
                           </div>
                        </div>
                        
                        <div className="text-center md:text-left space-y-4">
                           <div>
                              <div className="text-[10px] font-black text-white/30 uppercase tracking-widest italic mb-2">Team_Callsign</div>
                              <h3 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter leading-none">{userTeam.team_name}</h3>
                           </div>
                           <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-4 py-2 text-md font-black tracking-widest italic">
                              UNIT_STATUS: {userTeam.status.toUpperCase()}
                           </Badge>
                        </div>
                     </div>
                  </div>
               )}
            </div>

            <div className="space-y-8">
               {/* Profile Info Card */}
               <div className="glass-card p-10 border-white/5 space-y-8 italic">
                  <div className="flex items-center justify-between pb-6 border-b border-white/5">
                     <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Metadata</span>
                     <Clock className="w-4 h-4 text-primary/40" />
                  </div>
                  
                  <div className="space-y-6">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl glass border border-white/10 flex items-center justify-center">
                           <Calendar className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                           <div className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">Enlisted_On</div>
                           <div className="text-sm font-bold text-white uppercase tracking-tight">{format(new Date(profile.created_at), "MMM d, yyyy")}</div>
                        </div>
                     </div>

                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl glass border border-white/10 flex items-center justify-center">
                           <Star className="w-4 h-4 text-yellow-500" />
                        </div>
                        <div>
                           <div className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">Rank_Protocol</div>
                           <div className="text-sm font-bold text-white uppercase tracking-tight">{String(profile.role).toUpperCase()}</div>
                        </div>
                     </div>

                     {profile.discord_username && (
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl glass border border-white/10 flex items-center justify-center">
                              <MessageSquare className="w-4 h-4 text-blue-400" />
                           </div>
                           <div>
                              <div className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">Communications</div>
                              <div className="text-sm font-bold text-white uppercase tracking-tight">{profile.discord_username}</div>
                           </div>
                        </div>
                     )}
                  </div>
               </div>

               {/* Achievement Card */}
               <div className="glass-card p-10 border-white/5 space-y-6 text-center">
                  <div className="w-20 h-20 rounded-2xl glass border border-primary/20 mx-auto flex items-center justify-center animate-glow">
                     <Award className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="font-black text-white italic uppercase tracking-tighter text-xl">Elite_Status_Archive</h3>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-light leading-relaxed">
                     ეს მომხმარებელი არის Arena-ს დადასტურებული წევრი.
                  </p>
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}
