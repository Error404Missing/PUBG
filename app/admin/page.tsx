"use client";

import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Users, Shield, Trophy, Activity, ArrowRight, Settings, Gift } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
    const { isAdmin } = useUser();
    const [stats, setStats] = useState({ users: 0, teams: 0, scrims: 0 });

    useEffect(() => {
        fetch('/api/admin/stats')
            .then(res => res.json())
            .then(setStats);
    }, []);

    return (
        <div className="space-y-8 pb-20">
            <PageHeader
                title="ADMIN PANEL"
                subtitle="სისტემის მართვა, მომხმარებლების მონიტორინგი და სტატისტიკური ანალიზი."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Total Users", value: stats.users, icon: Users, color: "text-primary" },
                    { label: "Active Teams", value: stats.teams, icon: Shield, color: "text-secondary" },
                    { label: "Total Scrims", value: stats.scrims, icon: Trophy, color: "text-emerald-500" },
                ].map((stat, i) => (
                    <div key={stat.label} className="bg-white/5 border border-white/5 rounded-[2rem] p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                            <stat.icon className="w-20 h-20" />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            <div>
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                                <h3 className="text-4xl font-black text-white tracking-tighter">{stat.value}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                {[
                    { title: "Manage Teams", desc: "გუნდების დადასტურება და მართვა.", href: "/admin/teams", icon: Shield },
                    { title: "User Management", desc: "მომხმარებლების როლების მართვა.", href: "/admin/users", icon: Users },
                    { title: "Scrim Control", desc: "თამაშების და სლოტების მართვა.", href: "/admin/scrims", icon: Activity },
                    { title: "System Settings", desc: "პლატფორმის გლობალური პარამეტრები.", href: "/admin/settings", icon: Settings },
                    { title: "Case Rewards", desc: "Case-ების და მოგებების მართვა.", href: "/admin/rewards", icon: Gift },
                ].map((action, i) => (
                    <Link href={action.href} key={i}>
                        <div className="group bg-[#06070a] border border-white/5 rounded-[2rem] p-8 hover:border-primary/30 transition-all duration-300">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-primary/10 transition-colors">
                                    <action.icon className="w-6 h-6 text-white/40 group-hover:text-primary transition-colors" />
                                </div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">{action.title}</h3>
                            </div>
                            <p className="text-sm font-medium text-white/40 leading-relaxed group-hover:text-white/60 transition-colors">{action.desc}</p>
                            <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] pt-6 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                                Open Module <ArrowRight className="w-3 h-3" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
