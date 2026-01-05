"use client";

import { motion } from "framer-motion";
import {
  Shield,
  Target,
  Zap,
  Trophy,
  ArrowRight,
  ChevronRight,
  Activity,
  Users,
  Calendar
} from "lucide-react";
import Link from "next/link";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

export default function HomePage() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-24 pb-20"
    >
      {/* Hero Section */}
      <section className="relative pt-12">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative text-center space-y-8">
          <motion.div variants={item} className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#3b82f6]" />
            <span className="text-[10px] font-bold text-cyber-muted uppercase tracking-[0.2em]">Platform Version 2.0 // Active</span>
          </motion.div>

          <motion.h1
            variants={item}
            className="text-7xl md:text-9xl font-black text-white tracking-tighter uppercase leading-[0.8] mb-4"
          >
            Tactical <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary animate-gradient">Superiority</span>
          </motion.h1>

          <motion.p variants={item} className="text-cyber-muted text-xl max-w-2xl mx-auto font-medium leading-relaxed">
            Elite PUBG Scrims პლატფორმა. შეუერთდი საუკეთესოებს, დახვეწე შენი ტაქტიკა და მოიპოვე აღიარება.
          </motion.p>

          <motion.div variants={item} className="flex flex-wrap justify-center gap-6 pt-8">
            <Link href="/teams/register">
              <AnimatedButton className="h-16 px-10 text-lg group">
                გუნდის რეგისტრაცია
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </AnimatedButton>
            </Link>
            <Link href="/schedule">
              <button className="h-16 px-10 text-lg font-bold text-white border border-white/10 rounded-xl hover:bg-white/5 transition-all">
                განრიგი
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Grid */}
      <motion.section variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "აქტიური გუნდები", value: "120+", icon: Users, color: "text-primary" },
          { label: "დღიური სკრიმები", value: "24", icon: Activity, color: "text-secondary" },
          { label: "ჩატარებული მატჩები", value: "5000+", icon: Trophy, color: "text-amber-500" },
          { label: "მომლოდინე რეგისტრაციები", value: "8", icon: Calendar, color: "text-cyan-500" },
        ].map((stat, i) => (
          <div key={i} className="group p-8 rounded-3xl bg-[#06070a] border border-white/5 relative overflow-hidden transition-all duration-300 hover:border-white/20">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
              <stat.icon className="w-16 h-16" />
            </div>
            <p className="text-cyber-muted text-xs font-bold uppercase tracking-widest mb-2">{stat.label}</p>
            <h3 className={`text-4xl font-black text-white ${stat.color}`}>{stat.value}</h3>
          </div>
        ))}
      </motion.section>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Registrations */}
        <motion.div variants={item} className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <span className="w-2 h-6 bg-primary rounded-sm" />
              მიმდინარე რეგისტრაციები
            </h2>
            <Link href="/schedule" className="text-primary text-xs font-bold uppercase tracking-widest hover:underline flex items-center gap-1">
              ყველას ნახვა <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {[1, 2].map((_, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[#06070a] border border-white/5 flex items-center justify-between group hover:border-primary/30 transition-all duration-500">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-xl bg-white/5 flex flex-col items-center justify-center border border-white/5 font-black uppercase text-xs">
                    <span className="text-primary text-xl">20:00</span>
                    <span className="text-[8px] text-cyber-muted">Today</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg uppercase mb-1">Elite Day Scrims</h3>
                    <div className="flex gap-4 text-xs text-cyber-muted font-medium">
                      <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Erangel</span>
                      <span className="flex items-center gap-1"><Target className="w-3 h-3" /> 16 Slots</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-cyber-muted font-bold uppercase mb-1">რეგისტრირებულია</p>
                    <p className="text-white font-black">12 / 16</p>
                  </div>
                  <button className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tactical Updates / VIP Info */}
        <motion.div variants={item} className="space-y-6">
          <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3 px-2">
            <span className="w-2 h-6 bg-secondary rounded-sm" />
            ტაქტიკური სტატუსი
          </h2>

          <div className="rounded-3xl bg-gradient-to-b from-primary/20 to-transparent p-1 border border-primary/20">
            <div className="bg-[#06070a] rounded-[22px] p-8 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="text-primary animate-pulse" />
                <h3 className="text-white font-bold uppercase tracking-wider">VIP პრივილეგიები</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "გარანტირებული სლოტი",
                  "ავტომატური დადასტურება",
                  "ექსკლუზიური ტურნირები",
                  "ქეისის გახსნის შანსი"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-cyber-muted font-medium">
                    <CheckIcon className="w-4 h-4 text-success" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/vip" className="block">
                <button className="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold uppercase tracking-widest text-xs hover:bg-primary hover:text-black hover:border-primary transition-all duration-300">
                  გაიგე მეტი
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function CheckIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
