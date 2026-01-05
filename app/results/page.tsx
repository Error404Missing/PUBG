"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Trophy, Calendar, Map, Hash, ArrowRight } from "lucide-react";

interface Result {
  id: string;
  gameNumber: number;
  map: string;
  screenshot: string;
  createdAt: string;
}

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/results')
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title="შედეგები"
        subtitle="გაეცანით დასრულებული მატჩების სტატისტიკას და ოფიციალურ შედეგებს."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-white/5 animate-pulse rounded-[2rem] border border-white/5" />
          ))
        ) : (
          results.map((result) => (
            <div key={result.id} className="group bg-[#06070a] border border-white/5 rounded-[2rem] overflow-hidden hover:border-primary/30 transition-all duration-500">
              <div className="aspect-video relative overflow-hidden">
                <img src={result.screenshot} alt="Match result" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06070a] to-transparent" />
                <div className="absolute top-4 right-4 px-3 py-1 bg-primary text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                  MATCH COMPLETED
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-primary" />
                    <span className="text-sm font-black text-white uppercase tracking-tight">Game #{result.gameNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/40">
                    <Calendar className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(result.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <div className="flex-1 bg-white/5 rounded-xl p-3 border border-white/5">
                    <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Tactical Map</p>
                    <div className="flex items-center gap-2">
                      <Map className="w-3 h-3 text-primary/60" />
                      <span className="text-sm font-bold text-white uppercase tracking-tight">{result.map}</span>
                    </div>
                  </div>
                  <button className="w-12 h-12 bg-primary/10 hover:bg-primary/20 rounded-xl flex items-center justify-center text-primary transition-all border border-primary/20">
                    <ArrowRight className="w-5 h-5" />
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
