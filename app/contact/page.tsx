"use client"

import { useEffect, useState } from "react"
import { Mail, MessageSquare, Clock, HelpCircle, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createBrowserClient } from "@/lib/supabase/client"

export default function ContactPage() {
  const [settings, setSettings] = useState({
    discordLink: "https://discord.gg/your-invite-link",
    email: "contact@pubgscrims.ge",
    discordUsername: "admin#1234",
  })
  const supabase = createBrowserClient()

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["discord_invite_link", "contact_email", "contact_discord"])

      if (data) {
        const settingsMap = data.reduce(
          (acc, item) => {
            if (item.key === "discord_invite_link") acc.discordLink = item.value
            if (item.key === "contact_email") acc.email = item.value
            if (item.key === "contact_discord") acc.discordUsername = item.value
            return acc
          },
          { discordLink: "", email: "", discordUsername: "" },
        )
        setSettings(settingsMap)
      }
    }
    fetchSettings()
  }, [])

  return (
    <div className="min-h-screen py-32 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-20 text-center animate-reveal">
           <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] glass border border-primary/20 mb-8">
            <MessageSquare className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 text-white tracking-tighter italic">
            დავითხოვოთ <span className="text-primary tracking-normal">კონტაქტი</span>
          </h1>
          <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
            დაგვიკავშირდით ნებისმიერი შეკითხვით
          </p>
        </div>

        <div className="glass-card p-8 lg:p-12 mb-12 animate-reveal" style={{ animationDelay: '0.2s' }}>
           <div className="flex flex-col lg:flex-row gap-12">
              <div className="flex-1">
                 <h2 className="text-3xl font-black text-white italic tracking-tighter mb-6 uppercase flex items-center gap-4">
                    <div className="w-2 h-10 bg-primary" />
                    Support
                 </h2>
                 <div className="space-y-6 text-muted-foreground text-lg font-light leading-relaxed">
                    <p>გვაქვს მზადყოფნა დაგეხმაროთ ნებისმიერ საკითხში დაკავშირებულ PUBG სკრიმებთან.</p>
                    <p>ჩვენი გუნდი პასუხობს თქვენს შეკითხვებს სამუშაო საათებში. გთხოვთ აღწეროთ თქვენი პრობლემა დეტალურად.</p>
                 </div>
              </div>
              <div className="flex flex-col gap-4 min-w-[300px]">
                 <div className="p-6 rounded-2xl glass border border-white/5 space-y-4">
                    <div className="flex items-center gap-3">
                       <Clock className="w-5 h-5 text-primary" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Response Time</span>
                    </div>
                    <div className="text-lg font-bold text-white tracking-tight italic">~ 2 Hours Avg.</div>
                 </div>
              </div>
           </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
           {[
             { 
               icon: Mail, 
               title: "ელ.ფოსტა", 
               value: settings.email, 
               label: "Official Protocol", 
               href: `mailto:${settings.email}`,
               btnText: "Send Mail"
             },
             { 
               icon: (props: any) => (
                 <svg {...props} fill="currentColor" viewBox="0 0 24 24">
                   <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                 </svg>
               ),
               title: "Discord", 
               value: settings.discordUsername, 
               label: "Fast Response", 
               href: settings.discordLink,
               btnText: "Join Server"
             },
           ].map((contact, i) => (
              <div key={i} className="glass-card p-1 group animate-reveal" style={{ animationDelay: `${i * 0.1 + 0.4}s` }}>
                 <div className="p-10 text-center">
                    <div className="w-20 h-20 rounded-[1.5rem] glass border border-white/5 flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:border-primary/50 transition-all duration-500">
                       <contact.icon className="w-10 h-10 text-primary" />
                    </div>
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">{contact.label}</div>
                    <h3 className="text-2xl font-black text-white italic tracking-tighter mb-4 uppercase">{contact.title}</h3>
                    <p className="text-muted-foreground font-light mb-10">{contact.value}</p>
                    <Button asChild variant="premium" className="w-full py-6 text-sm uppercase tracking-widest font-black">
                       <Link href={contact.href}>{contact.btnText}</Link>
                    </Button>
                 </div>
              </div>
           ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8 animate-reveal" style={{ animationDelay: '0.6s' }}>
           {[
             { icon: Clock, title: "Hours", content: "Mon-Fri: 10:00 - 20:00\nSat-Sun: 12:00 - 18:00" },
             { icon: HelpCircle, title: "F.A.Q", content: "რეგისტრაციის, გუნდების დადასტურების და სხვა საკითხებზე პასუხები იხილეთ დახმარების გვერდზე." },
             { icon: Shield, title: "Safety", content: "ტექნიკური პრობლემების შემთხვევაში, დაუყოვნებლივ დაგვიკავშირდით Discord-ის გზით." }
           ].map((item, i) => (
              <div key={i} className="glass-card p-8 group">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-xl glass border border-white/5 flex items-center justify-center group-hover:border-primary/30 transition-colors">
                       <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h4 className="text-xl font-black text-white italic tracking-tight uppercase">{item.title}</h4>
                 </div>
                 <p className="text-muted-foreground font-light text-sm leading-relaxed whitespace-pre-line">{item.content}</p>
              </div>
           ))}
        </div>
      </div>
    </div>
  )
}
