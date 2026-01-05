"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Calendar,
  Trophy,
  Users,
  Info,
  Package,
  ShieldAlert,
  Crown,
  HelpCircle,
  MessageSquare,
  LayoutDashboard,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

const mainNav: NavItem[] = [
  { name: "მთავარი", href: "/", icon: Home },
  { name: "განრიგი", href: "/schedule", icon: Calendar },
  { name: "შედეგები", href: "/results", icon: Trophy },
  { name: "გუნდები", href: "/teams", icon: Users },
  { name: "Room Info", href: "/room-info", icon: Info },
  { name: "ქეისის გახსნა", href: "/case-open", icon: Package },
  { name: "Banlist", href: "/banlist", icon: ShieldAlert },
  { name: "VIP", href: "/vip", icon: Crown },
];

const supportNav: NavItem[] = [
  { name: "დახმარება", href: "/help", icon: HelpCircle },
  { name: "კონტაქტი", href: "/contact", icon: MessageSquare },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'FOUNDER';

  return (
    <aside className="fixed left-0 top-0 h-screen w-[280px] bg-cyber-card border-r border-white/5 flex flex-col z-[100] hidden lg:flex shadow-[20px_0_40px_rgba(0,0,0,0.4)]">
      {/* Brand */}
      <div className="p-8 pb-12">
        <Link href="/" className="flex items-center gap-4 group">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center border-2 border-primary/20 shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-transform group-hover:scale-110">
            <Trophy className="text-black w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-widest leading-none">PREKEBI</h1>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-1">Tactical Portal</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 overflow-y-auto space-y-10 scrollbar-hide">
        {/* Main Menu */}
        <div className="space-y-2">
          <p className="px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">Tactical Menu</p>
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden",
                pathname === item.href
                  ? "bg-primary/10 text-primary border border-primary/10 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                  : "text-white/40 hover:text-white hover:bg-white/[0.02] border border-transparent"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", pathname === item.href ? "text-primary" : "text-white/20 group-hover:text-white/60")} />
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">{item.name}</span>
              {pathname === item.href && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary rounded-l-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              )}
            </Link>
          ))}
        </div>

        {/* Support */}
        <div className="space-y-2">
          <p className="px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">Support Hub</p>
          {supportNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300",
                pathname === item.href
                  ? "bg-primary/10 text-primary border border-primary/10"
                  : "text-white/40 hover:text-white hover:bg-white/[0.02] border border-transparent"
              )}
            >
              <item.icon className={cn("w-5 h-5", pathname === item.href ? "text-primary" : "text-white/20 group-hover:text-white/60")} />
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Admin Footer */}
      <div className="p-4 pt-8">
        {isAdmin && (
          <Link href="/admin" className="group flex items-center gap-4 px-4 py-4 bg-white/5 border border-white/5 rounded-[1.5rem] hover:border-primary/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-primary/10 transition-colors">
              <LayoutDashboard className="w-5 h-5 text-white/20 group-hover:text-primary transition-colors" />
            </div>
            <div>
              <p className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Admin Panel</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest leading-none">Secure Mode</span>
              </div>
            </div>
          </Link>
        )}
      </div>
    </aside>
  );
}
