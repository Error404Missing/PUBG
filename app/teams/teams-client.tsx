"use client"

import { useState } from "react"
import { Users, Crown, Shield, Target, Zap, Users2, Info, ChevronRight, LayoutGrid, Calendar, Globe, MessageSquare, Instagram, Music2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"
import { format } from "date-fns"
import { ka } from "date-fns/locale"

interface Team {
  id: string
  team_name: string
  team_tag: string
  status: string
  is_vip: boolean
  leader_id: string
  logo_url?: string
  slot_number?: number
  players_count?: number
  maps_count?: number
  profiles?: {
    username: string
    avatar_url?: string
    bio?: string
    discord_username?: string
    instagram_url?: string
    tiktok_url?: string
  }
}

export function TeamsClient({ teams }: { teams: Team[] }) {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teams.length > 0 ? (
          teams.map((team, i) => (
            <div 
              key={team.id} 
              onClick={() => setSelectedTeam(team)}
              className={`glass-card p-1 relative overflow-hidden group animate-reveal cursor-pointer ${
                team.is_vip ? 'vip-card-premium ring-2 ring-secondary/20 scale-[1.02] shadow-secondary/10' : ''
              }`} 
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {team.is_vip && (
                <>
                  <div className="absolute top-0 right-0 p-4 z-20">
                    <div className="bg-secondary/20 backdrop-blur-md border border-secondary/40 px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-secondary/10">
                      <Crown className="w-3.5 h-3.5 text-secondary animate-pulse" />
                      <span className="text-[8px] font-black text-secondary tracking-[0.2em] uppercase italic">ELITE</span>
                    </div>
                  </div>
                  <div className="vip-border-shimmer" />
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-secondary/10 to-transparent opacity-50" />
                </>
              )}

              <div className="p-8">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-5">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all group-hover:scale-110 ${
                      team.is_vip 
                        ? 'border-secondary bg-secondary/10 shadow-[0_0_25px_-5px_rgba(234,179,8,0.4)]' 
                        : 'border-white/10 bg-white/5'
                    }`}>
                      {team.logo_url ? (
                        <img src={team.logo_url} className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        team.is_vip ? <Crown className="w-8 h-8 text-secondary" /> : <Shield className="w-8 h-8 text-primary/40" />
                      )}
                    </div>
                    <div>
                      <h3 className={`text-2xl font-black italic tracking-tighter uppercase leading-none mb-2 ${
                        team.is_vip ? 'text-secondary text-glow' : 'text-white'
                      }`}>{team.team_name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`border-white/10 text-[9px] font-black uppercase tracking-widest py-1 ${team.is_vip ? 'bg-secondary/10 text-secondary' : 'text-white/40'}`}>
                          {team.team_tag}
                        </Badge>
                        <Badge className={`text-[8px] font-black uppercase tracking-widest py-0.5 px-2 rounded-sm border ${
                          team.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          team.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {team.status === 'approved' ? 'Active' : 'Review'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {team.slot_number && (
                    <div className="text-right">
                      <div className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">Sector</div>
                      <div className={`text-3xl font-black italic leading-none ${team.is_vip ? 'text-secondary' : 'text-primary'}`}>
                        #{team.slot_number}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl glass-darker border border-white/5 group-hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full border border-white/10 overflow-hidden ring-4 ring-white/5">
                        <img src={team.profiles?.avatar_url || "https://i.ibb.co/vzD7Z0M/default-avatar-dark.png"} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">Operational Commander</p>
                        <p className="text-xs font-bold text-white uppercase italic">{team.profiles?.username || "Unknown"}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-primary transition-all group-hover:translate-x-1" />
                  </div>
                  
                  <div className="flex items-center justify-between px-2 pt-2">
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase italic text-white/30 tracking-[0.2em]">
                       <Users2 className="w-3.5 h-3.5" /> {team.players_count || 4} OPS_READY
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${team.is_vip ? 'bg-secondary' : 'bg-emerald-500'}`} />
                      <span className={`text-[9px] font-black uppercase tracking-[0.2em] italic ${team.is_vip ? 'text-secondary' : 'text-emerald-400'}`}>
                        {team.is_vip ? 'PRIORITY_UNIT' : 'VERIFIED_UNIT'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-32 text-center glass-card border-dashed border-white/5 opacity-50">
            <Users className="w-16 h-16 text-white/10 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-white/20 italic uppercase tracking-tighter mb-2">No_Data_Returned</h3>
            <p className="text-[10px] text-white/10 font-bold uppercase tracking-[0.3em]">ამ განრიგში გუნდები ჯერ არ მოიძებნა.</p>
          </div>
        )}
      </div>

      {/* Team Details Intelligence Modal */}
      <Dialog open={!!selectedTeam} onOpenChange={(open) => !open && setSelectedTeam(null)}>
        <DialogContent className={`max-w-2xl bg-[#030712] border-white/5 p-0 overflow-hidden rounded-[3rem] shadow-2xl ${selectedTeam?.is_vip ? 'shadow-secondary/20 border-secondary/20' : 'shadow-primary/20'}`}>
          {selectedTeam && (
            <div className="relative">
              {/* Header Visual */}
              <div className="h-48 relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-1000 ${
                  selectedTeam.is_vip 
                    ? 'from-secondary/20 via-background to-background' 
                    : 'from-primary/20 via-background to-background'
                }`} />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                
                <div className="absolute top-10 left-10 flex items-center gap-8">
                  <div className={`w-28 h-28 rounded-[2rem] glass p-1 border-2 relative z-10 shadow-2xl ${
                    selectedTeam.is_vip ? 'border-secondary shadow-secondary/20' : 'border-white/10'
                  }`}>
                    {selectedTeam.logo_url ? (
                      <img src={selectedTeam.logo_url} className="w-full h-full object-cover rounded-[1.8rem]" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/5 rounded-[1.8rem]">
                        {selectedTeam.is_vip ? <Crown className="w-12 h-12 text-secondary" /> : <Shield className="w-12 h-12 text-primary/40" /> }
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                       <h2 className={`text-5xl font-black italic tracking-tighter uppercase leading-none ${
                         selectedTeam.is_vip ? 'text-secondary text-glow' : 'text-white'
                       }`}>{selectedTeam.team_name}</h2>
                       <Badge variant="outline" className={`text-xl font-black border-white/10 ${selectedTeam.is_vip ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-white/5 text-white/40'}`}>
                         [{selectedTeam.team_tag}]
                       </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic">
                       <span className="flex items-center gap-2"><Globe className="w-3 h-3" /> Mission_Ready</span>
                       <span className="w-1 h-1 rounded-full bg-primary" />
                       <span className="flex items-center gap-2"><LayoutGrid className="w-3 h-3" /> {selectedTeam.maps_count || 4} Maps</span>
                    </div>
                  </div>
                </div>

                {selectedTeam.is_vip && (
                   <div className="absolute top-8 right-8">
                      <div className="bg-secondary/10 border border-secondary/30 px-6 py-2 rounded-full flex items-center gap-3 shadow-2xl">
                         <Crown className="w-4 h-4 text-secondary" />
                         <span className="text-[10px] font-black text-secondary tracking-[0.3em] uppercase italic">Supreme_Elite_Unit</span>
                      </div>
                   </div>
                )}
              </div>

              <div className="p-10 lg:p-14 pt-6 space-y-12">
                 {/* Commander Briefing */}
                 <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                       <div className="space-y-4">
                          <h3 className="text-sm font-black text-white/20 uppercase tracking-[0.4em] italic mb-6">Commander_Briefing</h3>
                          <div className="glass p-8 rounded-[2rem] border border-white/5 relative group hover:border-white/10 transition-all">
                             <div className="flex items-start gap-6">
                                <div className="w-16 h-16 rounded-2xl border border-white/10 overflow-hidden shrink-0 shadow-xl">
                                   <img src={selectedTeam.profiles?.avatar_url || "https://i.ibb.co/vzD7Z0M/default-avatar-dark.png"} className="w-full h-full object-cover" />
                                </div>
                                <div className="space-y-2 flex-1">
                                   <div className="text-2xl font-black text-white uppercase italic">{selectedTeam.profiles?.username || 'ანონიმური'}</div>
                                   <p className="text-sm text-white/40 font-medium leading-relaxed italic">
                                      {selectedTeam.profiles?.bio || "ოპერატორის ბიოგრაფია ჯერჯერობით არ არის ხელმისაწვდომი. დაშიფრული მონაცემები."}
                                   </p>
                                </div>
                             </div>
                             
                             <div className="flex gap-3 mt-8 pt-8 border-t border-white/5">
                                {selectedTeam.profiles?.instagram_url && (
                                   <a href={selectedTeam.profiles.instagram_url} target="_blank" className="w-10 h-10 rounded-xl glass border border-white/5 flex items-center justify-center hover:border-primary/50 text-white/40 hover:text-primary transition-all">
                                      <Instagram className="w-4 h-4" />
                                   </a>
                                )}
                                {selectedTeam.profiles?.tiktok_url && (
                                   <a href={selectedTeam.profiles.tiktok_url} target="_blank" className="w-10 h-10 rounded-xl glass border border-white/5 flex items-center justify-center hover:border-primary/50 text-white/40 hover:text-primary transition-all">
                                      <Music2 className="w-4 h-4" />
                                   </a>
                                )}
                                <div className="flex-1" />
                                <Link 
                                  href={`/profile/${selectedTeam.leader_id}`}
                                  className="px-6 py-2 rounded-xl glass border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 transition-all"
                                >
                                  სრული პროფილი
                                </Link>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <h3 className="text-sm font-black text-white/20 uppercase tracking-[0.4em] italic mb-6">Unit_Stats</h3>
                       <div className="space-y-4">
                          {[
                            { label: 'OPERATORS', value: `${selectedTeam.players_count || 4} / 4`, icon: Users2 },
                            { label: 'MAP_QUOTA', value: `${selectedTeam.maps_count || 4}`, icon: Target },
                            { label: 'STATUS', value: selectedTeam.is_vip ? 'ELITE' : 'ACTIVE', icon: Zap },
                          ].map((stat, idx) => (
                             <div key={idx} className="glass p-5 rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-white/5 transition-all">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-all">
                                      <stat.icon className="w-4 h-4 text-white/40 group-hover:text-primary transition-colors" />
                                   </div>
                                   <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{stat.label}</span>
                                </div>
                                <span className={`text-sm font-black italic ${stat.label === 'STATUS' && selectedTeam.is_vip ? 'text-secondary' : 'text-white'}`}>{stat.value}</span>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="flex justify-center pt-4">
                   <Button 
                     onClick={() => setSelectedTeam(null)}
                     variant="outline" 
                     className="h-14 px-12 rounded-2xl border-white/10 hover:bg-white/5 text-muted-foreground font-black uppercase tracking-widest italic"
                   >
                     დახურვა
                   </Button>
                 </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
