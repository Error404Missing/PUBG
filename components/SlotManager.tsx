'use client';

import { useToast } from "@/components/providers/ToastProvider";
import { useEffect } from "react";

interface SlotManagerProps {
    scrim: any;
    teams: any[];
}

export default function SlotManager({ scrim, teams }: SlotManagerProps) {
    const router = useRouter();
    const [slots, setSlots] = useState<any[]>(scrim.slots);
    const [loading, setLoading] = useState<number | null>(null); // slot number being updated
    const [isClearing, setIsClearing] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Create array of 1 to maxTeams
    const allSlots = Array.from({ length: scrim.maxTeams }, (_, i) => i + 1);

    async function assignTeam(slotNumber: number, teamId: string) {
        if (!teamId) return;
        setLoading(slotNumber);
        try {
            const res = await fetch(`/api/admin/scrims/${scrim.id}/slots`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slotNumber, teamId }),
            });

            if (res.ok) {
                const newSlot = await res.json();
                const team = teams.find(t => t.id === teamId);
                const completeSlot = { ...newSlot, team };

                setSlots(prev => {
                    const filtered = prev.filter(s => s.slotNumber !== slotNumber && s.teamId !== teamId);
                    return [...filtered, completeSlot];
                });
                showToast(`სლოტი #${slotNumber} შევსებულია: ${team.name}`, "success");
            } else {
                const err = await res.json();
                showToast(err.message || "შეცდომა", "error");
            }
        } catch (e) {
            showToast("კავშირის შეცდომა", "error");
        } finally {
            setLoading(null);
        }
    }

    async function removeTeam(slotNumber: number) {
        if (!confirm("ნამდვილად გსურთ გუნდის ამოგდება?")) return;
        setLoading(slotNumber);
        try {
            const res = await fetch(`/api/admin/scrims/${scrim.id}/slots?slot=${slotNumber}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setSlots(prev => prev.filter(s => s.slotNumber !== slotNumber));
                showToast(`გუნდი ამოგდებულია #${slotNumber} სლოტიდან`, "info");
            }
        } catch (e) {
            showToast("შეცდომა", "error");
        } finally {
            setLoading(null);
        }
    }

    async function clearAll() {
        if (!confirm("ყურადღება! ნამდვილად გსურთ ყველა სლოტის გასუფთავება?")) return;
        setIsClearing(true);
        try {
            await fetch(`/api/admin/scrims/${scrim.id}/slots`, { method: 'DELETE' });
            setSlots([]);
            showToast("ყველა სლოტი გასუფთავებულია", "success");
        } catch (e) {
            showToast("შეცდომა", "error");
        } finally {
            setIsClearing(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-neutral-900/50 p-6 rounded-xl border border-white/5 backdrop-blur-sm">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Users className="text-amber-500" />
                        სლოტების მართვა
                    </h1>
                    <p className="text-gray-400 mt-1">
                        {mounted ? new Date(scrim.startTime).toLocaleString('ka-GE') : 'Loading...'} | {scrim.map}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-neutral-800 rounded-lg border border-neutral-700">
                        <span className="text-gray-400 text-sm">შევსებული:</span>
                        <span className="ml-2 text-xl font-bold text-amber-500">{slots.length}</span>
                        <span className="text-gray-500">/{scrim.maxTeams}</span>
                    </div>

                    <button
                        onClick={clearAll}
                        disabled={isClearing || slots.length === 0}
                        className="px-4 py-2 bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-red-900/50 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Trash2 className="w-4 h-4" />
                        გასუფთავება
                    </button>

                    <button
                        onClick={() => router.push('/admin/scrims')}
                        className="px-4 py-2 bg-neutral-800 text-gray-300 hover:bg-neutral-700 rounded-lg transition-colors"
                    >
                        უკან
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {allSlots.map((slotNum) => {
                    const slot = slots.find(s => s.slotNumber === slotNum);
                    const isUpdating = loading === slotNum;

                    return (
                        <motion.div
                            key={slotNum}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: slotNum * 0.01 }}
                            className={cn(
                                "relative group rounded-xl border p-4 transition-all duration-300",
                                slot
                                    ? "bg-neutral-900/80 border-amber-500/20 hover:border-amber-500/50 shadow-lg shadow-amber-900/5"
                                    : "bg-neutral-900/30 border-white/5 border-dashed hover:border-white/20 hover:bg-neutral-900/50"
                            )}
                        >
                            <div className="absolute top-2 left-3 text-xs font-mono font-bold text-gray-600 group-hover:text-amber-500/50 transition-colors">
                                #{slotNum.toString().padStart(2, '0')}
                            </div>

                            {slot ? (
                                <div className="flex flex-col items-center gap-3 mt-2">
                                    <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden border border-neutral-700">
                                        {slot.team.logo ? (
                                            <img src={slot.team.logo} alt={slot.team.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Users className="w-6 h-6 text-gray-600" />
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <h3 className="font-bold text-white truncate max-w-[150px]" title={slot.team.name}>
                                            {slot.team.name}
                                        </h3>
                                        <p className="text-xs text-amber-500 font-mono">{slot.team.tag}</p>
                                    </div>

                                    <button
                                        onClick={() => removeTeam(slotNum)}
                                        disabled={isUpdating}
                                        className="absolute top-2 right-2 p-1.5 text-red-500/50 hover:text-red-400 hover:bg-red-900/20 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                        title="ამოგდება"
                                    >
                                        {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full min-h-[100px] gap-2">
                                    {isUpdating ? (
                                        <RefreshCw className="w-6 h-6 text-amber-500 animate-spin" />
                                    ) : (
                                        <select
                                            className="w-full bg-transparent text-sm text-gray-400 text-center focus:outline-none cursor-pointer appearance-none hover:text-white transition-colors"
                                            onChange={(e) => assignTeam(slotNum, e.target.value)}
                                            value=""
                                        >
                                            <option value="" disabled>გუნდის დამატება +</option>
                                            {teams
                                                .filter(t => !slots.find(s => s.teamId === t.id)) // Filter out already assigned teams
                                                .map(t => (
                                                    <option key={t.id} value={t.id}>
                                                        {t.name} [{t.tag}]
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
