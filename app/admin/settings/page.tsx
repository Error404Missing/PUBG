'use client';

import { useState, useEffect } from "react";
import { Save, AlertTriangle, ShieldCheck, Globe, Share2, HelpCircle, UserX, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { useToast } from "@/components/providers/ToastProvider";

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();
    const [config, setConfig] = useState({
        registrationOpen: true,
        announcement: "",
        contact_discord: "",
        contact_facebook: "",
        contact_telegram: "",
        support_email: "",
        info_email: "",
        homepage_title: "",
        homepage_subtitle: "",
        homepage_marketing: "",
        help_rules: "",
        help_faq: ""
    });
    const [blockUserId, setBlockUserId] = useState("");
    const [blockDays, setBlockDays] = useState<number>(1);
    const [blockPermanent, setBlockPermanent] = useState(false);
    const [blockInfo, setBlockInfo] = useState<{ block_until?: string | null, create_block_until?: string | null } | null>(null);

    useEffect(() => {
        fetch('/api/admin/config')
            .then(res => res.json())
            .then(data => {
                if (data) setConfig(data);
            });
    }, []);

    async function saveConfig() {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });
            if (res.ok) showToast("პარამეტრები წარმატებით შენახულია", "success");
            else showToast("შეცდომა შენახვისას", "error");
        } catch (e) {
            showToast("სისტემური შეცდომა", "error");
        } finally {
            setLoading(false);
        }
    }

    async function fetchBlock() {
        if (!blockUserId) return;
        const res = await fetch(`/api/admin/blocks?userId=${encodeURIComponent(blockUserId)}`);
        if (res.ok) {
            const data = await res.json();
            setBlockInfo(data);
            showToast("მომხმარებლის სტატუსი განახლებულია", "info");
        }
    }

    async function applyBlock() {
        if (!blockUserId) return;
        setLoading(true);
        try {
            const res = await fetch('/api/admin/blocks', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: blockUserId, days: blockDays, permanent: blockPermanent }),
            });
            if (res.ok) {
                showToast("ბლოკი წარმატებით დაედო", "success");
                fetchBlock();
            } else {
                showToast("შეცდომა ბლოკირებისას", "error");
            }
        } finally {
            setLoading(false);
        }
    }

    async function clearBlock() {
        if (!blockUserId) return;
        setLoading(true);
        try {
            const res = await fetch('/api/admin/blocks', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: blockUserId }),
            });
            if (res.ok) {
                showToast("შეზღუდვები მოხსნილია", "success");
                fetchBlock();
            } else {
                showToast("შეცდომა მოხსნისას", "error");
            }
        } finally {
            setLoading(false);
        }
    }

    const inputClasses = "w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-primary/50 focus:outline-none transition-all duration-300 placeholder:text-white/20";
    const labelClasses = "flex items-center gap-2 text-[10px] font-black text-cyber-muted uppercase tracking-widest mb-2";

    return (
        <div className="space-y-8 pb-24">
            <PageHeader
                title="სისტემური პარამეტრები"
                description="პლატფორმის გლობალური კონფიგურაცია"
            />

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Registration & Announcement */}
                <div className="space-y-8">
                    <Card className="bg-[#06070a] border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                        <CardHeader className="bg-white/[0.02] border-b border-white/5">
                            <CardTitle className="text-white flex items-center gap-2 text-lg">
                                <ShieldCheck className="w-5 h-5 text-primary" />
                                რეგისტრაციის კონტროლი
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <button
                                    onClick={() => setConfig({ ...config, registrationOpen: !config.registrationOpen })}
                                    className={`w-full sm:w-auto px-6 py-3 rounded-xl font-black uppercase tracking-widest transition-all duration-500 shadow-lg ${config.registrationOpen
                                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30"
                                        }`}
                                >
                                    {config.registrationOpen ? "ACTIVE // OPEN" : "LOCKED // CLOSED"}
                                </button>
                                <div className="text-center sm:text-left">
                                    <p className="text-sm font-bold text-white uppercase tracking-tight">
                                        სტატუსი: {config.registrationOpen ? "ღიაა" : "დახურულია"}
                                    </p>
                                    <p className="text-[10px] text-cyber-muted uppercase tracking-widest mt-1">
                                        გავლენას ახდენს ყველა ახალ რეგისტრაციაზე
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#06070a] border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                        <CardHeader className="bg-white/[0.02] border-b border-white/5">
                            <CardTitle className="text-white flex items-center gap-2 text-lg">
                                <Info className="w-5 h-5 text-secondary" />
                                სისტემური შეტყობინება
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <textarea
                                value={config.announcement}
                                onChange={(e) => setConfig({ ...config, announcement: e.target.value })}
                                className={`${inputClasses} h-32 resize-none`}
                                placeholder="გამოჩნდება ყველა მომხმარებლისთვის..."
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Social Links */}
                <Card className="bg-[#06070a] border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                    <CardHeader className="bg-white/[0.02] border-b border-white/5">
                        <CardTitle className="text-white flex items-center gap-2 text-lg">
                            <Share2 className="w-5 h-5 text-primary" />
                            სოციალური ქსელები
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div>
                            <label className={labelClasses}>Discord URL</label>
                            <input
                                type="url"
                                value={config.contact_discord || ""}
                                onChange={e => setConfig({ ...config, contact_discord: e.target.value })}
                                className={inputClasses}
                                placeholder="https://discord.gg/..."
                            />
                        </div>
                        <div>
                            <label className={labelClasses}>Facebook Page</label>
                            <input
                                type="url"
                                value={config.contact_facebook || ""}
                                onChange={e => setConfig({ ...config, contact_facebook: e.target.value })}
                                className={inputClasses}
                                placeholder="https://facebook.com/..."
                            />
                        </div>
                        <div>
                            <label className={labelClasses}>Telegram Group</label>
                            <input
                                type="url"
                                value={config.contact_telegram || ""}
                                onChange={e => setConfig({ ...config, contact_telegram: e.target.value })}
                                className={inputClasses}
                                placeholder="https://t.me/..."
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Site Info */}
                <Card className="bg-[#06070a] border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                    <CardHeader className="bg-white/[0.02] border-b border-white/5">
                        <CardTitle className="text-white flex items-center gap-2 text-lg">
                            <Globe className="w-5 h-5 text-secondary" />
                            საიტის ინფორმაცია
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div>
                            <label className={labelClasses}>მთავარი სათაური</label>
                            <input
                                value={config.homepage_title || ""}
                                onChange={e => setConfig({ ...config, homepage_title: e.target.value })}
                                className={inputClasses}
                            />
                        </div>
                        <div>
                            <label className={labelClasses}>ქვესათაური</label>
                            <input
                                value={config.homepage_subtitle || ""}
                                onChange={e => setConfig({ ...config, homepage_subtitle: e.target.value })}
                                className={inputClasses}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClasses}>Support Email</label>
                                <input
                                    type="email"
                                    value={config.support_email || ""}
                                    onChange={e => setConfig({ ...config, support_email: e.target.value })}
                                    className={inputClasses}
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Info Email</label>
                                <input
                                    type="email"
                                    value={config.info_email || ""}
                                    onChange={e => setConfig({ ...config, info_email: e.target.value })}
                                    className={inputClasses}
                                />
                            </div>
                        </div>
                        <div>
                            <label className={labelClasses}>მარკეტინგული ტექსტი</label>
                            <textarea
                                value={config.homepage_marketing || ""}
                                onChange={e => setConfig({ ...config, homepage_marketing: e.target.value })}
                                className={`${inputClasses} h-24 resize-none`}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Help & FAQ */}
                <div className="space-y-8">
                    <Card className="bg-[#06070a] border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                        <CardHeader className="bg-white/[0.02] border-b border-white/5">
                            <CardTitle className="text-white flex items-center gap-2 text-lg">
                                <HelpCircle className="w-5 h-5 text-amber-500" />
                                წესები და FAQ
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div>
                                <label className={labelClasses}>სკრიმების წესები</label>
                                <textarea
                                    value={config.help_rules || ""}
                                    onChange={e => setConfig({ ...config, help_rules: e.target.value })}
                                    className={`${inputClasses} h-40 resize-none font-sans`}
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>ხშირად დასმული კითხვები</label>
                                <textarea
                                    value={config.help_faq || ""}
                                    onChange={e => setConfig({ ...config, help_faq: e.target.value })}
                                    className={`${inputClasses} h-40 resize-none font-sans`}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Block Management */}
            <Card className="bg-[#06070a] border-rose-500/10 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-rose-500/5">
                <CardHeader className="bg-rose-500/[0.03] border-b border-rose-500/10">
                    <CardTitle className="text-rose-400 flex items-center gap-2 text-lg">
                        <UserX className="w-5 h-5" />
                        მომხმარებლების დაბლოკვა
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-8 pb-8 space-y-8">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div>
                            <label className={labelClasses}>მომხმარებლის ID</label>
                            <input
                                value={blockUserId}
                                onChange={(e) => setBlockUserId(e.target.value)}
                                className={`${inputClasses} border-rose-500/10 focus:border-rose-500/50`}
                                placeholder="ID: xxxx-xxxx-xxxx"
                            />
                        </div>
                        <div>
                            <label className={labelClasses}>ბლოკის ხანგრძლივობა (დღე)</label>
                            <input
                                type="number"
                                value={blockDays}
                                onChange={(e) => setBlockDays(parseInt(e.target.value || '1', 10))}
                                className={`${inputClasses} border-rose-500/10 focus:border-rose-500/50`}
                            />
                        </div>
                        <div className="flex flex-col justify-end">
                            <label className="flex items-center gap-3 cursor-pointer group bg-rose-500/5 p-3 rounded-xl border border-rose-500/10 hover:bg-rose-500/10 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={blockPermanent || blockDays === 0}
                                    onChange={(e) => setBlockPermanent(e.target.checked)}
                                    className="w-5 h-5 rounded border-rose-500/50 text-rose-500 focus:ring-rose-500"
                                />
                                <span className="text-xs font-black text-rose-200 uppercase tracking-widest">Permanent Ban</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5">
                        <button
                            onClick={applyBlock}
                            disabled={loading}
                            className="bg-rose-500/20 text-rose-500 px-6 py-3 rounded-xl font-black uppercase tracking-widest border border-rose-500/20 hover:bg-rose-500/30 transition-all disabled:opacity-50"
                        >
                            დაბლოკვა
                        </button>
                        <button
                            onClick={clearBlock}
                            disabled={loading}
                            className="bg-emerald-500/20 text-emerald-500 px-6 py-3 rounded-xl font-black uppercase tracking-widest border border-emerald-500/20 hover:bg-emerald-500/30 transition-all disabled:opacity-50"
                        >
                            ბლოკის მოხსნა
                        </button>
                        <button
                            onClick={fetchBlock}
                            className="bg-white/5 text-cyber-muted px-6 py-3 rounded-xl font-black uppercase tracking-widest border border-white/5 hover:bg-white/10 transition-all"
                        >
                            სტატუსის ნახვა
                        </button>
                    </div>

                    {blockInfo && (
                        <div className="bg-black/80 rounded-2xl p-6 border border-white/5 italic">
                            <div className="grid sm:grid-cols-2 gap-8 text-xs font-mono tracking-wider">
                                <div>
                                    <span className="text-rose-400/60 block mb-1 uppercase">BANNED UNTIL:</span>
                                    <span className="text-white">{blockInfo.block_until || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-rose-400/60 block mb-1 uppercase">COOLDOWN UNTIL:</span>
                                    <span className="text-white">{blockInfo.create_block_until || '-'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Sticky Save Button Area */}
            <div className="fixed bottom-0 left-[280px] right-0 bg-black/60 backdrop-blur-xl border-t border-white/5 p-6 z-[60] flex justify-end">
                <AnimatedButton
                    onClick={saveConfig}
                    disabled={loading}
                    className="min-w-[200px]"
                >
                    {loading ? "PROCESSING..." : "SAVE CONFIGURATION"}
                </AnimatedButton>
            </div>
        </div>
    );
}
