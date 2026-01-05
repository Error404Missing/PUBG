"use client";

import PageHeader from "@/components/PageHeader";
import { Mail, MessageSquare, Send, Globe, MapPin, Phone } from "lucide-react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

export default function ContactPage() {
  return (
    <div className="space-y-12 pb-20">
      <PageHeader
        title="CONTACT"
        subtitle="დაუკავშირდით ადმინისტრაციას ნებისმიერი კითხვის ან წინადადების შემთხვევაში."
      />

      <div className="grid lg:grid-cols-5 gap-12">
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-[#06070a] border border-white/5 rounded-[2.5rem] p-10 space-y-8 relative overflow-hidden backdrop-blur-md">
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Name</label>
                  <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-sm text-white focus:border-primary/50 outline-none transition-all" placeholder="Enter your name" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Email</label>
                  <input type="email" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-sm text-white focus:border-primary/50 outline-none transition-all" placeholder="Enter your email" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Subject</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-sm text-white focus:border-primary/50 outline-none transition-all appearance-none cursor-pointer">
                  <option className="bg-[#06070a]">General Inquiry</option>
                  <option className="bg-[#06070a]">Technical Support</option>
                  <option className="bg-[#06070a]">Partnership</option>
                  <option className="bg-[#06070a]">Report a Problem</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Message</label>
                <textarea rows={5} className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-sm text-white focus:border-primary/50 outline-none transition-all resize-none" placeholder="Your message..."></textarea>
              </div>
            </div>

            <AnimatedButton className="w-full py-5 flex items-center justify-center gap-3">
              <Send className="w-4 h-4" /> Send Message
            </AnimatedButton>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {[
            { title: "Direct Email", value: "support@prekebi.ge", icon: Mail, color: "text-primary" },
            { title: "Discord Hub", value: "discord.gg/prekebi", icon: MessageSquare, color: "text-[#5865F2]" },
            { title: "Operational Hours", value: "24/7 Monitoring", icon: Globe, color: "text-emerald-500" },
          ].map((item, i) => (
            <div key={i} className="bg-white/5 border border-white/5 rounded-3xl p-8 hover:bg-white/[0.08] transition-all group">
              <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all ${item.color}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">{item.title}</p>
                  <p className="text-lg font-black text-white uppercase tracking-tight">{item.value}</p>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-8 space-y-4">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Tactical Support</h4>
            <p className="text-sm font-medium text-white/60 leading-relaxed">
              თქვენი შეტყობინებები განიხილება პრიორიტეტულ რეჟიმში. პასუხის საშუალო დრო შეადგენს 2 საათს.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">System Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
