import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Zap, Shield, Crown, ArrowRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import Link from "next/link";

export default function VIPPage() {
  const benefits = [
    {
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      title: "PRIORITY ACCESS",
      description: "VIP გუნდები ავტომატურად იკავებენ სლოტებს სკრიმებზე, რიგის გარეშე.",
      glow: "shadow-[0_0_20px_rgba(245,158,11,0.1)]"
    },
    {
      icon: <Shield className="w-6 h-6 text-blue-500" />,
      title: "SECURE STATUS",
      description: "გარანტირებული ადგილი ტურნირებში და სპეციალურ ივენთებზე.",
      glow: "shadow-[0_0_20px_rgba(59,130,246,0.1)]"
    },
    {
      icon: <Crown className="w-6 h-6 text-emerald-500" />,
      title: "ELITE BADGING",
      description: "გუნდის გვერდზე და ცხრილებში გამოჩნდება VIP სტატუსის აღმნიშვნელი ნიშანი.",
      glow: "shadow-[0_0_20px_rgba(16,185,129,0.1)]"
    },
    {
      icon: <Star className="w-6 h-6 text-indigo-500" />,
      title: "ADVANCED DATA",
      description: "წვდომა დამატებით სტატისტიკურ მონაცემებზე და ანალიტიკაზე.",
      glow: "shadow-[0_0_20px_rgba(99,102,241,0.1)]"
    }
  ];

  return (
    <div className="space-y-12 pb-24">
      <PageHeader
        title="VIP MEMBERSHIP"
        description="მიიღეთ განსაკუთრებული პრივილეგიები და გააუმჯობესეთ თქვენი გუნდური გამოცდილება"
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {benefits.map((benefit, index) => (
          <Card key={index} className={`bg-[#06070a] border-white/5 rounded-3xl overflow-hidden hover:border-white/10 transition-all duration-500 group relative ${benefit.glow}`}>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/[0.03] rounded-2xl group-hover:scale-110 transition-transform duration-500 border border-white/5">
                  {benefit.icon}
                </div>
                <CardTitle className="text-xl font-black text-white uppercase tracking-tight">{benefit.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-cyber-muted text-sm font-medium leading-relaxed">{benefit.description}</p>

              <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-primary opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-[0.2em]">
                System Active <ArrowRight className="w-3 h-3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
        <div className="relative p-12 rounded-[2rem] bg-[#06070a] border border-white/5 text-center space-y-8 overflow-hidden">
          {/* Background design elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-secondary/10 rounded-full blur-[80px]" />

          <div className="space-y-4 relative z-10">
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">
              Ready to Go <span className="text-primary">Elite?</span>
            </h2>
            <p className="text-cyber-muted max-w-xl mx-auto font-medium">
              VIP სტატუსის მისაღებად დაუკავშირდით ადმინისტრაციას Discord-ზე ან საკონტაქტო ფორმის საშუალებით. გაააქტიურეთ თქვენი გუნდის პოტენციალი დღესვე.
            </p>
          </div>

          <div className="pt-4 relative z-10">
            <Link href="/contact">
              <AnimatedButton className="px-12">
                Contact Command
              </AnimatedButton>
            </Link>
          </div>

          <div className="pt-8 flex justify-center items-center gap-8 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
            <div className="text-[10px] font-black text-cyber-muted uppercase tracking-[0.3em]">Operational // Secure // Verified</div>
          </div>
        </div>
      </div>
    </div>
  );
}
