"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Trophy, Users, Calendar, Shield, Zap, Target, Award, Crown, Gift, ChevronRight, ArrowRight } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function HomePage() {
  const [discordLink, setDiscordLink] = useState("https://discord.gg/your-invite-link")
  const [user, setUser] = useState<any>(null)
  const supabase = createBrowserClient()
  const router = useRouter()

  useEffect(() => {
    async function fetchDiscordLink() {
      try {
        const { data, error } = await supabase.from("site_settings").select("value").eq("key", "discord_invite_link").single()
        if (!error && data) {
          setDiscordLink(data.value)
        }
      } catch (err) {
        console.log("[v0] Failed to fetch discord link, using default")
      }
    }

    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    fetchDiscordLink()
    checkUser()
  }, [])

  const handleGetStarted = () => {
    if (user) {
      toast.info("თქვენ უკვე გაქვთ გავლილი რეგისტრაცია და იმყოფებით საკუთარ ანგარიშზე. თუ გსურს პრეკზე (Scrim) თამაში, გადადი განრიგში და მონახე შენთვის სასურველი პრეკი.", {
        duration: 5000,
        action: {
          label: "განრიგში გადასვლა",
          onClick: () => router.push("/schedule")
        },
      })
    } else {
      router.push("/auth/register")
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 px-4 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[10%] left-[5%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-float-subtle" />
          <div className="absolute bottom-[10%] right-[5%] w-[35%] h-[35%] bg-accent/10 rounded-full blur-[120px] animate-float-subtle" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
        </div>

        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-reveal">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 mb-8 animate-reveal" style={{ animationDelay: '0.1s' }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
              <span className="text-secondary text-xs font-bold uppercase tracking-widest">Live Scrims Now Available</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-glow underline-offset-8">
              <span className="text-white">PUBG</span>{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent italic">
                ARENA
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed font-light">
              გადადი შემდეგ დონეზე. შემოუერთდი საქართველოს ყველაზე ელიტურ PUBG პლატფორმას და იბრძოლე ჩემპიონობისთვის.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                onClick={handleGetStarted}
                className="btn-premium h-16 px-10 text-lg group"
              >
                დაიწყე ახლავე
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-16 px-10 text-lg rounded-full glass border-white/10 hover:bg-white/5 group"
              >
                <Link href="/teams" className="flex items-center gap-2 text-white">
                  ნახე გუნდები
                  <Users className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-white/5 relative bg-white/2">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "გუნდი", value: "500+", icon: Users, color: "text-blue-400" },
              { label: "მოთამაშე", value: "2000+", icon: Trophy, color: "text-amber-400" },
              { label: "ტურნირი", value: "100+", icon: Award, color: "text-purple-400" },
              { label: "აქტიური", value: "24/7", icon: Zap, color: "text-emerald-400" },
            ].map((stat, i) => (
              <div key={i} className="text-center group animate-reveal" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={`mb-4 mx-auto w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="text-4xl font-black text-white mb-2 tracking-tight group-hover:scale-110 transition-transform">{stat.value}</div>
                <div className="text-muted-foreground uppercase text-xs tracking-widest font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-4">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-20 animate-reveal">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
              რატომ ავირჩიოთ <span className="text-primary italic">ჩვენ?</span>
            </h2>
            <p className="text-lg text-muted-foreground font-light">
              ჩვენ ვქმნით გარემოს, სადაც თითოეული მოთამაშე გრძნობს თავს პროფესიონალად.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "ელიტური კონკურენცია",
                desc: "იბრძოლე საუკეთესო ქართული გუნდების წინააღმდეგ ყოველდღიურად.",
                icon: Target,
                delay: 0.1
              },
              {
                title: "ავტომატური სისტემა",
                desc: "მარტივი რეგისტრაცია და შედეგების მყისიერი ასახვა.",
                icon: Zap,
                delay: 0.2
              },
              {
                title: "სამართლიანი თამაში",
                desc: "მკაცრი ანტი-ჩით კონტროლი და გამოცდილი მოდერატორები.",
                icon: Shield,
                delay: 0.3
              }
            ].map((feat, i) => (
              <div key={i} className="glass-card p-8 group animate-reveal" style={{ animationDelay: `${feat.delay}s` }}>
                <div className="mb-6 w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/20 group-hover:rotate-12 transition-transform">
                  <feat.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 italic tracking-tight">{feat.title}</h3>
                <p className="text-muted-foreground leading-relaxed font-light">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community / Discord Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="relative overflow-hidden rounded-[2rem] glass p-12 md:p-20 text-center border-white/5">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent -z-10" />
            <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-accent/10 blur-[100px] -z-10" />
            
            <div className="max-w-2xl mx-auto animate-reveal">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#5865F2] mb-8 shadow-[0_0_40px_rgba(88,101,242,0.3)] hover:scale-110 transition-transform">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter italic">
                შემოუერთდი <br /> <span className="text-secondary tracking-normal">კომიუნითის</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-12 font-light leading-relaxed">
                ნუ გამოტოვებ სიახლეებს. მიიღე ინფორმაცია ტურნირებზე, შედეგებზე და ახალ შესაძლებლობებზე ჩვენს Discord სერვერზე.
              </p>
              <Button asChild className="h-16 px-12 text-lg rounded-full bg-white text-black hover:bg-white/90 active:scale-95 transition-all">
                <Link href={discordLink} target="_blank" className="flex items-center gap-3">
                  Discord-ზე გადასვლა
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Case Section */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="container mx-auto">
          <Card className="glass-card bg-mesh p-1 border-0 rounded-[2.5rem]">
            <CardContent className="p-12 md:p-24 relative overflow-hidden flex flex-col md:flex-row items-center gap-16">
              <div className="flex-1 animate-reveal">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 text-secondary text-[10px] font-bold uppercase tracking-widest mb-6 border border-secondary/20">
                  Limited Opportunity
                </div>
                <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter italic leading-none">
                  გახსენი <br />
                  <span className="text-glow text-secondary">MYSTERY CASE</span>
                </h2>
                <p className="text-lg text-muted-foreground mb-10 font-light max-w-lg leading-relaxed">
                  გამოსცადე იღბალი ყოველ 2 კვირაში ერთხელ. მოიგე VIP სტატუსები და გახდი ჩვენი პლატფორმის პრივილეგირებული წევრი.
                </p>
                <Button asChild className="h-16 px-12 text-lg rounded-full btn-premium border-glow italic group">
                  <Link href="/case-opening" className="flex items-center gap-3 lowercase font-black tracking-widest">
                    გახსენი case
                    <Gift className="w-5 h-5 group-hover:scale-125 transition-transform" />
                  </Link>
                </Button>
              </div>
              <div className="relative animate-float-subtle">
                <div className="w-64 h-64 md:w-80 md:h-80 rounded-[3rem] bg-gradient-to-br from-secondary/40 via-secondary/10 to-transparent border border-secondary/30 flex items-center justify-center p-4">
                  <div className="w-full h-full rounded-[2rem] glass flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.2)]">
                    <Gift className="w-32 h-32 text-secondary animate-pulse-soft" />
                  </div>
                </div>
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-[60px] rounded-full animate-orbit" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent/20 blur-[60px] rounded-full animate-orbit" style={{ animationDelay: '-3s' }} />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer (Simple Version for now) */}
      <footer className="py-20 border-t border-white/5 bg-black/40">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="text-3xl font-black text-white tracking-tighter">PUBG</span>
            <span className="text-3xl font-black text-primary italic">ARENA</span>
          </div>
          <p className="text-muted-foreground text-sm font-light mb-8 italic">
            &copy; {new Date().getFullYear()} PUBG Scrim Arena. All rights reserved. <br />
            Built for the Georgian Gaming Community.
          </p>
          <div className="flex justify-center gap-6">
             <Link href="/rules" className="text-xs text-muted-foreground hover:text-white transition-colors uppercase tracking-widest">Rules</Link>
             <Link href="/contact" className="text-xs text-muted-foreground hover:text-white transition-colors uppercase tracking-widest">Contact</Link>
             <Link href="/terms" className="text-xs text-muted-foreground hover:text-white transition-colors uppercase tracking-widest">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
