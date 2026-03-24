"use client"

import { useState } from "react"
import { Users, Crown, Shield, Target, Zap, Users2, Info, ChevronRight, LayoutGrid, Calendar, Globe, MessageSquare, Instagram, Music2, X } from "lucide-react"
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

  const sortedTeams = [...teams].sort((a, b) => {
    if (a.is_vip && !b.is_vip) return -1;
    if (!a.is_vip && b.is_vip) return 1;
    return 0;
  });

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedTeams.length > 0 ? (
          sortedTeams.map((team, i) => (
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

              <div className="p-5 md:p-8">
                <div className="flex items-start justify-between mb-8 gap-4">
                  <div className="flex items-center gap-3 md:gap-5 min-w-0">
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
                      <h3 className={`text-xl md:text-2xl font-black italic tracking-tighter uppercase leading-none mb-2 truncate ${
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
                    <div className="text-right shrink-0">
                      <div className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">Sector</div>
                      <div className={`text-2xl md:text-3xl font-black italic leading-none ${team.is_vip ? 'text-secondary' : 'text-primary'}`}>
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
        <DialogContent className={`sm:max-w-[90vw] md:max-w-4xl lg:max-w-6xl w-full bg-[#020204] border-white/5 p-0 overflow-hidden rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl ${selectedTeam?.is_vip ? 'shadow-secondary/20 border-secondary/20' : 'shadow-primary/20'}`}>
          <button 
             onClick={() => setSelectedTeam(null)}
             className="absolute top-8 right-8 z-[60] w-12 h-12 rounded-2xl glass-darker border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all text-white/40 hover:text-white group"
          >
             <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          </button>
          {selectedTeam && (
            <div className="relative">
              {/* Luxury Background mesh */}
              <div className="absolute inset-0 bg-mesh opacity-20 -z-10" />
              
              {/* Header Visual */}
              <div className="h-64 relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-1000 ${
                  selectedTeam.is_vip 
                    ? 'from-secondary/20 via-background to-background' 
                    : 'from-primary/20 via-background to-background'
                }`} />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                
                <div className="absolute top-12 left-12 flex flex-col md:flex-row items-center gap-10">
                  <div className={`w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] glass p-1.5 border-2 relative z-10 shadow-2xl ${
                    selectedTeam.is_vip ? 'border-secondary/50 shadow-secondary/40' : 'border-white/10'
                  }`}>
                    <img 
                      src={selectedTeam.logo_url || (selectedTeam.is_vip ? 'https://i.ibb.co/vYm0C2M/default-banner-dark.jpg' : 'https://i.ibb.co/vzD7Z0M/default-avatar-dark.png')} 
                      className={`w-full h-full object-cover rounded-[2.2rem] ${selectedTeam.is_vip ? 'shadow-2xl' : ''}`} 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const fallback = selectedTeam.is_vip ? 'https://i.ibb.co/vYm0C2M/default-banner-dark.jpg' : 'https://i.ibb.co/vzD7Z0M/default-avatar-dark.png';
                        if (target.src !== fallback) {
                          target.src = fallback;
                        }
                      }}
                    />
                    {selectedTeam.is_vip && (
                       <div className="absolute -top-3 -right-3 w-10 h-10 bg-secondary rounded-xl flex items-center justify-center shadow-lg shadow-secondary/50 border-2 border-background">
                          <Crown className="w-5 h-5 text-background" />
                       </div>
                    )}
                  </div>
                  <div className="space-y-4 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                       <h2 className={`text-6xl md:text-7xl font-black italic tracking-tighter uppercase leading-none drop-shadow-2xl ${
                         selectedTeam.is_vip ? 'text-secondary text-glow' : 'text-white'
                       }`}>{selectedTeam.team_name}</h2>
                       <Badge variant={selectedTeam.is_vip ? 'gold' : 'outline'} className="text-2xl font-black py-1 px-4 italic">
                         [{selectedTeam.team_tag}]
                       </Badge>
                    </div>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-[10px] font-black uppercase tracking-[0.5em] text-white/40 italic">
                       <span className="flex items-center gap-2"><Zap className={`w-3 h-3 ${selectedTeam.is_vip ? 'text-secondary' : 'text-primary'}`} /> MISSION_READY</span>
                       <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                       <span className="flex items-center gap-2"><LayoutGrid className="w-3 h-3" /> {selectedTeam.maps_count || 4} OPS_QUOTA</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-10 lg:p-14 pt-10 space-y-16">
                 {/* Commander Briefing */}
                 <div className="grid md:grid-cols-5 gap-12">
                    <div className="md:col-span-3 space-y-8">
                       <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xs font-black text-white/20 uppercase tracking-[0.5em] italic">Operation_Manager_Brief</h3>
                          <div className="h-px flex-1 bg-white/5 ml-6" />
                       </div>
                       
                       <div className="glass-card p-1 relative group overflow-visible">
                          <div className="p-8 space-y-8">
                             <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                                <div className="relative">
                                   <div className="w-24 h-24 rounded-3xl border border-white/10 overflow-hidden shrink-0 shadow-2xl relative z-10">
                                      <img 
                                        src={selectedTeam.profiles?.avatar_url || "https://i.ibb.co/vzD7Z0M/default-avatar-dark.png"} 
                                        className="w-full h-full object-cover" 
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          if (!target.src.includes('default-avatar-dark')) {
                                            target.src = "https://i.ibb.co/vzD7Z0M/default-avatar-dark.png"
                                          }
                                        }}
                                      />
                                   </div>
                                   <div className="absolute inset-x-0 inset-y-0 bg-primary/20 blur-2xl -z-10 scale-150 opacity-50" />
                                </div>
                                <div className="space-y-4 flex-1 text-center md:text-left">
                                   <div className="space-y-1">
                                      <div className="text-xs font-black text-primary/60 uppercase tracking-widest italic leading-none">Commanding_Officer</div>
                                      <div className="text-4xl font-black text-white uppercase italic tracking-tight">{selectedTeam.profiles?.username || 'ANONYMOUS'}</div>
                                   </div>
                                   <p className="text-base text-white/50 font-medium leading-relaxed italic max-w-xl">
                                      {selectedTeam.profiles?.bio || "ოპერატორის ბიოგრაფია ჯერჯერობით არ არის ხელმისაწვდომი. დაშიფრული მონაცემები."}
                                   </p>
                                </div>
                             </div>
                             
                             <div className="flex flex-wrap items-center gap-4 pt-8 border-t border-white/5">
                                <div className="flex items-center gap-3">
                                   {selectedTeam.profiles?.instagram_url && (
                                      <a href={selectedTeam.profiles.instagram_url} target="_blank" className="w-12 h-12 rounded-2xl glass-darker border border-white/10 flex items-center justify-center hover:border-primary/50 text-white/40 hover:text-primary transition-all group/icon">
                                         <Instagram className="w-5 h-5 group-hover/icon:scale-110" />
                                      </a>
                                   )}
                                   {selectedTeam.profiles?.tiktok_url && (
                                      <a href={selectedTeam.profiles.tiktok_url} target="_blank" className="w-12 h-12 rounded-2xl glass-darker border border-white/10 flex items-center justify-center hover:border-primary/50 text-white/40 hover:text-primary transition-all group/icon">
                                         <Music2 className="w-5 h-5 group-hover/icon:scale-110" />
                                      </a>
                                   )}
                                   {selectedTeam.profiles?.discord_username && (
                                      <div className="px-5 h-12 rounded-2xl glass-darker border border-white/5 flex items-center gap-3 text-[10px] font-black text-white/40 italic">
                                         <MessageSquare className="w-4 h-4" /> {selectedTeam.profiles.discord_username}
                                      </div>
                                   )}
                                </div>
                                <div className="flex-1" />
                                <Link 
                                  href={`/profile/${selectedTeam.leader_id}`}
                                  className="h-12 px-8 rounded-2xl bg-primary/10 border border-primary/30 text-primary text-xs font-black uppercase tracking-widest hover:bg-primary/20 transition-all flex items-center gap-2 group/link shadow-lg shadow-primary/10"
                                >
                                  View_Profile <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1" />
                                </Link>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="md:col-span-2 space-y-8">
                       <h3 className="text-xs font-black text-white/20 uppercase tracking-[0.5em] italic">Deployment_Stats</h3>
                       <div className="grid gap-6">
                          {[
                            { label: 'OPERATORS', value: `${selectedTeam.players_count || 4} / 4`, icon: Users2, detail: 'UNITS_SYNCED' },
                            { label: 'MAP_QUOTA', value: `${selectedTeam.maps_count || 4} OPERATIONS`, icon: Target, detail: 'SECTOR_COVERAGE' },
                            { label: 'UNIT_STATUS', value: selectedTeam.is_vip ? 'SUPREME_ELITE' : 'ACTIVE_DUTY', icon: Zap, detail: 'PRIORITY_LEVEL' },
                          ].map((stat, idx) => (
                             <div key={idx} className="glass-card p-1 group overflow-visible">
                                <div className="p-6 flex items-center justify-between">
                                   <div className="flex items-center gap-4">
                                      <div className={`w-12 h-12 rounded-2xl glass border border-white/5 flex items-center justify-center transition-all group-hover:scale-110 ${idx === 2 && selectedTeam.is_vip ? 'bg-secondary/20 border-secondary/30' : ''}`}>
                                         <stat.icon className={`w-6 h-6 transition-colors ${idx === 2 && selectedTeam.is_vip ? 'text-secondary' : 'text-primary/60'}`} />
                                      </div>
                                      <div>
                                         <div className="text-[9px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">{stat.label}</div>
                                         <div className={`text-xl font-black italic tracking-tight ${idx === 2 && selectedTeam.is_vip ? 'text-secondary' : 'text-white'}`}>{stat.value}</div>
                                      </div>
                                   </div>
                                   <Badge variant="outline" className="text-[8px] opacity-30 italic">{stat.detail}</Badge>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="flex justify-center">
                   <Button 
                     onClick={() => setSelectedTeam(null)}
                     variant="outline" 
                     className="h-16 px-16 rounded-[2rem] border-white/10 hover:bg-white/5 text-muted-foreground font-black uppercase tracking-widest italic transition-all group hover:text-white"
                   >
                     Close_Interface <X className="w-4 h-4 ml-3 opacity-20 group-hover:opacity-100" />
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
