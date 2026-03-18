import { createClient } from "@/lib/supabase/server"
import { Ban, AlertTriangle, ShieldAlert } from "lucide-react"
import { UnbanTeamButton } from "@/components/unban-team-button"

export default async function BlockedPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  const { data: blockedTeams } = await supabase
    .from("teams")
    .select("*, profiles(username)")
    .eq("status", "blocked")
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen py-32 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-6xl relative">
        <div className="mb-20 text-center animate-reveal">
           <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] glass border border-red-500/20 mb-8">
            <Ban className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 text-white tracking-tighter italic uppercase">
            Unit <span className="text-red-500 tracking-normal">Termination</span>
          </h1>
          <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
            წესების დარღვევის გამო დაბლოკილი გუნდების სია
          </p>
        </div>

        <div className="glass-card p-8 lg:p-12 mb-12 animate-reveal border-red-500/20 bg-red-500/5 group shadow-[0_0_50px_rgba(239,68,68,0.05)]" style={{ animationDelay: '0.2s' }}>
           <div className="flex items-center gap-6 mb-8">
              <AlertTriangle className="w-10 h-10 text-red-500" />
              <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase whitespace-nowrap">Warning Protocol</h2>
              <div className="h-px w-full bg-red-500/10" />
           </div>
           
           <div className="grid md:grid-cols-2 gap-12 text-muted-foreground text-lg font-light leading-relaxed italic">
              <p>ეს გუნდები დაიბლოკა წესების დარღვევის გამო. დაბლოკილ გუნდებს არ შეუძლიათ სკრიმებში მონაწილეობა.</p>
              <div>
                <p className="mb-4">თუ თვლით, რომ შეცდომით მოხვდით ამ სიაში, გთხოვთ დაგვიკავშირდეთ კონტაქტის გვერდზე.</p>
                <div className="px-6 py-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-4">
                  <ShieldAlert className="w-6 h-6 text-red-400 mt-1 shrink-0" />
                  <div>
                    <h4 className="text-red-400 font-black text-sm uppercase tracking-widest mb-1">ბანის მოხსნა</h4>
                    <p className="text-white font-medium text-sm">ბანის მოსახსნელად საჭიროა <strong>10 ლარის</strong> გადახდა. გუნდის ლიდერს შეუძლია ბალანსიდან თანხის ჩამოჭრით ಗუნდის რეაბილიტაცია.</p>
                  </div>
                </div>
              </div>
           </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blockedTeams && blockedTeams.length > 0 ? (
            blockedTeams.map((team, i) => (
              <div
                key={team.id}
                className="glass-card p-1 group animate-reveal flex flex-col"
                style={{ animationDelay: `${i * 0.1 + 0.4}s` }}
              >
                 <div className="p-8 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-8">
                       <div>
                          <div className="flex items-center gap-2 mb-2">
                             <Ban className="w-5 h-5 text-red-500" />
                             <h3 className="text-2xl font-black text-white italic tracking-tight uppercase group-hover:text-red-500 transition-colors">{team.team_name}</h3>
                          </div>
                          <div className="text-muted-foreground text-xs font-mono tracking-widest uppercase">TAG: {team.team_tag}</div>
                       </div>
                       <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] font-black uppercase tracking-widest rounded-full">
                          Blacklisted
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 rounded-2xl glass border border-white/5 mt-auto">
                       <div className="w-8 h-8 rounded-full glass border border-white/10 flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4 text-white/30" />
                       </div>
                       <div>
                          <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Last Leader</div>
                          <div className="text-sm font-bold text-white tracking-tight">{team.profiles?.username}</div>
                       </div>
                    </div>

                    {user?.id === team.leader_id && (
                      <UnbanTeamButton teamId={team.id} />
                    )}
                 </div>
              </div>
            ))
          ) : (
            <div className="glass-card p-20 text-center border-dashed border-white/10 opacity-50 col-span-full">
               <Ban className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
               <p className="text-muted-foreground lowercase font-black tracking-widest">დაბლოკილი გუნდები არ არის</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

