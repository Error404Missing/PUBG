import { createClient } from "@/lib/supabase/server"
import { Trophy } from "lucide-react"
import Image from "next/image"

export default async function ResultsPage() {
  const supabase = await createClient()
  const { data: results } = await supabase.from("results").select("*").order("created_at", { ascending: false })

  return (
    <div className="min-h-screen py-32 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-20 text-center animate-reveal">
           <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] glass border border-primary/20 mb-8">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 text-white tracking-tighter italic">
            SCRIM <span className="text-primary tracking-normal">შედეგები</span>
          </h1>
          <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
            ტურნირების შედეგები და გამარჯვებული გუნდები
          </p>
        </div>

        <div className="grid gap-12">
          {results && results.length > 0 ? (
            results.map((result, i) => (
              <div
                key={result.id}
                className="glass-card overflow-hidden group animate-reveal"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="p-8 lg:p-12">
                  <div className="flex flex-col lg:flex-row gap-12">
                     <div className="flex-1 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                           Official Result
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black text-white italic tracking-tight group-hover:text-primary transition-colors">
                          {result.title}
                        </h2>
                        {result.description && (
                          <p className="text-muted-foreground text-lg font-light leading-relaxed max-w-xl">
                            {result.description}
                          </p>
                        )}
                        <div className="pt-8 flex items-center gap-6">
                           <div className="flex -space-x-3">
                              {[...Array(3)].map((_, i) => (
                                <div key={i} className="w-12 h-12 rounded-full border-4 border-background glass" />
                              ))}
                           </div>
                           <div>
                              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Top Performers</div>
                              <div className="text-sm font-bold text-white">MVP, Sniper, Rusher</div>
                           </div>
                        </div>
                     </div>

                     {result.image_url && (
                        <div className="lg:w-1/2">
                          <div className="relative aspect-video rounded-3xl overflow-hidden glass border border-white/10 group-hover:border-primary/30 transition-colors">
                            <Image
                              src={result.image_url || "/placeholder.svg"}
                              alt={result.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <div className="absolute bottom-6 right-6 px-4 py-2 rounded-xl glass border border-white/20 backdrop-blur-xl">
                               <div className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-0.5">Winner</div>
                               <div className="text-lg font-black text-secondary italic tracking-tighter">TEAM ALPHA</div>
                            </div>
                          </div>
                        </div>
                     )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-card p-20 text-center border-dashed border-white/10 opacity-50">
               <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
               <p className="text-muted-foreground lowercase font-black tracking-widest">შედეგები ჯერ არ არის გამოქვეყნებული</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
