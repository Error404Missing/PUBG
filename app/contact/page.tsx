import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageSquare, Facebook, Send } from "lucide-react";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";

export default async function ContactPage() {
  const items = await prisma.systemConfig.findMany();
  const config: Record<string, string> = {};
  items.forEach(i => config[i.key] = i.value);

  const discord = config.contact_discord || "https://discord.gg/prekebi";
  const facebook = config.contact_facebook || "https://facebook.com/prekebi";
  const telegram = config.contact_telegram || "https://t.me/prekebi";

  const contactItems = [
    {
      title: "ელ-ფოსტა",
      values: [config.support_email || "support@prekebi.ge", config.info_email || "info@prekebi.ge"],
      icon: Mail,
      color: "text-primary",
      bg: "bg-primary/10"
    },
    {
      title: "DISCORD",
      values: ["შემოგვიერთდით სერვერზე"],
      link: discord,
      icon: MessageSquare,
      color: "text-indigo-400",
      bg: "bg-indigo-400/10"
    },
    {
      title: "FACEBOOK",
      values: ["მოგვყევით სიახლეებისთვის"],
      link: facebook,
      icon: Facebook,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "TELEGRAM",
      values: ["ოპერატიული ინფორმაცია"],
      link: telegram,
      icon: Send,
      color: "text-cyan-400",
      bg: "bg-cyan-400/10"
    }
  ];

  return (
    <div className="space-y-12 pb-24">
      <PageHeader
        title="კონტაქტი"
        description="დაგვიკავშირდით ნებისმიერი კითხვის შემთხვევაში"
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {contactItems.map((item, i) => (
          <Card key={i} className="bg-[#06070a] border-white/5 rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-500 group">
            <CardHeader className="pb-4">
              <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <CardTitle className="text-sm font-black text-white uppercase tracking-widest">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {item.values.map((v, idx) => (
                  <p key={idx} className="text-xs font-bold text-cyber-muted truncate">{v}</p>
                ))}
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-[10px] font-black uppercase tracking-tighter ${item.color} hover:underline mt-2 inline-block`}
                  >
                    გადასვლა // LINK
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="max-w-xl mx-auto">
        <Card className="bg-[#06070a] border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Mail className="w-32 h-32" />
          </div>
          <CardHeader className="p-8 border-b border-white/5">
            <CardTitle className="text-2xl font-black text-white uppercase tracking-tight">მოგვწერეთ</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-cyber-muted uppercase tracking-widest">თქვენი სახელი</label>
                  <input
                    type="text"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-white focus:border-primary/50 focus:outline-none transition-all"
                    placeholder="NAME"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-cyber-muted uppercase tracking-widest">ელ-ფოსტა</label>
                  <input
                    type="email"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-white focus:border-primary/50 focus:outline-none transition-all"
                    placeholder="EMAIL"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-cyber-muted uppercase tracking-widest">შეტყობინება</label>
                <textarea
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-white h-32 resize-none focus:border-primary/50 focus:outline-none transition-all"
                  placeholder="MESSAGE"
                />
              </div>
              <button className="w-full py-4 bg-primary text-black font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                შეტყობინების გაგზავნა
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
