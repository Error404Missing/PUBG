"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Crown, Shield, Gamepad2, Calendar, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { ka } from "date-fns/locale"

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
  is_vip: boolean
  slot_number: number | null
  players_count: number
  profiles: { username: string } | null
}

export default function TeamsPage() {
  const supabase = createBrowserClient()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [teamsLoading, setTeamsLoading] = useState(false)

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("schedules")
      .select("*")
      .eq("is_active", true)
      .order("date", { ascending: true })

    setSchedules(data || [])
    setLoading(false)
  }

  const selectSchedule = async (schedule: Schedule) => {
    setSelectedSchedule(schedule)
    setTeamsLoading(true)

    const { data: requests } = await supabase
      .from("scrim_requests")
      .select("team_id")
      .eq("schedule_id", schedule.id)
      .eq("status", "approved")

    if (requests && requests.length > 0) {
      const teamIds = requests.map((r) => r.team_id)
      const { data: teamsData } = await supabase
        .from("teams")
        .select("*, profiles(username)")
        .in("id", teamIds)
        .order("is_vip", { ascending: false })
        .order("created_at", { ascending: false })

      setTeams((teamsData as Team[]) || [])
    } else {
      setTeams([])
    }

    setTeamsLoading(false)
  }

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
                <div
                  key={team.id}
                  className={`glass-card p-8 group animate-reveal ${
                    team.is_vip ? "border-secondary/30 ring-1 ring-secondary/20" : ""
                  }`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {team.is_vip && <Crown className="w-5 h-5 text-secondary animate-pulse-soft" />}
                        <h3 className="text-2xl font-black text-white italic tracking-tight group-hover:text-primary transition-colors">
                          {team.team_name}
                        </h3>
                      </div>
                      <Badge variant="outline" className="border-white/10 tracking-[0.2em] font-mono text-[10px] py-1">
                        {team.team_tag}
                      </Badge>
                    </div>
                    {team.slot_number && (
                      <div className="text-right">
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Slot</div>
                        <div className="text-2xl font-black text-primary">#{team.slot_number}</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl glass border border-white/5">
                      <div className="flex items-center gap-3">
                        <Shield className={`w-5 h-5 ${team.is_vip ? "text-secondary" : "text-primary/70"}`} />
                        <div>
                          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Leader</div>
                          <div className="text-sm font-bold text-white">{team.profiles?.username || "უცნობი"}</div>
                        </div>
                      </div>
                      {team.is_vip && (
                         <Badge variant="gold" className="font-black italic">VIP</Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-6 px-2">
                       <div className="flex items-center gap-2">
                          <Gamepad2 className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs font-bold text-muted-foreground">{team.players_count || 4} PLAYERS</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Verified</span>
                       </div>
                    </div>
                  </div>

                  {/* Decorative background number */}
                  <div className="absolute -bottom-10 -right-10 text-9xl font-black text-white/5 italic -z-10 group-hover:text-primary/10 transition-colors">
                    {i + 1}
                  </div>
                </div>
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
