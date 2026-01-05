"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Gift, Loader2, Sparkles, AlertTriangle, ShieldCheck } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import { useSession } from "next-auth/react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

interface RewardItem {
    id: string;
    name: string;
    type: 'VIP_3' | 'VIP_7' | 'VIP_30' | 'NOTHING';
    color: string;
    rarity: string;
}

const ITEMS: RewardItem[] = [
    { id: '1', name: '3 დღიანი VIP', type: 'VIP_3', color: 'from-blue-500 to-cyan-500', rarity: 'Common' },
    { id: '2', name: 'არაფერი', type: 'NOTHING', color: 'from-gray-500 to-gray-700', rarity: 'Trash' },
    { id: '3', name: '7 დღიანი VIP', type: 'VIP_7', color: 'from-purple-500 to-pink-500', rarity: 'Rare' },
    { id: '4', name: 'არაფერი', type: 'NOTHING', color: 'from-gray-500 to-gray-700', rarity: 'Trash' },
    { id: '5', name: '30 დღიანი VIP', type: 'VIP_30', color: 'from-amber-400 to-orange-600', rarity: 'Legendary' },
    { id: '6', name: 'არაფერი', type: 'NOTHING', color: 'from-gray-500 to-gray-700', rarity: 'Trash' },
];

export default function CaseOpenPage() {
    const { showToast } = useToast();
    const { data: session } = useSession();

    const [isSpinning, setIsSpinning] = useState(false);
    const [cooldown, setCooldown] = useState<string | null>(null);
    const [items, setItems] = useState<RewardItem[]>([]);
    const [result, setResult] = useState<RewardItem | null>(null);
    const [pendingReward, setPendingReward] = useState(false);

    const carouselControls = useAnimation();
    const carouselRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Duplicate items to create a long strip
        const longStrip = Array.from({ length: 10 }, () => [...ITEMS]).flat();
        setItems(longStrip.map((item, idx) => ({ ...item, id: `${item.id}-${idx}` })));
        checkStatus();
    }, []);

    const checkStatus = async () => {
        try {
            const res = await fetch('/api/case/status');
            const data = await res.json();
            if (data.cooldown) setCooldown(data.cooldown);
            if (data.pending) setPendingReward(true);
        } catch (e) {
            console.error(e);
        }
    };

    const handleOpen = async () => {
        if (isSpinning || cooldown || pendingReward) return;

        setIsSpinning(true);
        try {
            const res = await fetch('/api/case/open', { method: 'POST' });
            const data = await res.json();

            if (!res.ok) {
                showToast(data.message || "შეცდომა", "error");
                setIsSpinning(false);
                return;
            }

            // ანიმაციის ლოგიკა
            const winIndex = items.findIndex(item => item.id.startsWith(data.rewardId) && parseInt(item.id.split('-')[1]) > 40);
            const itemWidth = 220; // 200px width + 20px gap
            const offset = winIndex * itemWidth - (carouselRef.current?.offsetWidth || 0) / 2 + itemWidth / 2;

            // Randomize position within the winning item
            const randomOffset = Math.random() * 100 - 50;

            await carouselControls.start({
                x: -(offset + randomOffset),
                transition: {
                    duration: 8,
                    ease: [0.12, 0, 0.15, 1], // Custom slow-down ease
                }
            });

            setResult(ITEMS.find(i => i.type === data.type) || null);
            if (data.type !== 'NOTHING') {
                setPendingReward(true);
                showToast("გილოცავთ! თქვენი მოთხოვნა გაიგზავნა ადმინისტრაციასთან დასადასტურებლად.", "success");
            } else {
                showToast("ამჯერად არ გაგიმართლათ.", "info");
            }

            checkStatus();
        } catch (err) {
            showToast("კავშირის შეცდომა", "error");
        } finally {
            setIsSpinning(false);
        }
    };

    return (
        <div className="space-y-12 pb-20">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-3xl bg-[#06070a] border border-white/5 p-12 text-center">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
                <Gift className="w-16 h-16 text-primary mx-auto mb-6 filter drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-4">ტაქტიკური ქეისი</h1>
                <p className="text-cyber-muted text-lg max-w-2xl mx-auto mb-8 font-medium">
                    გახსენით ქეისი 2 კვირაში ერთხელ და მოიგეთ VIP სტატუსი თქვენი გუნდისათვის.
                </p>

                {cooldown && !pendingReward && (
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold uppercase tracking-widest text-sm mb-4">
                        <AlertTriangle className="w-4 h-4" />
                        შემდეგი გახსნა ჩაირთვება: {cooldown}
                    </div>
                )}

                {pendingReward && (
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 font-bold uppercase tracking-widest text-sm mb-4">
                        <ShieldCheck className="w-4 h-4" />
                        თქვენი პრიზი გადაგზავნილია ადმინისტრაციასთან დასადასტურებლად.
                    </div>
                )}
            </div>

            {/* CS:GO Carousel Container */}
            <div className="relative py-12 bg-black/40 border-y border-white/5 overflow-hidden rounded-xl">
                {/* Selector Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-primary z-20 shadow-[0_0_20px_#3b82f6] -translate-x-1/2">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary border-4 border-black" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 rounded-full bg-primary border-4 border-black" />
                </div>

                {/* Carousel */}
                <div ref={carouselRef} className="flex gap-5 px-[50%]">
                    <motion.div
                        animate={carouselControls}
                        className="flex gap-5"
                    >
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="w-[200px] h-[250px] flex-shrink-0 bg-[#06070a] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-between text-center group relative overflow-hidden transition-all duration-300 hover:border-white/20"
                            >
                                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.color}`} />
                                <div className="w-24 h-24 rounded-2xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                                    <Gift className="w-12 h-12 text-white/20 group-hover:text-white/40" />
                                </div>
                                <div>
                                    <h3 className="text-white font-black uppercase text-sm mb-1">{item.name}</h3>
                                    <p className="text-[10px] text-cyber-muted font-bold tracking-[0.2em] uppercase">{item.rarity}</p>
                                </div>
                                <div className={`w-full h-12 rounded-lg bg-gradient-to-r ${item.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-center flex-col items-center gap-6">
                <AnimatedButton
                    onClick={handleOpen}
                    disabled={isSpinning || !!cooldown || pendingReward}
                    className="h-20 w-80 text-xl"
                >
                    {isSpinning ? (
                        <div className="flex items-center gap-3">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            გახსნა...
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-6 h-6" />
                            ქეისის გახსნა
                        </div>
                    )}
                </AnimatedButton>
                <p className="text-cyber-muted font-medium text-sm animate-pulse">
                    SYSTEM READY // SECURE ENCRYPTION ACTIVE
                </p>
            </div>

            {/* Result Display */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="max-w-md mx-auto p-12 rounded-3xl bg-[#06070a] border border-white/5 text-center relative"
                    >
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 p-4 rounded-2xl bg-primary shadow-2xl shadow-primary/40 text-black">
                            <ShieldCheck className="w-12 h-12" />
                        </div>
                        <h2 className="text-3xl font-black text-white uppercase mb-4 mt-4">თქვენ ამოგივიდათ</h2>
                        <div className={`text-4xl font-black bg-gradient-to-r ${result.color} bg-clip-text text-transparent mb-6`}>
                            {result.name}
                        </div>
                        {result.type !== 'NOTHING' ? (
                            <p className="text-cyber-muted font-medium mb-8">
                                გილოცავთ! თქვენი პრიზი აქტივირდება ადმინისტრაციის მიერ დადასტურებისთანავე.
                            </p>
                        ) : (
                            <p className="text-cyber-muted font-medium mb-8">
                                სამწუხაროდ, ამჯერად ვერაფერი მოიგეთ. სცადეთ 2 კვირის შემდეგ.
                            </p>
                        )}
                        <button
                            onClick={() => setResult(null)}
                            className="text-white hover:text-primary font-bold uppercase tracking-widest text-sm transition-colors"
                        >
                            დახურვა
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
