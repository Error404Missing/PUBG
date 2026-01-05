import PageHeader from "@/components/PageHeader";
import { Crown, Zap, Shield, Star, CheckCircle2, ArrowRight } from "lucide-react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

export default function VIPPage() {
  const benefits = [
    { title: "Priority Slotting", desc: "გარანტირებული ადგილი ნებისმიერ სკრიმზე რიგის გარეშე.", icon: Zap },
    { title: "Exclusive Badge", desc: "უნიკალური VIP სიმბოლო თქვენი გუნდის პროფილზე.", icon: Crown },
    { title: "Advanced Stats", desc: "დეტალური ანალიტიკა და გუნდის ეფექტურობის რეპორტები.", icon: Shield },
    { title: "Custom Channels", desc: "წვდომა VIP დისკორდ ჩატებსა და პირობით ოთახებზე.", icon: Star },
  ];

  return (
    <div className="space-y-12 pb-20">
      <PageHeader
        title="VIP BENEFITS"
        subtitle="აიყვანეთ თქვენი გუნდის გამოცდილება შემდეგ დონეზე პრემიუმ შესაძლებლობებით."
      />

      <div className="relative group p-1 bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30 rounded-[3rem] overflow-hidden">
        <div className="absolute inset-0 bg-primary/20 blur-[100px] animate-pulse pointer-events-none" />

        <div className="relative bg-[#06070a] border border-white/10 rounded-[2.9rem] p-10 md:p-16 flex flex-col md:flex-row items-center gap-12 overflow-hidden">
          <div className="flex-1 space-y-8 relative z-10">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
              <Crown className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Premium Access</span>
            </div>

            <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
              LEVEL UP YOUR <span className="text-primary">SQUAD</span>
            </h2>

            <p className="text-lg font-medium text-white/60 leading-relaxed max-w-xl">
              VIP სტატუსი გაძლევთ საშუალებას იყოთ ყოველთვის ბრძოლის ეპიცენტრში და ისარგებლოთ ექსკლუზიური ფუნქციებით.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <AnimatedButton className="px-12">Upgrade Now</AnimatedButton>
              <button className="flex items-center justify-center gap-3 px-10 py-4 bg-white/5 hover:bg-white/10 text-white font-black rounded-xl border border-white/10 transition-all uppercase tracking-widest">
                Learn More <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-[500px] relative z-10">
            {benefits.map((box, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 hover:border-primary/50 transition-all group">
                <box.icon className="w-8 h-8 text-primary/50 group-hover:text-primary transition-colors" />
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-tight">{box.title}</h4>
                  <p className="text-[10px] font-medium text-white/40 leading-relaxed mt-1">{box.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="grid md:grid-cols-3 gap-8">
        {[
          { name: "TACTICAL", price: "FREE", color: "text-white/40", perks: ["Standard Slots", "Global Ranking", "Public Stats"] },
          { name: "ELITE", price: "₾29/MO", color: "text-primary", perks: ["Priority Slots", "Elite Badge", "Detailed Stats", "No Ads"] },
          { name: "FOUNDER", price: "₾49/MO", color: "text-secondary", perks: ["Instant Slots", "Founder Badge", "Custom Hosting", "Priority Support"] },
        ].map((plan, i) => (
          <div key={i} className={`p-10 bg-[#06070a] border border-white/5 rounded-[2.5rem] space-y-8 flex flex-col ${i === 1 ? 'ring-2 ring-primary relative' : ''}`}>
            {i === 1 && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary px-4 py-1 rounded-full text-[10px] font-black text-black uppercase tracking-widest">
                Most Popular
              </div>
            )}
            <div className="space-y-2">
              <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] ${plan.color}`}>{plan.name} PACK</h4>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white tracking-tighter">{plan.price}</span>
              </div>
            </div>

            <div className="space-y-4 flex-1">
              {plan.perks.map((perk, j) => (
                <div key={j} className="flex items-center gap-3">
                  <CheckCircle2 className={`w-4 h-4 ${i === 2 ? 'text-secondary' : i === 1 ? 'text-primary' : 'text-white/20'}`} />
                  <span className="text-xs font-medium text-white/60">{perk}</span>
                </div>
              ))}
            </div>

            <button className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${i === 1 ? 'bg-primary text-black hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
              }`}>
              Select {plan.name}
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
