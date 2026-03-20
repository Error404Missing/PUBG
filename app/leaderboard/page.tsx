import { createClient } from "@/lib/supabase/server"
import { Trophy, Medal, Users, User, Zap, Target, Star, Swords, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const dynamic = "force-dynamic"

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const [clansRes, playersRes] = await Promise.all([
    supabase.from("leaderboard_clans").select("*").order("wins", { ascending: false }),
    supabase.from("leaderboard_players").select("*").order("kills", { ascending: false })
  ])

  const clans = clansRes.data || []
  const players = playersRes.data || []

  return (
    <div className="min-h-screen py-32 px-4 relative overflow-hidden bg-background">
      {/* Dynamic Background */}
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,rgba(255,180,0,0.08),transparent_70%)] -z-10" />
      <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_100%,rgba(0,180,255,0.05),transparent_70%)] -z-10" />

      <div className="container mx-auto max-w-6xl relative">
        {/* Header */}
        <div className="mb-20 text-center animate-reveal">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2.5rem] glass border border-amber-500/30 mb-8 relative group">
            <Trophy className="w-12 h-12 text-amber-400 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 rounded-[2.5rem] bg-amber-500/20 blur-2xl -z-10 animate-pulse" />
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-8 text-white tracking-tighter italic uppercase">
            Leader <span className="text-amber-400 tracking-normal">Board</span>
          </h1>
          <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto italic tracking-widest uppercase">
             Arena-ს საუკეთესო კლანები და მოთამაშეები
          </p>
        </div>

        <Tabs defaultValue="clans" className="space-y-16">
          <TabsList className="bg-white/5 border border-white/10 p-1.5 h-20 rounded-[2rem] w-full max-w-xl mx-auto grid grid-cols-2 relative mb-12">
            <TabsTrigger value="clans" className="rounded-[1.5rem] data-[state=active]:bg-amber-500 data-[state=active]:text-black font-black uppercase italic tracking-widest text-lg transition-all">
              <Swords className="w-5 h-5 mr-3" /> კლანები
            </TabsTrigger>
            <TabsTrigger value="players" className="rounded-[1.5rem] data-[state=active]:bg-amber-500 data-[state=active]:text-black font-black uppercase italic tracking-widest text-lg transition-all">
              <User className="w-5 h-5 mr-3" /> მოთამაშეები
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clans" className="animate-reveal">
             {/* Podium for Top 3 Clans */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 items-end">
                {/* 2nd Place */}
                {clans[1] && (
                  <div className="order-2 md:order-1 glass-card p-1 translate-y-4">
                    <div className="p-8 text-center space-y-6">
                       <div className="relative inline-block">
                          <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-slate-400/30 mx-auto">
                             <img src={clans[1].logo_url || "https://placehold.co/100x100"} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-slate-400 rounded-full flex items-center justify-center font-black text-black">2</div>
                       </div>
                       <div>
                          <h3 className="text-2xl font-black text-white italic truncate">{clans[1].name}</h3>
                          <p className="text-slate-400 font-black uppercase tracking-widest text-xs mt-2">{clans[1].wins} WINS</p>
                       </div>
                    </div>
                  </div>
                )}
                {/* 1st Place */}
                {clans[0] && (
                  <div className="order-1 md:order-2 glass-card p-1 scale-110 relative z-10 border-amber-500/30 shadow-2xl shadow-amber-500/20">
                    <div className="p-10 text-center space-y-6">
                       <div className="relative inline-block">
                          <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-amber-500 mx-auto shadow-xl">
                             <img src={clans[0].logo_url || "https://placehold.co/100x100"} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                             <Medal className="w-12 h-12 text-amber-400" />
                          </div>
                          <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center font-black text-black text-xl">1</div>
                       </div>
                       <div>
                          <h3 className="text-3xl font-black text-white italic truncate">{clans[0].name}</h3>
                          <p className="text-amber-500 font-black uppercase tracking-widest text-sm mt-2">{clans[0].wins} WINS</p>
                       </div>
                    </div>
                  </div>
                )}
                {/* 3rd Place */}
                {clans[2] && (
                  <div className="order-3 md:order-3 glass-card p-1 translate-y-8">
                    <div className="p-8 text-center space-y-6">
                       <div className="relative inline-block">
                          <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-amber-800/30 mx-auto">
                             <img src={clans[2].logo_url || "https://placehold.co/100x100"} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-amber-800 rounded-full flex items-center justify-center font-black text-white">3</div>
                       </div>
                       <div>
                          <h3 className="text-2xl font-black text-white italic truncate">{clans[2].name}</h3>
                          <p className="text-amber-800 font-black uppercase tracking-widest text-xs mt-2">{clans[2].wins} WINS</p>
                       </div>
                    </div>
                  </div>
                )}
             </div>

             {/* List for the rest of Clans */}
             <div className="space-y-4">
                {clans.slice(3).map((clan, i) => (
                  <div key={clan.id} className="glass border-white/5 p-6 rounded-3xl flex items-center justify-between group hover:border-amber-500/20 transition-all">
                     <div className="flex items-center gap-8">
                        <div className="text-xl font-black text-white/10 italic w-10">{i + 4}</div>
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                           {clan.logo_url && <img src={clan.logo_url} className="w-full h-full object-cover" />}
                        </div>
                        <div>
                           <h4 className="text-2xl font-black text-white italic tracking-tight uppercase leading-none mb-1">{clan.name}</h4>
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-2xl font-black text-amber-400 italic leading-none">{clan.wins}</div>
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Total Wins</div>
                     </div>
                  </div>
                ))}
             </div>
          </TabsContent>

          <TabsContent value="players" className="animate-reveal">
             {/* Player Leaderboard specifically logic here */}
             <div className="space-y-4">
                {players.map((player, i) => (
                  <div key={player.id} className={`glass border-white/5 p-8 rounded-[2.5rem] flex items-center justify-between group transition-all relative overflow-hidden ${i < 3 ? 'border-amber-500/20' : ''}`}>
                     {i < 3 && <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl -z-10" />}
                     
                     <div className="flex items-center gap-10">
                        <div className={`text-4xl font-black italic tracking-tighter w-12 ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-amber-800' : 'text-white/10'}`}>
                           {i + 1}
                        </div>
                        <div className="relative">
                           <div className={`w-16 h-16 rounded-2xl overflow-hidden border-2 ${i === 0 ? 'border-amber-500 shadow-lg shadow-amber-500/20' : 'border-white/10'}`}>
                              {player.avatar_url && <img src={player.avatar_url} className="w-full h-full object-cover" />}
                           </div>
                           {i === 0 && <Medal className="absolute -top-3 -right-3 w-8 h-8 text-amber-400" />}
                        </div>
                        <div>
                           <h4 className="text-2xl font-black text-white italic leading-none uppercase mb-2 group-hover:text-amber-400 transition-colors">{player.name}</h4>
                           <div className="flex items-center gap-4">
                              {i === 0 && <Badge className="bg-amber-500 text-black text-[9px] font-black uppercase tracking-widest">Elite MVP</Badge>}
                           </div>
                        </div>
                     </div>

                     <div className="flex items-center gap-12 text-right">
                        <div>
                           <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Kills</div>
                           <div className="text-3xl font-black text-amber-400 italic">{player.kills}</div>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
