import { createClient } from "@/lib/supabase/server"
import { BookOpen, AlertCircle, ShieldAlert } from "lucide-react"

export default async function RulesPage() {
  const supabase = await createClient()
  const { data: rules } = await supabase.from("rules").select("*").order("order_number", { ascending: true })

  return (
    <div className="min-h-screen py-32 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-20 text-center animate-reveal">
           <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] glass border border-primary/20 mb-8">
            <BookOpen className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 text-white tracking-tighter italic">
            წესები და <span className="text-primary tracking-normal">რეგულაციები</span>
          </h1>
          <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
            გთხოვთ გაეცნოთ და დაიცვათ ყველა წესი
          </p>
        </div>

        <div className="grid gap-8 mb-20 animate-reveal" style={{ animationDelay: '0.2s' }}>
           <div className="glass-card p-8 lg:p-12 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                 <AlertCircle className="w-24 h-24 text-primary" />
              </div>
              <h2 className="text-3xl font-black text-white italic tracking-tighter mb-6 uppercase flex items-center gap-4">
                 <div className="w-2 h-10 bg-primary" />
                 Information
              </h2>
              <div className="space-y-6 max-w-2xl text-muted-foreground text-lg font-light leading-relaxed">
                 <p>ყველა მონაწილე ვალდებულია გაეცნოს და დაიცვას ქვემოთ მოცემული წესები. წესების დარღვევა გამოიწვევს შესაბამის სანქციებს.</p>
                 <p>წესები შეიძლება განახლდეს დროდადრო. გირჩევთ რეგულარულად შეამოწმოთ ეს გვერდი.</p>
              </div>
           </div>

           <div className="glass-card p-8 lg:p-12 border-red-500/20 bg-red-500/5 group shadow-[0_0_50px_rgba(239,68,68,0.05)]">
              <h2 className="text-2xl font-black text-red-500 italic tracking-tighter mb-8 uppercase flex items-center gap-4">
                 <ShieldAlert className="w-8 h-8" />
                 Sanctions
              </h2>
              <div className="grid sm:grid-cols-3 gap-6">
                 {[
                   { label: "FIRST", title: "გაფრთხილება", desc: "ქულების აღება", color: "bg-red-500/20" },
                   { label: "SECOND", title: "შეჩერება", desc: "1-2 სკრიმი", color: "bg-red-500/40" },
                   { label: "THIRD", title: "დაბლოკვა", desc: "სამუდამო ბანი", color: "bg-red-500/60" }
                 ].map((s, i) => (
                    <div key={i} className="p-6 rounded-2xl glass border border-red-500/10">
                       <div className={`text-[10px] font-black uppercase tracking-widest mb-1.5 opacity-50`}>{s.label} VIOLATION</div>
                       <div className="text-xl font-black text-white italic mb-1">{s.title}</div>
                       <div className="text-red-400 text-sm font-bold">{s.desc}</div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="space-y-12">
          {rules && rules.length > 0 ? (
            rules.map((rule, index) => (
              <div
                key={rule.id}
                className="animate-reveal"
                style={{ animationDelay: `${index * 0.1 + 0.4}s` }}
              >
                <div className="flex items-center gap-6 mb-6">
                   <div className="text-7xl font-black text-primary/10 italic leading-none">{index + 1}</div>
                   <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">{rule.title}</h2>
                </div>
                <div className="glass-card p-10 ml-4 lg:ml-12 border-l-4 border-l-primary">
                   <p className="text-muted-foreground text-lg font-light leading-relaxed">{rule.content}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-card p-20 text-center border-dashed border-white/10 opacity-50">
               <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
               <p className="text-muted-foreground lowercase font-black tracking-widest">წესები ჯერ არ არის დამატებული</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
