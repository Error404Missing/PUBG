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
  Gamepad2
} from "lucide-react";
import { cn } from "@/lib/utils";

// Static stats for client component (passed as props or fetched via API in real app)
// For now, we will simplify the sidebar to be a pure navigation component
// Stats should be in the dashboard or a separate header component

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: "მთავარი", href: "/", icon: Home },
    { name: "განრიგი", href: "/schedule", icon: Calendar },
    { name: "შედეგები", href: "/results", icon: Trophy },
    { name: "გუნდები", href: "/teams", icon: Users },
    { name: "Room Info", href: "/room-info", icon: Users },
    { name: "დაბლოკილი", href: "/banlist", icon: Ban },
    { name: "VIP", href: "/vip", icon: Crown },
    { name: "დახმარება", href: "/help", icon: HelpCircle },
    { name: "კონტაქტი", href: "/contact", icon: Phone },
  ];

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-[#0f1014]/95 backdrop-blur-xl border-r border-white/5 flex flex-col z-50">
      {/* Logo Area */}
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Gamepad2 className="text-black w-6 h-6" />
        </div>
        <div>
            <h1 className="text-xl font-black text-white tracking-wider">PUBG</h1>
            <p className="text-xs text-amber-500 font-bold tracking-[0.2em]">SCRIMS</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="relative block group"
            >
              <div className={cn(
                "relative flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300",
                isActive 
                  ? "text-white" 
                  : "text-gray-500 hover:text-white"
              )}>
                {/* Active Background */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-white/5 rounded-xl border border-white/10"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Icon */}
                <link.icon className={cn(
                  "w-5 h-5 relative z-10 transition-colors duration-300",
                  isActive ? "text-amber-500" : "group-hover:text-amber-500"
                )} />

                {/* Text */}
                <span className="relative z-10 font-medium tracking-wide text-sm">
                  {link.name}
                </span>

                {/* Active Indicator Line */}
                {isActive && (
                    <motion.div 
                        layoutId="active-indicator"
                        className="absolute right-3 w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                    />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-white/5">
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-xl p-4 border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors" />
            <p className="text-xs text-gray-400 relative z-10">
                პრობლემის შემთხვევაში მოგვწერეთ
            </p>
            <Link href="/contact" className="mt-2 block text-xs font-bold text-amber-500 relative z-10 hover:underline">
                მხარდაჭერა &rarr;
            </Link>
        </div>
        <p className="text-[10px] text-center text-gray-700 mt-4 uppercase tracking-widest">
            © 2025 Prekebi
        </p>
      </div>
    </aside>
  );
}
