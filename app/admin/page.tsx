import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, Calendar, Trophy, Ban, Gamepad2, 
  UserCog, Shield, Zap, Target, Activity,
  ChevronRight, LayoutDashboard, Settings, Layers,
  CheckCircle2, MessageSquare
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

  if (!profile?.is_admin) {
    redirect("/")
  }

  // Fetch counts with safety
  const { count: pendingTeams } = await supabase.from("teams").select("*", { count: "exact", head: true }).eq("status", "pending")
  const { count: approvedTeams } = await supabase.from("teams").select("*", { count: "exact", head: true }).eq("status", "approved")
  const { count: blockedTeams } = await supabase.from("teams").select("*", { count: "exact", head: true }).eq("status", "blocked")
  const { count: totalSchedules } = await supabase.from("schedules").select("*", { count: "exact", head: true })
  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  const stats = [
    { label: "განხილვაში", value: pendingTeams ?? 0, color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20", icon: Activity },
    { label: "აქტიური", value: approvedTeams ?? 0, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", icon: CheckCircle2 },
    { label: "დაბლოკილი", value: blockedTeams ?? 0, color: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-400/20", icon: Ban },
    { label: "მატჩები", value: totalSchedules ?? 0, color: "text-sky-400", bg: "bg-sky-400/10", border: "border-sky-400/20", icon: Calendar },
  ]

  const adminLinks = [
    { 
      href: "/admin/teams", 
      label: "გუნდების მართვა", 
      desc: "დადასტურება, უარყოფა, სლოტი, VIP სტატუსი", 
      icon: Users, 
      color: "blue",
      stat: pendingTeams + " Pending"
    },
    { 
      href: "/admin/schedule", 
      label: "განრიგის მართვა", 
      desc: "ახალი მატჩების დამატება და რედაქტირება", 
      icon: Calendar, 
      color: "blue" 
    },
    { 
      href: "/admin/results", 
      label: "შედეგების მართვა", 
      desc: "მატჩების შედეგები და სურათების ატვირთვა", 
      icon: Trophy, 
      color: "blue" 
    },
    { 
      href: "/admin/users", 
      label: "მომხმარებლები", 
      desc: "роლების მართვა, ბანი, VIP ადმინისტრირება", 
      icon: UserCog, 
      color: "yellow",
      stat: totalUsers + " Total"
    },
    { 
      href: "/admin/rules", 
      label: "წესების მართვა", 
      desc: "Arena-ს წესების და პირობების რედაქტირება", 
      icon: Shield, 
      color: "red" 
    },
    { 
      href: "/admin/support", 
      label: "მხარდაჭერის ცენტრი", 
      desc: "მომხმარებლებთან პირდაპირი ჩატი და დახმარება", 
      icon: MessageSquare, 
      color: "sky" 
    },
  ]

  return (
    <div className="min-h-screen py-32 px-4 relative overflow-hidden bg-background">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,rgba(255,180,0,0.05),transparent_70%)] -z-10" />
      <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_100%,rgba(0,180,255,0.03),transparent_70%)] -z-10" />

      <div className="container mx-auto max-w-7xl relative">
        {/* Header */}
        <div className="mb-16 animate-reveal">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-[2rem] glass border border-secondary/20 flex items-center justify-center relative group">
              <Shield className="w-10 h-10 text-secondary transition-transform group-hover:rotate-12 duration-500" />
              <div className="absolute inset-0 rounded-[2rem] bg-secondary/20 blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                 <h1 className="text-5xl lg:text-7xl font-black text-white italic tracking-tighter uppercase leading-none">Command <span className="text-secondary tracking-normal">Center</span></h1>
                 <Badge variant="secondary" className="px-3 py-1 font-black text-[10px] tracking-widest uppercase italic">Admin_Access_Lv3</Badge>
              </div>
              <p className="text-muted-foreground font-light tracking-[0.3em] uppercase text-xs">სრული კონტროლი Arena-ს ინფრასტრუქტურაზე</p>
            </div>
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-reveal" style={{ animationDelay: '0.1s' }}>
          {stats.map((stat, i) => (
            <div key={i} className={`p-6 md:p-8 rounded-[2.5rem] glass border ${stat.border} group hover:scale-[1.02] transition-all duration-500`}>
               <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                     <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className="text-[10px] font-black text-white/20 uppercase tracking-widest italic">Live_Feed</div>
               </div>
               <div className="text-4xl md:text-5xl font-black text-white italic tracking-tighter mb-1">{stat.value}</div>
               <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] italic">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main Controls */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-reveal" style={{ animationDelay: '0.2s' }}>
          {adminLinks.map((link, i) => (
            <Link key={i} href={link.href} className="group">
              <div className="h-full glass-card p-1 transition-transform group-hover:scale-[1.03] duration-500">
                <div className="p-8 lg:p-10 space-y-6 flex flex-col h-full">
                  <div className="flex items-center justify-between">
                     <div className={`p-4 rounded-2xl bg-${link.color}-500/10 border border-${link.color}-500/20 group-hover:bg-${link.color}-500/20 transition-colors`}>
                        <link.icon className={`w-8 h-8 text-${link.color}-400`} />
                     </div>
                     {link.stat && (
                        <Badge variant="outline" className={`border-${link.color}-500/20 text-${link.color}-400 italic font-black text-[10px] tracking-widest`}>
                           {link.stat}
                        </Badge>
                     )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-4">{link.label}</h3>
                    <p className="text-sm text-muted-foreground font-light leading-relaxed italic">{link.desc}</p>
                  </div>

                  <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-${link.color}-400 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-2`}>
                     Execute Control <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Settings Footer */}
        <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-8 p-8 md:p-12 rounded-[3.5rem] glass border border-white/5 animate-reveal" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                  <Settings className="w-8 h-8 text-white/50" />
               </div>
               <div>
                  <h4 className="text-xl font-black text-white italic uppercase tracking-tighter mb-1 italic">სისტემური პარამეტრები</h4>
                  <p className="text-xs text-secondary italic font-bold tracking-widest uppercase">Arena_Core_Settings_Lv3</p>
               </div>
            </div>
            <Button asChild variant="premium" className="h-16 px-10 rounded-[2rem] font-black uppercase tracking-widest italic">
               <Link href="/admin/settings">Config_Settings</Link>
            </Button>
        </div>
      </div>
    </div>
  )
}
