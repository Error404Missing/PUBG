"use client";

import PageHeader from "@/components/PageHeader";
import { HelpCircle, Book, MessageSquare, Shield, Zap, Search } from "lucide-react";

export default function HelpPage() {
  const faqs = [
    { q: "როგორ დავარეგისტრირო გუნდი?", a: "გადადით რეგისტრაციის გვერდზე, შეავსეთ გუნდის სახელი, ტეგი და ატვირთეთ ლოგო. ადმინისტრაცია განიხილავს თქვენს მოთხოვნას 24 საათის განმავლობაში." },
    { q: "რა არის სლოტების წესი?", a: "სლოტები ნაწილდება რეგისტრაციის რიგითობის მიხედვით. VIP გუნდებს აქვთ პრიორიტეტი." },
    { q: "სად ვნახავ რუმის პაროლს?", a: "მატჩამდე 15 წუთით ადრე 'ROOM INFO' გვერდზე გამოჩნდება ID და პაროლი მხოლოდ ავტორიზებული გუნდებისთვის." },
    { q: "როგორ გავასაჩივრო ბანი?", a: "დაუკავშირდით ადმინისტრაციას 'CONTACT' გვერდის მეშვეობით ან მოგვწერეთ დისკორდზე." },
  ];

  return (
    <div className="space-y-12 pb-20">
      <PageHeader
        title="HELP CENTER"
        subtitle="ინსტრუქციები, ხშირად დასმული კითხვები და პლატფორმის გამოყენების წესები."
      />

      <div className="grid md:grid-cols-3 gap-8">
        {[
          { title: "Documentation", desc: "დეტალური სახელმძღვანელო გუნდის მართვისა და სკრიმების შესახებ.", icon: Book, color: "text-primary" },
          { title: "Community Support", desc: "შემოუერთდით ჩვენს დისკორდ სერვერს და მიიღეთ დახმარება სწრაფად.", icon: MessageSquare, color: "text-secondary" },
          { title: "Fair Play Rules", desc: "გაეცანით წესებს, რომელთა დაცვაც სავალდებულოა ყველა მოთამაშისთვის.", icon: Shield, color: "text-emerald-500" },
        ].map((card, i) => (
          <div key={i} className="group p-8 bg-[#06070a] border border-white/5 rounded-[2rem] hover:border-primary/30 transition-all duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-700">
              <card.icon className="w-16 h-16" />
            </div>
            <div className="relative z-10 space-y-4">
              <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">{card.title}</h3>
              <p className="text-sm font-medium text-white/40 leading-relaxed">{card.desc}</p>
              <button className="flex items-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] group-hover:text-primary transition-colors pt-2">
                Open Guide →
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black text-white uppercase tracking-tight">ხშირად დასმული კითხვები</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30" />
            <input type="text" placeholder="Search FAQ..." className="bg-white/5 border border-white/10 rounded-lg py-2 pl-8 pr-4 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-primary/50 transition-all" />
          </div>
        </div>

        <div className="grid gap-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:bg-white/[0.08] transition-all cursor-pointer group">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-4 h-4 text-primary" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors">{faq.q}</h4>
                  <p className="text-sm font-medium text-white/50 leading-relaxed">{faq.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-10 bg-primary/5 border border-primary/10 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <Zap className="w-32 h-32 text-primary" />
        </div>
        <div className="relative z-10 space-y-2">
          <h3 className="text-2xl font-black text-white uppercase tracking-tight">გაქვს სხვა კითხვები?</h3>
          <p className="text-sm font-medium text-primary/70">ჩვენი ტექნიკური გუნდი მზად არის დაგეხმაროთ ნებისმიერ დროს.</p>
        </div>
        <button className="relative z-10 px-10 py-4 bg-primary text-black font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all">
          Contact Support
        </button>
      </div>
    </div>
  );
}
