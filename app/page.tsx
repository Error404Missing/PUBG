"use client";

import { prisma } from "@/lib/prisma";
import { useEffect, useState } from "react";
import { Users, Trophy, Play, Search, Gamepad2, Info, ArrowRight } from "lucide-react";
import Link from "next/link";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { motion, Variants } from "framer-motion";
import UserNav from "@/components/UserNav";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const item: Variants = {
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
      <section className="relative pt-6">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

        {/* Top Bar inside Hero */}
        <div className="flex justify-between items-center mb-12 relative z-20 px-4">
          <div /> {/* Spacer */}
          <UserNav />
        </div>

        <div className="relative text-center space-y-8">
          <motion.div variants={item} className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
            <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
            <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em]">Platform Version 2.0 // Active</span>
          </motion.div>

          <motion.div variants={item} className="space-y-2 group">
            <h2 className="text-4xl font-black text-white/50 uppercase tracking-[0.5em] leading-none mb-[-0.5em] transition-all duration-1000 group-hover:tracking-[0.6em] group-hover:text-white/60">PREKEBI</h2>
            <h1 className="text-8xl md:text-9xl font-black text-white uppercase tracking-tighter leading-none drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              TACTICAL
            </h1>
          </motion.div>

          <motion.p variants={item} className="text-cyber-muted max-w-2xl mx-auto font-medium leading-relaxed uppercase tracking-wide">
            Elite PUBG Scrims პლატფორმა. შეუერთდი საუკეთესოებს, <br className="hidden md:block" /> დახვეწე შენი ტაქტიკა და მოიპოვე აღიარება.
          </motion.p>

          <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
            <Link href="/register" className="w-full sm:w-auto">
              <AnimatedButton className="w-full sm:w-auto min-w-[200px]">
                გუნდის რეგისტრაცია
              </AnimatedButton>
            </Link>
            <Link href="/schedule" className="w-full sm:w-auto">
              <button className="w-full px-12 py-3 bg-white/5 hover:bg-white/10 text-white font-black rounded-xl border border-white/10 transition-all uppercase tracking-widest backdrop-blur-sm">
                განრიგი
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section with Tactical Grid */}
      <section className="relative group">
        <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] -rotate-1 scale-[1.02] blur-xl opacity-0 group-hover:opacity-100 transition-all duration-1000" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-[2.5rem] overflow-hidden border border-white/5 relative z-10 backdrop-blur-md">
          {[
            { label: "აქტიური გუნდები", value: "120+", icon: Users },
            { label: "დღიური სკრიმები", value: "24", icon: Play },
            { label: "ჩატარებული მატჩები", value: "5000+", icon: Trophy },
            { label: "მომლოდინე რეგისტრაციები", value: "8", icon: Search },
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={item}
              className="bg-[#050505] p-8 md:p-12 text-center space-y-4 hover:bg-white/[0.02] transition-colors"
            >
              <stat.icon className="w-6 h-6 text-primary mx-auto opacity-50" />
              <div>
                <p className="text-[10px] font-black text-cyber-muted uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <h3 className="text-4xl font-black text-white tracking-tighter tabular-nums">
                  {stat.value}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-2 gap-8">
        {[
          {
            title: "Advanced Scrim System",
            desc: "ავტომატიზირებული სლოტების მინიჭება და რეიტინგის სისტემა.",
            icon: Gamepad2,
            color: "text-primary"
          },
          {
            title: "Fair Play Control",
            desc: "აქტიური ანტი-ჩეთ მონიტორინგი და მკაცრი ბანლისტის სისტემა.",
            icon: Search,
            color: "text-secondary"
          }
        ].map((feat, i) => (
          <motion.div
            key={i}
            variants={item}
            className="group relative p-10 bg-[#06070a] border border-white/5 rounded-[2rem] hover:border-primary/30 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 transition-transform group-hover:scale-125 duration-700">
              <feat.icon className="w-24 h-24" />
            </div>
            <div className="relative z-10 space-y-6">
              <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 ${feat.color}`}>
                <feat.icon className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">{feat.title}</h3>
                <p className="text-cyber-muted font-medium leading-relaxed">{feat.desc}</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-[0.3em] pt-4 group-hover:text-primary transition-colors">
                See More <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Footer System Status */}
      <footer className="pt-20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Server Status: Operational</span>
          </div>
          <div className="hidden md:block w-px h-4 bg-white/10" />
          <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Latency: 24ms</div>
        </div>
        <div className="flex items-center gap-8 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
          <Link href="/help" className="hover:text-primary transition-colors">Documentation</Link>
          <Link href="/contact" className="hover:text-primary transition-colors">Support Command</Link>
        </div>
      </footer>
    </motion.div>
  );
}
