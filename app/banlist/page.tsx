import PageHeader from "@/components/PageHeader";
import { ShieldAlert, UserX, Clock, FileText } from "lucide-react";

export default function BanlistPage() {
  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title="BANLIST"
        subtitle="ფეირ-პლეის პოლიტიკის დარღვევისთვის ბლოკირებული გუნდებისა და მოთამაშეების სია."
      />

      <div className="bg-[#06070a]/50 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">დამრღვევი</th>
                <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">მიზეზი</th>
                <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">ვადა</th>
                <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">სტატუსი</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { name: "Team Toxic", reason: "Teaming during Scrims", duration: "PERMANENT", status: "BANNED" },
                { name: "Cheater123", reason: "Use of unauthorized software", duration: "PERMANENT", status: "BANNED" },
                { name: "Unfair Squad", reason: "Disrespect towards admins", duration: "30 DAYS", status: "SUSPENDED" },
              ].map((ban, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                        <UserX className="w-5 h-5 text-rose-500" />
                      </div>
                      <span className="text-sm font-black text-white uppercase tracking-tight">{ban.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-white/20" />
                      <span className="text-sm font-medium text-white/60">{ban.reason}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-white/20" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">{ban.duration}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${ban.status === 'BANNED' ? 'bg-rose-500/20 text-rose-500 border border-rose-500/20' : 'bg-amber-500/20 text-amber-500 border border-amber-500/20'
                      }`}>
                      {ban.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-4 p-6 bg-rose-500/5 border border-rose-500/10 rounded-[2rem]">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6 text-rose-500" />
        </div>
        <p className="text-xs font-medium text-rose-500/80 leading-relaxed">
          ჩვენ ვიცავთ ფეირ-პლეის პრინციპებს. ნებისმიერი სახის დარღვევა გამოიწვევს დაუყოვნებლივ ბლოკირებას.
        </p>
      </div>
    </div>
  );
}
