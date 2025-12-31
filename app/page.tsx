import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function Home() {
  let scrims: any[] = [];
  const config: Record<string, string> = {};
  let registeredTeams = 0;
  let finishedScrims = 0;
  try {
    scrims = await prisma.scrim.findMany({
      where: { status: "OPEN" },
      orderBy: { startTime: 'asc' },
      take: 3
    });
    const configItems = await prisma.systemConfig.findMany();
    configItems.forEach(i => config[i.key] = i.value);
    registeredTeams = await prisma.team.count({ where: { status: "APPROVED" } });
    finishedScrims = await prisma.scrim.count({ where: { status: "FINISHED" } });
  } catch {}
  const title = config.homepage_title || "PUBG SCRIMS — კონკურენტული ყოველდღიური სკრიმები";
  const subtitle = config.homepage_subtitle || "შექმენი გუნდი, დაიკავე სლოტი და მოიგე";
  const marketing = config.homepage_marketing || "ვარჯიში, კონკურენცია და განვითარება ერთ სივრცეში. Stable სერვერები, გამართული ორგანიზაცია და გამჭვირვალე წესები. შეუერთდი ქართულ PUBG კომუნიტეტის ყველაზე აქტიურ სკრიმ პლატფორმას.";
  const announcement = config.announcement || "";

  return (
    <div className="space-y-8">
      {announcement && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl p-4">
          <p className="text-sm">{announcement}</p>
        </div>
      )}

      <section className="bg-gradient-to-br from-[#0f1014] to-black border border-white/5 rounded-2xl p-10 shadow-xl">
        <div className="space-y-4">
          <h1 className="text-5xl font-black text-white tracking-tight">{title}</h1>
          <p className="text-xl text-amber-500 font-bold">{subtitle}</p>
          <p className="text-gray-300 max-w-3xl">{marketing}</p>
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
           <Link href="/teams" className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 px-6 rounded-lg transition">
             გუნდის რეგისტრაცია
           </Link>
           <Link href="/schedule" className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 px-6 rounded-lg transition">
             განრიგი
           </Link>
           <Link href="/help" className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-gray-300 font-bold py-3 px-6 rounded-lg transition">
             წესები
           </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-neutral-900/60 border border.white/5 rounded-xl p-6">
            <p className="text-sm text-gray-400">რეგისტრირებული გუნდები</p>
            <p className="text-4xl font-black text-amber-500">{registeredTeams}</p>
          </div>
          <div className="bg-neutral-900/60 border border-white/5 rounded-xl p-6">
            <p className="text-sm text-gray-400">დასრულებული სკრიმები</p>
            <p className="text-4xl font-black text-blue-500">{finishedScrims}</p>
          </div>
          <div className="bg-neutral-900/60 border border-white/5 rounded-xl p-6">
            <p className="text-sm text-gray-400">აქტიური რეგისტრაციები</p>
            <p className="text-4xl font-black text-green-500">{scrims.length}</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {/* Active Scrims */}
         <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                მიმდინარე რეგისტრაციები
            </h3>
            {scrims.length > 0 ? (
                <ul className="space-y-4">
                    {scrims.map(scrim => (
                        <li key={scrim.id} className="bg-neutral-800 p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-bold">{scrim.map}</p>
                                <p className="text-sm text-gray-400">{new Date(scrim.startTime).toLocaleString('ka-GE')}</p>
                            </div>
                            <Link href={`/schedule`} className="text-yellow-500 text-sm hover:underline">
                                ნახვა
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500">ამ მომენტისთვის რეგისტრაცია არ მიმდინარეობს.</p>
            )}
         </div>

         {/* Latest News / Info */}
         <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">სიახლეები</h3>
            <div className="space-y-4 text-gray-400">
                <p>• მესამე ტალღა დაიწყება მალე — მოასწარით რეგისტრაცია.</p>
                <p>• VIP გუნდებისთვის გარანტირებული სლოტები და პრიორიტეტი.</p>
                <p>• Discord-ზე ხდება ყველა აქტიური ანონსი — შემოგვიერთდით.</p>
            </div>
         </div>
         
         {/* Why Join */}
         <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">რატომ ჩვენ?</h3>
            <ul className="space-y-3 text-gray-400">
              <li>• გამართული სლოტების სისტემა და ადვილად მართვადი პანელი</li>
              <li>• Room Info მენეჯერებისთვის ავტომატურად გამოჩნდება</li>
              <li>• შედეგების არქივი და გამჭვირვალობა</li>
            </ul>
            <Link href="/teams" className="mt-4 inline-block text-amber-500 hover:underline">დარეგისტრირდი ახლავე →</Link>
         </div>
      </div>
    </div>
  );
}
