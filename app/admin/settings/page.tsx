"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Settings, Save, Bell, Shield, Globe, Lock, Info } from "lucide-react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { useToast } from "@/components/providers/ToastProvider";

export default function AdminSettingsPage() {
    const { showToast } = useToast();
    const [config, setConfig] = useState<any>({
        siteName: "PREKEBI",
        registrationOpen: true,
        maintenanceMode: false,
        maxTeams: 100,
        roomPassword: "",
        discordUrl: ""
    });

    useEffect(() => {
        fetch('/api/admin/config').then(res => res.json()).then(setConfig);
    }, []);

    const handleSave = async () => {
        const res = await fetch('/api/admin/config', {
            method: 'POST',
            body: JSON.stringify(config)
        });
        if (res.ok) showToast("Settings updated successfully", "success");
    };

    return (
        <div className="space-y-8 pb-20">
            <PageHeader
                title="SYSTEM SETTINGS"
                subtitle="Global configuration for the platform status and rules."
            />

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#06070a] border border-white/5 rounded-[2.5rem] p-8 md:p-10 space-y-8 backdrop-blur-md">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <Globe className="w-4 h-4 text-primary" />
                                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Platform Info</h4>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2 text-primary">Site Name</label>
                                    <input
                                        type="text"
                                        value={config.siteName}
                                        onChange={e => setConfig({ ...config, siteName: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-5 text-sm outline-none focus:border-primary/50 transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2 text-primary">Discord URL</label>
                                    <input
                                        type="text"
                                        value={config.discordUrl}
                                        onChange={e => setConfig({ ...config, discordUrl: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-5 text-sm outline-none focus:border-primary/50 transition-all font-bold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <Lock className="w-4 h-4 text-rose-500" />
                                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Access Control</h4>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2 text-primary">Room Password</label>
                                    <input
                                        type="text"
                                        value={config.roomPassword}
                                        onChange={e => setConfig({ ...config, roomPassword: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-5 text-sm outline-none focus:border-primary/50 transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2 text-primary">Max Teams</label>
                                    <input
                                        type="number"
                                        value={config.maxTeams}
                                        onChange={e => setConfig({ ...config, maxTeams: parseInt(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-5 text-sm outline-none focus:border-primary/50 transition-all font-bold"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-10 border-t border-white/5 pt-10">
                            <AnimatedButton onClick={handleSave} className="w-full flex items-center justify-center gap-3 py-4">
                                <Save className="w-4 h-4" /> Save Configuration
                            </AnimatedButton>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-[#06070a] border border-white/5 rounded-[2rem] p-8 space-y-6">
                        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Bell className="w-3 h-3" /> System Toggles
                        </h4>

                        <div className="space-y-4">
                            {[
                                { label: "Registration", key: "registrationOpen", desc: "Allow new teams to sign up" },
                                { label: "Maintenance", key: "maintenanceMode", desc: "Lock site for maintenance" }
                            ].map(toggle => (
                                <div key={toggle.key} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div>
                                        <p className="text-sm font-bold text-white uppercase tracking-tight">{toggle.label}</p>
                                        <p className="text-[10px] font-medium text-white/30">{toggle.desc}</p>
                                    </div>
                                    <button
                                        onClick={() => setConfig({ ...config, [toggle.key]: !config[toggle.key] })}
                                        className={`w-12 h-6 rounded-full transition-all relative ${config[toggle.key] ? 'bg-primary' : 'bg-white/10'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${config[toggle.key] ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 bg-primary/5 border border-primary/10 rounded-[2rem] space-y-4">
                        <div className="flex items-center gap-3">
                            <Shield className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Admin Authorization</span>
                        </div>
                        <p className="text-xs font-medium text-white/50 leading-relaxed">
                            Changes made here will affect all users instantly. Please verify all values before saving.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
