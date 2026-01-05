import { prisma } from "@/lib/prisma";
import { Users, ShieldAlert, CheckCircle, Activity, LayoutDashboard } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

async function getAdminStats() {
    const totalTeams = await prisma.team.count();
    const pendingTeams = await prisma.team.count({ where: { status: "PENDING" } });
    const blockedTeams = await prisma.team.count({ where: { status: "BLOCKED" } });
    const totalUsers = await prisma.user.count();

    return { totalTeams, pendingTeams, blockedTeams, totalUsers };
}

export default async function AdminDashboard() {
    const stats = await getAdminStats();

    const statCards = [
        { label: "სულ გუნდები", value: stats.totalTeams, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "დასადასტურებელი", value: stats.pendingTeams, icon: CheckCircle, color: "text-amber-500", bg: "bg-amber-500/10" },
        { label: "დაბლოკილი", value: stats.blockedTeams, icon: ShieldAlert, color: "text-rose-500", bg: "bg-rose-500/10" },
        { label: "მომხმარებლები", value: stats.totalUsers, icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    ];

    return (
        <div className="space-y-12 pb-20">
            <PageHeader
                title="ADMIN COMMAND"
                description="სისტემის გლობალური მონიტორინგი და მართვა"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, i) => (
                    <Card key={i} className="bg-[#06070a] border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-300 group">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-[10px] font-black text-cyber-muted uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                                    <h3 className="text-4xl font-black text-white tracking-tighter tabular-nums">
                                        {stat.value}
                                    </h3>
                                </div>
                                <div className={`p-3 ${stat.bg} rounded-xl group-hover:scale-110 transition-transform duration-500`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2">
                                <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className={`h-full ${stat.bg.replace('/10', '/50')} w-2/3`} />
                                </div>
                                <span className="text-[8px] font-bold text-cyber-muted tracking-widest uppercase">Operational</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-4 px-2">
                        <div className="p-2 bg-secondary/10 rounded-lg">
                            <LayoutDashboard className="w-5 h-5 text-secondary" />
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">ბოლო აქტივობა</h2>
                    </div>

                    <div className="bg-[#06070a] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 transition-transform group-hover:rotate-0 duration-1000">
                            <Activity className="w-32 h-32" />
                        </div>
                        <p className="text-cyber-muted font-medium italic relative z-10">
                            დამატებითი სტატისტიკური მონაცემები და ლოგები მუშავდება...
                            იხილეთ მენიუს შესაბამისი განყოფილებები დეტალური მართვისთვის.
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-4 px-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <ShieldAlert className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">სისტემის სტატუსი</h2>
                    </div>

                    <div className="bg-[#06070a] border border-white/5 rounded-2xl p-6 space-y-6">
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-xs font-bold text-cyber-muted uppercase tracking-widest">Database</span>
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-tighter px-2 py-1 bg-emerald-500/10 rounded-lg">CONNECTED</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-xs font-bold text-cyber-muted uppercase tracking-widest">Authentication</span>
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-tighter px-2 py-1 bg-emerald-500/10 rounded-lg">ENABLED</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-xs font-bold text-cyber-muted uppercase tracking-widest">Case Logic</span>
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-tighter px-2 py-1 bg-emerald-500/10 rounded-lg">SYNCED</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
