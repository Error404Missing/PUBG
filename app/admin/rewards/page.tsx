"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Gift, Trophy, User, Check, X, Clock, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

interface GameReward {
    id: string;
    userId: string;
    rewardType: string;
    rewardValue: string;
    status: string;
    createdAt: string;
    user: {
        username: string;
        email: string;
    };
}

export default function AdminRewardsPage() {
    const { showToast } = useToast();
    const [rewards, setRewards] = useState<GameReward[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/rewards').then(res => res.json()).then(data => {
            setRewards(data);
            setLoading(false);
        });
    }, []);

    const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
        const res = await fetch(`/api/admin/rewards/${id}`, {
            method: 'POST',
            body: JSON.stringify({ action })
        });
        if (res.ok) {
            showToast(`Reward ${action.toLowerCase()}d`, "success");
            setRewards(rewards.filter(r => r.id !== id));
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <PageHeader
                title="REWARD APPROVALS"
                subtitle="Manage pending case rewards and prize claims from users."
            />

            <div className="bg-[#06070a]/50 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">User</th>
                                <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Reward</th>
                                <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Date</th>
                                <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="inline-flex items-center gap-3 text-white/20 animate-pulse">
                                            <Clock className="w-5 h-5 animate-spin" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Loading Rewards...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : rewards.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="inline-flex flex-col items-center gap-4 text-white/10">
                                            <AlertTriangle className="w-12 h-12" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">No Pending Rewards</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                rewards.map((reward) => (
                                    <tr key={reward.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                                    <User className="w-4 h-4 text-white/40" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-white uppercase tracking-tight">{reward.user.username}</p>
                                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{reward.user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <Gift className="w-4 h-4 text-primary" />
                                                <span className="text-sm font-black text-white tracking-widest uppercase">{reward.rewardValue}</span>
                                                <span className="text-[10px] font-bold text-white/30 uppercase">({reward.rewardType})</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-white/30">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(reward.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleAction(reward.id, 'APPROVE')} className="w-10 h-10 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-black rounded-xl border border-emerald-500/20 transition-all flex items-center justify-center">
                                                    <Check className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleAction(reward.id, 'REJECT')} className="w-10 h-10 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-black rounded-xl border border-rose-500/20 transition-all flex items-center justify-center">
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
