'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  Calendar,
  Trophy,
  Ban,
  Users,
  Crown,
  HelpCircle,
  Phone,
  Gamepad2,
  Gift,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: "მთავარი", href: "/", icon: Home },
    { name: "განრიგი", href: "/schedule", icon: Calendar },
    { name: "შედეგები", href: "/results", icon: Trophy },
    { name: "გუნდები", href: "/teams", icon: Users },
    { name: "ROOM INFO", href: "/room-info", icon: Gamepad2 },
    { name: "ქეისის გახსნა", href: "/case", icon: Gift },
    { name: "BANLIST", href: "/banlist", icon: Ban },
    { name: "VIP", href: "/vip", icon: Crown },
    { name: "დახმარება", href: "/help", icon: HelpCircle },
    { name: "კონტაქტი", href: "/contact", icon: Phone },
  ];

  return (
    <aside className="hidden lg:flex w-[280px] h-screen fixed left-0 top-0 bg-[#06070a]/80 backdrop-blur-2xl border-r border-white/5 flex-col z-50">
      {/* Logo Area */}
      <div className="p-8 flex items-center gap-4">
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-primary to-secondary rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500" />
          <div className="relative w-12 h-12 bg-black border border-white/10 rounded-xl flex items-center justify-center shadow-2xl">
            <Gamepad2 className="text-primary w-7 h-7" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-widest leading-none">PREKEBI</h1>
          <p className="text-[10px] text-secondary font-bold tracking-[0.3em] mt-1 uppercase">Tactical Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className="block group relative">
              <div className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 relative overflow-hidden",
                isActive
                  ? "bg-primary/10 text-white shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]"
                  : "text-cyber-muted hover:text-white hover:bg-white/5"
              )}>
                {/* Active Indicator Slide */}
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-secondary"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                <link.icon className={cn(
                  "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                  isActive ? "text-primary filter drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "text-cyber-muted"
                )} />
                <span className="font-bold tracking-wide text-sm uppercase">{link.name}</span>

                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer / System Status */}
      <div className="p-6 border-t border-white/5 space-y-4">
        <Link href="/admin">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors group cursor-pointer">
            <Settings className="w-4 h-4 text-primary group-hover:rotate-90 transition-transform duration-500" />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Admin Panel</span>
          </div>
        </Link>

        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-black/40 border border-white/5">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_10px_#10b981]" />
          <span className="text-[10px] font-mono text-cyber-muted uppercase tracking-tighter">
            Secure Node: iad-1b // Active
          </span>
        </div>
      </div>
    </aside>
  );
}
