import PageHeader from "@/components/PageHeader";
import { Calendar, Clock, Map, Target, Users, ArrowRight } from "lucide-react";

export default function SchedulePage() {
  const sessions = [
    { time: "18:00", name: "Alpha Scrims", map: "Erangel", mode: "Squad TPP", slots: "12/20" },
    { time: "20:00", name: "Bravo Scrims", map: "Miramar", mode: "Squad TPP", slots: "18/20" },
    { time: "22:00", name: "Charlie Scrims", map: "Sanhok", mode: "Squad FPP", slots: "5/20" },
    { time: "00:00", name: "Midnight Scrims", map: "Erangel", mode: "Squad TPP", slots: "0/20" },
  ];

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title="SCHEDULE"
        subtitle="ყოველდღიური სკრიმების განრიგი და თავისუფალი სლოტების მონიტორინგი."
      />

      <div className="space-y-4">
        {sessions.map((session, i) => (
          <div key={i} className="group relative bg-[#06070a] border border-white/5 rounded-[2rem] p-6 hover:border-primary/30 transition-all duration-500 overflow-hidden flex flex-col md:flex-row items-center gap-8">
            <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-2xl border border-white/5 min-w-[120px] group-hover:bg-primary/10 transition-colors">
              <Clock className="w-5 h-5 text-primary mb-2" />
              <span className="text-2xl font-black text-white">{session.time}</span>
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">GMT+4</span>
            </div>

            <div className="flex-1 space-y-4 text-center md:text-left">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">{session.name}</h3>
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{session.mode}</p>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                <div className="flex items-center gap-2 text-white/60">
                  <Map className="w-4 h-4 text-white/20" />
                  <span className="text-xs font-bold uppercase tracking-wide">{session.map}</span>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <Users className="w-4 h-4 text-white/20" />
                  <span className="text-xs font-bold uppercase tracking-wide">{session.slots} SLOTS</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-500">
                  <Target className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">REGISTRATION OPEN</span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto">
              <button className="w-full md:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-black rounded-xl border border-white/10 transition-all uppercase tracking-widest flex items-center justify-center gap-3 group-hover:bg-primary group-hover:text-black group-hover:border-primary">
                Book Slot <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
