import PageHeader from "@/components/PageHeader";
import { Info, Key, MapPin, Users, Globe, ShieldCheck } from "lucide-react";

export default function RoomInfoPage() {
  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title="ROOM INFO"
        subtitle="ინფორმაცია თამაშის ოთახის, პაროლისა და რეგისტრაციის წესების შესახებ."
      />

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-[#06070a] border border-white/5 rounded-[2rem] p-8 space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
              <Key className="w-20 h-20 text-primary" />
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Key className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Access Control</h3>
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Room ID & Password</p>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Room ID</span>
                <span className="text-lg font-black text-white tracking-widest">--- ---</span>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Password</span>
                <span className="text-lg font-black text-white tracking-widest">--- ---</span>
              </div>
            </div>

            <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center gap-3">
              <Info className="w-4 h-4 text-primary" />
              <p className="text-[10px] font-bold text-primary/80 uppercase tracking-wider">
                ინფორმაცია გამოჩნდება მატჩის დაწყებამდე 15 წუთით ადრე.
              </p>
            </div>
          </div>

          <div className="bg-[#06070a] border border-white/5 rounded-[2rem] p-8 space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
              <Globe className="w-20 h-20 text-secondary" />
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center border border-secondary/20">
                <MapPin className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Tactical Deployment</h3>
                <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Server & Region</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Server</p>
                <p className="text-sm font-bold text-white uppercase">Europe (EU)</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Perspective</p>
                <p className="text-sm font-bold text-white uppercase">FPP / TPP</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-8 backdrop-blur-md self-start">
          <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            Match Protocol
          </h3>

          <div className="space-y-6">
            {[
              "ყველა მოთამაშე უნდა იყოს თავის მინიჭებულ სლოტზე.",
              "აკრძალულია მესამე მხარის პროგრამების გამოყენება.",
              "მატჩის დაწყებამდე 5 წუთით ადრე ყველა უნდა იყოს მზად.",
              "ნებისმიერი დარღვევა გამოიწვევს BANLIST-ში მოხვედრას.",
              "გუნდის კაპიტანი ვალდებულია აკონტროლოს შემადგენლობა."
            ].map((rule, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 text-emerald-500 text-[10px] font-black">
                  {i + 1}
                </div>
                <p className="text-sm font-medium text-white/70 leading-relaxed">{rule}</p>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <button className="w-full py-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all">
              Accept Protocol & Join
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
