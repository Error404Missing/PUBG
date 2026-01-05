"use client";

import { prisma } from "@/lib/prisma";
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Users, Shield, Star, Search, Filter } from "lucide-react";

interface Team {
  id: string;
  name: string;
  tag: string;
  logo: string | null;
  status: string;
  members: any[];
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/teams')
      .then(res => res.json())
      .then(data => {
        setTeams(data.filter((t: any) => t.status === 'APPROVED'));
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title="გუნდები"
        subtitle="აღმოაჩინე და დაუკავშირდი პლატფორმის საუკეთესო გუნდებს."
      />

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search teams..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-primary/50 transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-white/5 animate-pulse rounded-[2rem] border border-white/5" />
          ))
        ) : (
          teams.map((team) => (
            <div key={team.id} className="group relative bg-white/5 border border-white/5 rounded-[2rem] p-8 hover:border-primary/30 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                <Users className="w-20 h-20 text-primary" />
              </div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 overflow-hidden">
                    {team.logo ? (
                      <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                    ) : (
                      <Shield className="w-8 h-8 text-primary/50" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">{team.name}</h3>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">[{team.tag}]</span>
                  </div>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Members</p>
                    <p className="text-sm font-bold text-white">{team.members?.length || 0} / 6</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Rating</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <p className="text-sm font-bold text-white">0.0</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
