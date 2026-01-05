"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import { Check, X, Clock, User, Gift, ArrowRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";

interface CaseReward {
    id: string;
    userId: string;
    username: string;
    type: string;
    status: string;
    createdAt: string;
}

export default function AdminRewardsPage() {
    const [rewards, setRewards] = useState<CaseReward[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        fetchRewards();
    }, []);

    const fetchRewards = async () => {
        try {
            const res = await fetch('/api/admin/rewards');
            const data = await res.json();
            setRewards(data);
        } catch (e) {
            showToast("მონაცემების ჩატვირთვა ვერ მოხერხდა", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
        try {
            const res = await fetch('/api/admin/rewards', {
                method: 'PATCH',
                body: JSON.stringify({ id, action }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                showToast(action === 'APPROVE' ? "დადასტურებულია" : "უარყოფილია", "success");
                fetchRewards();
            } else {
                showToast("ოპერაცია ვერ შესრულდა", "error");
            }
        } catch (e) {
            showToast("კავშირის შეცდომა", "error");
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-cyber-muted font-black uppercase tracking-[0.2em] animate-pulse">Initializing Reward Matrix...</p>
        </div>
    );

    return (
        <div className="space-y-12 pb-20">
            <PageHeader
                title="REWARD COMMAND"
                description="ქეისებიდან ამოგდებული VIP სტატუსების მართვა"
            />

            <div className="grid gap-6">
                {rewards.length === 0 ? (
                    <div className="p-20 text-center bg-[#06070a] border border-white/5 rounded-3xl text-cyber-muted italic shadow-2xl">
                        მომლოდინე პრიზები არ მოიძებნა.
                    </div>
                ) : (
                    rewards.map((reward) => (
                        <div key={reward.id} className="bg-[#06070a] border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary/30 transition-all duration-500 shadow-xl group relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />

                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-500">
                                    <User className="text-primary w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-white font-black text-xl uppercase tracking-tight flex items-center gap-2">
                                        {reward.username}
                                        <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </h3>
                                    <div className="flex items-center gap-3 text-[10px] text-cyber-muted font-bold uppercase tracking-widest mt-1">
                                        <Clock className="w-3 h-3 text-secondary" />
                                        {new Date(reward.createdAt).toLocaleString('ka-GE')}
                                        <span className="text-white/10">|</span>
                                        <span className="text-primary/60">ID: {reward.id.split('-')[0]}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="px-6 py-2 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary font-black text-xs uppercase tracking-widest shadow-inner">
                                    {reward.type.replace('_', ' ')}
                                </div>

                                <div className="flex items-center gap-3 border-l border-white/5 pl-6">
                                    <button
                                        onClick={() => handleAction(reward.id, 'APPROVE')}
                                        className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all flex items-center justify-center border border-emerald-500/20 shadow-lg"
                                        title="დადასტურება"
                                    >
                                        <Check className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={() => handleAction(reward.id, 'REJECT')}
                                        className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-black transition-all flex items-center justify-center border border-rose-500/20 shadow-lg"
                                        title="უარყოფა"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Decorative background element */}
                            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-125 transition-transform duration-1000">
                                <Gift className="w-24 h-24" />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
