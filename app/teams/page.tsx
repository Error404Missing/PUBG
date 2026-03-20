"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Users, Crown, Shield, Gamepad2, Calendar, ChevronRight, Target, Zap, ShieldCheck, ExternalLink, Activity } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { ka } from "date-fns/locale"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Link from "next/link"

interface Schedule {
  id: string
  title: string
  date: string
  is_active: boolean
}

interface Team {
  id: string
  team_name: string
  team_tag: string
  leader_id: string
  status: string
  is_vip: boolean
  slot_number: number | null
  players_count: number
  maps_count: number
  created_at: string
  logo_url?: string | null
  profiles: { 
    id: string
    username: string 
    avatar_url?: string
  } | null
}

export default function TeamsPage() {
  const supabase = createBrowserClient()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [verifiedTeams, setVerifiedTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [teamsLoading, setTeamsLoading] = useState(false)

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    setLoading(true)
    const [schedulesRes, userRes] = await Promise.all([
      supabase
        .from("schedules")
        .select("*")
        .eq("is_active", true)
        .order("date", { ascending: true }),
      supabase.auth.getUser()
    ])

    setSchedules(schedulesRes.data || [])
    setLoading(false)
  }

  const selectSchedule = async (schedule: Schedule) => {
    setSelectedSchedule(schedule)
    setTeamsLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    // Fetch approved teams via scrim_requests for this schedule
    const { data: requestsData } = await supabase
      .from("scrim_requests")
      .select(`
        slot_number,
        teams!inner (
          id,
          team_name,
          team_tag,
          leader_id,
          status,
          is_vip,
          logo_url,
          created_at,
          profiles:leader_id (
            id,
            username,
            avatar_url
          )
        )
      `)
      .eq("schedule_id", schedule.id)
      .eq("status", "approved")

    const teamsData = requestsData?.map((r: any) => ({
      ...r.teams,
      slot_number: r.slot_number || r.teams.slot_number
    })) || []

    setTeams(teamsData)
    setTeamsLoading(false)
    setVerifiedTeams(teamsData)
  }

  const TeamCard = ({ team, i }: { team: Team, i: number }) => (
    <Dialog key={team.id}>
      <DialogTrigger asChild>
        <div
          className={`glass-card p-8 group animate-reveal cursor-pointer transition-all duration-500 hover:scale-[1.03] active:scale-[0.98] relative overflow-hidden ${
            team.is_vip 
              ? "border-secondary/50 ring-2 ring-secondary/20 shadow-[0_0_50px_-10px_rgba(255,180,0,0.25)] bg-gradient-to-br from-secondary/[0.07] to-transparent" 
              : "border-white/5"
          }`}
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          {/* VIP Animated Accent */}
          {team.is_vip && (
            <>
              {/* Premium Golden Glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/20 blur-[80px] -z-10 group-hover:bg-secondary/30 transition-colors" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 blur-[60px] -z-10" />
              
              {/* Rotating Border Gradient (Simulation) */}
              <div className="absolute inset-0 border border-secondary/30 rounded-[2.5rem] pointer-events-none" />
              <div className="absolute inset-[1px] border border-secondary/10 rounded-[2.5rem] pointer-events-none" />
              
              {/* Corner VIP Badge */}
              <div className="absolute top-0 right-0 overflow-hidden w-24 h-24 pointer-events-none">
                 <div className="absolute top-3 right-[-35px] bg-gradient-to-r from-amber-600 via-secondary to-amber-600 text-black text-[8px] font-black uppercase tracking-[0.2em] py-1 w-[120px] text-center rotate-45 shadow-xl border-y border-white/20">
                    VIP UNIT
                 </div>
              </div>

              {/* Texture Overlay */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-transparent pointer-events-none" />
            </>
          )}

          <div className="flex items-start justify-between mb-8 relative z-10">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Team Logo or Default Icon */}
              {team.logo_url ? (
                <div className={`w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-transform group-hover:scale-110 duration-500 relative ${
                  team.is_vip 
                    ? 'border-secondary shadow-[0_0_30px_-5px_secondary] ring-4 ring-secondary/10' 
                    : 'border-white/10 shadow-xl'
                }`}>
                  <img src={team.logo_url} alt={team.team_name} className="w-full h-full object-cover" />
                  {team.is_vip && <div className="absolute inset-0 bg-gradient-to-tr from-secondary/20 via-transparent to-transparent" />}
                </div>
              ) : (
                <div className={`w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center border-2 transition-transform group-hover:scale-110 duration-500 ${
                  team.is_vip 
                    ? 'bg-gradient-to-br from-amber-500/30 to-secondary/10 border-secondary shadow-[0_0_30px_-5px_secondary]' 
                    : 'bg-primary/10 border-primary/10'
                }`}>
                  {team.is_vip
                    ? <Crown className="w-8 h-8 text-secondary filter drop-shadow-[0_0_8px_secondary]" />
                    : <Shield className="w-8 h-8 text-primary/60" />
                  }
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  {team.is_vip && <Crown className="w-4 h-4 text-secondary animate-pulse-soft flex-shrink-0" />}
                  <h3 className={`text-xl font-black italic tracking-tight group-hover:text-primary transition-colors truncate ${
                    team.is_vip ? 'text-secondary' : 'text-white'
                  }`}>
                    {team.team_name}
                  </h3>
                </div>
                <Badge variant="outline" className={`tracking-[0.2em] font-mono text-[10px] py-1 ${
                  team.is_vip ? 'border-secondary/30 text-secondary bg-secondary/5' : 'border-white/10'
                }`}>
                  {team.team_tag}
                </Badge>
                {team.status !== 'approved' && (
                  <div className="mt-2 text-[8px] font-black text-yellow-400 uppercase tracking-widest italic flex items-center gap-1">
                    <Activity className="w-2.5 h-2.5" /> {team.status === 'pending' ? 'Reviewing' : team.status}
                  </div>
                )}
              </div>
            </div>
            {team.slot_number && (
              <div className="text-right flex-shrink-0 ml-2">
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 leading-none">Slot</div>
                <div className="text-2xl font-black text-primary italic leading-none">#{team.slot_number}</div>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl glass border border-white/5">
              <div className="flex items-center gap-3">
                <Shield className={`w-5 h-5 ${team.is_vip ? "text-secondary" : "text-primary/70"}`} />
                <div>
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Leader</div>
                  <div className="text-sm font-bold text-white uppercase italic">{team.profiles?.username || "უცნობი"}</div>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden">
                <img src={team.profiles?.avatar_url || "https://i.ibb.co/vzD7Z0M/default-avatar-dark.png"} alt="" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="flex items-center gap-6 px-2">
               <div className="flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-bold text-muted-foreground uppercase italic tracking-wider">{team.players_count || 4} Players</span>
               </div>
               <div className="flex items-center gap-2 ml-auto">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] italic">Tactical_Verified</span>
               </div>
            </div>
          </div>

          <div className="absolute -bottom-6 -right-6 text-7xl font-black text-white/5 italic -z-10 group-hover:text-primary/10 transition-colors pointer-events-none">
            {i + 1}
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="glass-darker border border-white/10 p-1 rounded-[2.5rem] shadow-2xl overflow-hidden max-w-lg">
        <div className="p-8 space-y-8">
           <DialogHeader>
              <div className="flex items-center gap-6 mb-2">
                 {/* Dialog Logo / Icon */}
                 {team.logo_url ? (
                   <div className={`w-20 h-20 rounded-[2rem] overflow-hidden flex-shrink-0 border-2 ${
                     team.is_vip
                       ? 'border-secondary/40 shadow-[0_0_30px_-5px_rgba(255,180,0,0.5)]'
                       : 'border-primary/30 shadow-[0_0_30px_-5px_rgba(255,180,0,0.2)]'
                   }`}>
                     <img src={team.logo_url} alt={team.team_name} className="w-full h-full object-cover" />
                   </div>
                 ) : (
                   <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center border flex-shrink-0 ${
                     team.is_vip ? 'bg-secondary/10 border-secondary/20' : 'bg-primary/10 border-primary/20'
                   }`}>
                      {team.is_vip ? <Crown className="w-10 h-10 text-secondary" /> : <Shield className="w-10 h-10 text-primary" />}
                   </div>
                 )}
                 <div>
                    <DialogTitle className="text-4xl font-black text-white italic tracking-tighter uppercase mb-1">
                       {team.team_name}
                    </DialogTitle>
                    <Badge variant="outline" className="border-white/10 text-[10px] font-black italic tracking-widest uppercase">
                       Tactical ID: {team.id.slice(0, 8)}
                    </Badge>
                 </div>
              </div>
           </DialogHeader>

           <div className="grid grid-cols-2 gap-4">
              <div className="glass p-6 rounded-2xl border border-white/5 space-y-2">
                 <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest italic">ოპერატორები</div>
                 <div className="text-xl font-black text-white italic flex items-center gap-3">
                    <Users className="w-4 h-4 text-blue-400" />
                    {team.players_count} / 4
                 </div>
              </div>
              <div className="glass p-6 rounded-2xl border border-white/5 space-y-2">
                 <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest italic">მაპების რაოდენობა</div>
                 <div className="text-xl font-black text-white italic flex items-center gap-3">
                    <Target className="w-4 h-4 text-purple-400" />
                    {team.maps_count} Maps
                 </div>
              </div>
           </div>

           <div className="glass p-8 rounded-[2rem] border border-white/5 space-y-6">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl border border-white/10 overflow-hidden">
                       <img src={team.profiles?.avatar_url || "https://i.ibb.co/vzD7Z0M/default-avatar-dark.png"} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                       <div className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-1 italic">Unit Leader</div>
                       <h4 className="text-xl font-black text-white italic uppercase tracking-tight leading-none">{team.profiles?.username}</h4>
                    </div>
                 </div>
                 <Button asChild size="sm" variant="outline" className="h-12 px-6 rounded-xl border-primary/20 text-primary font-black uppercase tracking-widest text-[10px] italic hover:bg-primary/10 hover:border-primary/40 transition-all">
                    <Link href={`/profile/${team.profiles?.id}`}>პროფილი <ExternalLink className="w-3 h-3 ml-2" /></Link>
                 </Button>
              </div>

              <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-8 text-[10px] font-black uppercase tracking-widest italic text-muted-foreground leading-none">
                 <div>
                    <span className="block mb-2 text-white/20">რეგისტრაცია</span>
                    <span className="text-white">{format(new Date(team.created_at), "dd.MM.yyyy")}</span>
                 </div>
                  <div className="text-right">
                    <span className="block mb-2 text-white/20">სტატუსი</span>
                    <span className={`${team.status === 'approved' ? 'text-emerald-400' : 'text-yellow-400'} flex items-center justify-end gap-1 uppercase`}>
                       {team.status === 'approved' ? 'VERIFIED' : team.status === 'pending' ? 'PENDING' : team.status} 
                       {team.status === 'approved' ? <ShieldCheck className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                    </span>
                  </div>
              </div>
           </div>

           <div className="flex items-center gap-3 text-[9px] font-black text-white/20 uppercase tracking-[0.3em] italic justify-center">
              <Zap className="w-3 h-3" /> Arena Tactical Intel Protocol <Zap className="w-3 h-3" />
           </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground animate-pulse uppercase tracking-widest text-xs font-bold">იტვირთება...</p>
        </div>
      </div>
    )
  }

  if (!selectedSchedule) {
    return (
      <div className="min-h-screen py-32 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-20 text-center animate-reveal">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] glass border border-primary/20 mb-8">
              <Calendar className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 text-white tracking-tighter italic">
              აირჩიეთ <span className="text-primary tracking-normal">განრიგი</span>
            </h1>
            <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
              აირჩიეთ განრიგი რომლის გუნდების სიის ნახვაც გსურთ
            </p>
          </div>

          <div className="grid gap-6">
            {schedules.length > 0 ? (
              schedules.map((schedule, i) => (
                <div
                  key={schedule.id}
                  className="glass-card p-1 cursor-pointer group animate-reveal"
                  style={{ animationDelay: `${i * 0.1}s` }}
                  onClick={() => selectSchedule(schedule)}
                >
                  <div className="p-6 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl glass border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Gamepad2 className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl font-black text-white group-hover:text-primary transition-colors italic tracking-tight">
                        {schedule.title}
                      </h3>
                      <p className="text-sm text-muted-foreground font-light mt-1">
                        {format(new Date(schedule.date), "PPP, p", { locale: ka })}
                      </p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-bold uppercase tracking-widest">View Teams</span>
                      <ChevronRight className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-card p-20 text-center italic text-muted-foreground">
                ამჟამად აქტიური განრიგი არ არის
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-32 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12 animate-reveal">
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedSchedule(null)
              setTeams([])
            }}
            className="text-muted-foreground hover:text-primary transition-all group px-0"
          >
            <ChevronRight className="w-5 h-5 rotate-180 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="uppercase tracking-widest text-[10px] font-black">უკან განრიგებზე</span>
          </Button>
        </div>

        <div className="mb-20 text-center animate-reveal">
          <h1 className="text-5xl md:text-7xl font-black mb-4 text-white tracking-tighter italic">
            {selectedSchedule.title}
          </h1>
          <div className="flex items-center justify-center gap-4 text-muted-foreground font-light">
             <span>{format(new Date(selectedSchedule.date), "PPP, p", { locale: ka })}</span>
             <span className="w-1 h-1 rounded-full bg-white/20" />
             <span className="text-primary font-bold">{teams.length} გუნდი</span>
          </div>
        </div>

        {teamsLoading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teams.length > 0 ? (
              teams.map((team, i) => (
                <TeamCard key={team.id} team={team} i={i} />
              ))
            ) : (
              <div className="glass-card p-20 text-center col-span-full border-dashed border-white/10 opacity-50">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground lowercase font-black tracking-widest">no teams registered yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
