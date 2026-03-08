import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Calendar, KeyRound, Lock, Map as MapIcon } from "lucide-react"

export default async function RoomInfoPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: teamData } = await supabase
    .from("teams")
    .select("id, status")
    .eq("leader_id", user.id)
    .eq("status", "approved")
    .single()

  if (!teamData) {
    redirect("/")
  }

  // Fetch room info from settings
  const { data: settingsData } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", ["room_id", "room_password", "start_time", "map"])

  const roomInfo = {
    room_id: settingsData?.find((s) => s.key === "room_id")?.value || "",
    room_password: settingsData?.find((s) => s.key === "room_password")?.value || "",
    start_time: settingsData?.find((s) => s.key === "start_time")?.value || "",
    map: settingsData?.find((s) => s.key === "map")?.value || "",
  }

  return (
    <div className="min-h-screen py-32 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-4xl relative">
        <div className="mb-20 text-center animate-reveal">
           <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] glass border border-primary/20 mb-8">
            <Lock className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 text-white tracking-tighter italic uppercase">
            Room <span className="text-primary tracking-normal">Intel</span>
          </h1>
          <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
            თამაშის დეტალები და შესვლის მონაცემები
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
           {[
             { 
               icon: KeyRound, 
               title: "Room ID", 
               value: roomInfo.room_id, 
               color: "text-blue-400",
               label: "Deployment ID"
             },
             { 
               icon: Lock, 
               title: "Password", 
               value: roomInfo.room_password, 
               color: "text-purple-400",
               label: "Secure Key"
             },
             { 
               icon: MapIcon, 
               title: "Map", 
               value: roomInfo.map, 
               color: "text-green-400",
               label: "Operations Area"
             },
             { 
               icon: Calendar, 
               title: "Start Time", 
               value: roomInfo.start_time ? new Date(roomInfo.start_time).toLocaleString("ka-GE", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }) : "", 
               color: "text-orange-400",
               label: "T-Minus"
             }
           ].map((item, i) => (
              <div key={i} className="glass-card p-1 group animate-reveal" style={{ animationDelay: `${i * 0.1}s` }}>
                 <div className="p-10">
                    <div className="flex items-center justify-between mb-8">
                       <div className="w-12 h-12 rounded-2xl glass border border-white/5 flex items-center justify-center group-hover:border-white/20 transition-colors">
                          <item.icon className={`w-6 h-6 ${item.color}`} />
                       </div>
                       <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.label}</div>
                    </div>
                    <div className="text-sm font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">{item.title}</div>
                    {item.value ? (
                       <div className="text-3xl font-black text-white italic tracking-tighter break-all">{item.value}</div>
                    ) : (
                       <div className="text-xl font-bold text-white/20 italic">Not Assigned</div>
                    )}
                 </div>
              </div>
           ))}
        </div>

        <div className="glass-card p-8 lg:p-12 animate-reveal border-orange-500/20 bg-orange-500/5 group shadow-[0_0_50px_rgba(249,115,22,0.05)]" style={{ animationDelay: "0.4s" }}>
           <h2 className="text-2xl font-black text-orange-500 italic tracking-tighter mb-8 uppercase flex items-center gap-4">
              <span className="text-3xl">⚠️</span>
              Tactical Briefing
           </h2>
           <div className="grid sm:grid-cols-2 gap-6 text-muted-foreground font-light text-sm leading-relaxed">
              <div className="space-y-4">
                 <p className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    Room ID და პაროლი გამოიყენეთ თამაშში შესასვლელად
                 </p>
                 <p className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    დაიწყეთ შესვლა მითითებულ დროზე 5 წუთით ადრე
                 </p>
              </div>
              <div className="space-y-4">
                 <p className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    არ გაუზიაროთ ეს ინფორმაცია სხვა გუნდებს
                 </p>
                 <p className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    კითხვების შემთხვევაში დაუკავშირდით ადმინისტრაციას
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
