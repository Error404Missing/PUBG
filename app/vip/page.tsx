import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Crown, Users, Sparkles, Zap, Star, Trophy, Shield, Rocket, Gift, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function VIPPage() {
  const supabase = await createClient()
  const { data: vipTeams } = await supabase
    .from("teams")
    .select("*, profiles!teams_leader_id_fkey(username)")
    .eq("is_vip", true)
    .eq("status", "approved")
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen py-32 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-7xl relative">
        {/* Hero Section */}
        <div className="mb-24 text-center animate-reveal">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2.5rem] glass border border-secondary/20 mb-10 animate-float-subtle">
            <Crown className="w-12 h-12 text-secondary" />
          </div>
          <h1 className="text-6xl md:text-9xl font-black mb-8 tracking-tighter italic">
            VIP <span className="text-secondary tracking-normal">ELITE</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
            გახდი ელიტური გუნდის ნაწილი და მიიღე ექსკლუზიური უპირატესობები
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-2xl mx-auto mb-32 animate-reveal" style={{ animationDelay: '0.2s' }}>
          <div className="glass-card p-1 relative overflow-hidden group shadow-[0_0_80px_rgba(255,200,0,0.1)]">
             <div className="absolute top-0 right-0 p-8">
                <Badge variant="gold" className="px-6 py-2 text-xs italic tracking-widest">PREMIUM STATUS</Badge>
             </div>
             
             <div className="p-12 lg:p-16">
                <div className="mb-12">
                   <div className="flex items-center gap-3 mb-4">
                      <Sparkles className="w-5 h-5 text-secondary animate-pulse" />
                      <h2 className="text-2xl font-black text-white italic tracking-widest uppercase">VIP Membership</h2>
                   </div>
                   <div className="flex items-baseline gap-4">
                      <span className="text-7xl lg:text-9xl font-black text-secondary tracking-tighter italic">VIP</span>
                      <span className="text-muted-foreground text-sm uppercase tracking-[0.3em] font-light">Status</span>
                   </div>
                   <p className="text-muted-foreground mt-6 text-lg font-light leading-relaxed">
                      ერთჯერადი შეძენა - სამუდამო უპირატესობები და პრესტიჟი.
                   </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-12">
                  {[
                    { icon: Rocket, text: "პრიორიტეტული რეგისტრაცია" },
                    { icon: Star, text: "ექსკლუზიური VIP Badge" },
                    { icon: Shield, text: "დაცული სლოტი მატჩებში" },
                    { icon: Trophy, text: "პრესტიჟული სტატუსი" },
                    { icon: Gift, text: "სპეციალური ბონუსები" },
                    { icon: Crown, text: "ელიტური სია" },
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl glass border border-white/5 group/feat hover:border-secondary/30 transition-all">
                      <div className="w-10 h-10 rounded-xl glass border border-white/10 flex items-center justify-center group-hover/feat:scale-110 transition-transform">
                        <feature.icon className="w-5 h-5 text-secondary" />
                      </div>
                      <span className="text-white/80 font-bold text-sm tracking-tight">{feature.text}</span>
                    </div>
                  ))}
                </div>
                
                <Button
                  asChild
                  variant="premium"
                  className="w-full h-20 text-xl group relative"
                >
                  <Link href="/contact" className="flex items-center justify-center gap-3">
                    <Crown className="w-6 h-6" />
                    Apply for VIP
                  </Link>
                </Button>
                
                <p className="text-center text-muted-foreground text-xs font-black uppercase tracking-widest mt-8 flex items-center justify-center gap-4">
                  <span className="h-px flex-1 bg-white/5" />
                  Discord & Facebook Support
                  <span className="h-px flex-1 bg-white/5" />
                </p>
             </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="mb-32">
          <div className="text-center mb-16 animate-reveal">
             <h2 className="text-4xl lg:text-5xl font-black text-white italic tracking-tighter mb-4 uppercase">Elite Perks</h2>
             <p className="text-muted-foreground font-light tracking-widest uppercase text-xs">რატომ უნდა აირჩიო VIP?</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Zap, title: "სწრაფი დადასტურება", desc: "თქვენი განაცხადი პრიორიტეტულად განიხილება", color: "yellow" },
              { icon: Star, title: "გამორჩეული დიზაინი", desc: "VIP badge და სპეციალური ვიზუალი", color: "purple" },
              { icon: Trophy, title: "ელიტური სტატუსი", desc: "აღიარება როგორც ტოპ გუნდი", color: "pink" },
              { icon: Shield, title: "გარანტირებული სლოტი", desc: "ყოველთვის გაქვთ ადგილი სკრიმში", color: "blue" },
            ].map((benefit, idx) => (
              <div 
                key={idx} 
                className="glass-card p-8 group animate-reveal"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="w-16 h-16 rounded-[1.25rem] glass border border-white/5 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:border-secondary/50 transition-all duration-500">
                  <benefit.icon className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-xl font-black text-white mb-4 italic tracking-tight uppercase group-hover:text-secondary transition-colors">{benefit.title}</h3>
                <p className="text-muted-foreground font-light leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* VIP Teams Section */}
        <div>
          <div className="text-center mb-16 animate-reveal">
             <h2 className="text-4xl lg:text-5xl font-black text-white italic tracking-tighter mb-4 uppercase">Active Elite</h2>
             <p className="text-muted-foreground font-light tracking-widest uppercase text-xs">ჩვენი VIP გუნდები</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vipTeams && vipTeams.length > 0 ? (
              vipTeams.map((team, index) => (
                <div
                  key={team.id}
                  className="glass-card p-1 group animate-reveal"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="p-8">
                     <div className="flex items-start justify-between mb-8">
                        <div>
                           <div className="flex items-center gap-2 mb-2">
                              <Crown className="w-5 h-5 text-secondary" />
                              <h3 className="text-2xl font-black text-white italic tracking-tight">{team.team_name}</h3>
                           </div>
                           <div className="text-muted-foreground text-xs font-mono tracking-widest uppercase">TAG: {team.team_tag}</div>
                        </div>
                        {team.slot_number && (
                           <div className="px-4 py-1 rounded-full glass border border-secondary/30 text-secondary text-[10px] font-black uppercase tracking-widest">
                             Slot #{team.slot_number}
                           </div>
                        )}
                     </div>

                     <div className="flex items-center justify-between p-4 rounded-2xl glass border border-white/5">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center">
                              <Users className="w-5 h-5 text-white/50" />
                           </div>
                           <div>
                              <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Leader</div>
                              <div className="text-sm font-bold text-white tracking-tight">{team.profiles?.username || 'უცნობი'}</div>
                           </div>
                        </div>
                        <Badge variant="gold" className="text-[10px] italic">ELITE</Badge>
                     </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-card p-20 text-center border-dashed border-white/10 opacity-50 col-span-full">
                 <Crown className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                 <p className="text-muted-foreground lowercase font-black tracking-widest">VIP გუნდები ჯერ არ არის</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
