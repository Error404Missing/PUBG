"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import { Check, X, Clock, User, Shield, Gift } from "lucide-react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

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

    if (loading) return <div className="text-center p-12 text-cyber-muted">იტვირთება...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase flex items-center gap-3">
                        <Gift className="text-primary w-8 h-8" />
                        პრიზების მართვა
                    </h1>
                    <p className="text-cyber-muted mt-2">ქეისებიდან ამოგდებული VIP სტატუსების დადასტურება</p>
                </div>
            </div>

            <div className="grid gap-4">
                {rewards.length === 0 ? (
                    <div className="p-12 text-center bg-black/20 border border-white/5 rounded-2xl text-cyber-muted">
                        მომლოდინე პრიზები არ მოიძებნა.
                    </div>
                ) : (
                    rewards.map((reward) => (
                        <div key={reward.id} className="bg-[#06070a] border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-white/20 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <User className="text-primary w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg">{reward.username}</h3>
                                    <div className="flex items-center gap-2 text-xs text-cyber-muted uppercase tracking-widest mt-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(reward.createdAt).toLocaleString('ka-GE')}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="px-4 py-2 rounded-lg bg-secondary/10 border border-secondary/20 text-secondary font-black text-sm uppercase">
                                    {reward.type.replace('_', ' ')}
                                </div>

                                <div className="flex items-center gap-2 border-l border-white/5 pl-4 ml-4">
                                    <button
                                        onClick={() => handleAction(reward.id, 'APPROVE')}
                                        className="p-3 rounded-xl bg-success/10 text-success hover:bg-success hover:text-black transition-all"
                                        title="დადასტურება"
                                    >
                                        <Check className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleAction(reward.id, 'REJECT')}
                                        className="p-3 rounded-xl bg-error/10 text-error hover:bg-error hover:text-black transition-all"
                                        title="უარყოფა"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
