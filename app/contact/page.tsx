import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function ContactPage() {
  const items = await prisma.systemConfig.findMany();
  const config: Record<string, string> = {};
  items.forEach(i => config[i.key] = i.value);

  const discord = config.contact_discord || "https://discord.gg/your-server";
  const facebook = config.contact_facebook || "https://facebook.com/your-page";
  const telegram = config.contact_telegram || "https://t.me/your-channel";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3ლ font-bold text-white">კონტაქტი</h1>
        <p className="text-gray-400">დაგვიკავშირდით ნებისმიერი კითხვის შემთხვევაში</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="text-center">
            <div className="mx-auto p-4 bg-zinc-800/50 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-blue-500" />
            </div>
            <CardTitle>ელ-ფოსტა</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-gray-400">
            <p>{config.support_email || "support@prekebi.ge"}</p>
            <p>{config.info_email || "info@prekebi.ge"}</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="text-center">
            <a href={discord} target="_blank" rel="noopener noreferrer" aria-label="Discord" className="mx-auto p-4 bg-zinc-800/50 rounded-full w-16 h-16 flex items-center justify-center mb-4 hover:bg-zinc-800 cursor-pointer">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-indigo-500" fill="currentColor" aria-hidden="true">
                <path d="M20.317 4.369A19.791 19.791 0 0 0 16.558 3c-.211.377-.46.916-.632 1.333a18.232 18.232 0 0 0-4.844 0A13.248 13.248 0 0 0 10.45 3c-1.708.313-3.346.86-4.875 1.631C2.917 8.365 2.39 12.256 2.64 16.1a17.984 17.984 0 0 0 5.333 2.742c.43-.592.81-1.223 1.137-1.885a11.463 11.463 0 0 1-1.803-.858c.15-.112.297-.23.438-.35a12.763 12.763 0 0 0 10.45 0c.143.122.29.24.44.35-.583.348-1.193.64-1.829.872.328.662.709 1.292 1.139 1.884a17.98 17.98 0 0 0 5.333-2.742c.35-5.22-.566-9.08-3.1-11.772zM9.403 13.859c-.963 0-1.75-.88-1.75-1.963 0-1.082.78-1.964 1.75-1.964s1.755.882 1.75 1.964c0 1.083-.787 1.963-1.75 1.963zm5.197 0c-.963 0-1.75-.88-1.75-1.963 0-1.082.78-1.964 1.75-1.964s1.755.882 1.75 1.964c0 1.083-.787 1.963-1.75 1.963z"/>
              </svg>
            </a>
            <CardTitle>Discord</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-gray-400">
            <p>შემოგვიერთდით Discord სერვერზე</p>
            <a href={discord} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 mt-2 inline-block">
              {discord}
            </a>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="text-center">
            <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="mx-auto p-4 bg-zinc-800/50 rounded-full w-16 h-16 flex items-center justify-center mb-4 hover:bg-zinc-800 cursor-pointer">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-blue-500" fill="currentColor" aria-hidden="true">
                <path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898ვ-2.89h2.54V9.845c0-2.506 1.492-3.89 3.777-3.89 1.095 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.628.771-1.628 1.562v1.875h2.773ლ-.443 2.89h-2.33v6.987C18.343 21.128 22 16.99 22 12z"/>
              </svg>
            </a>
            <CardTitle>Facebook</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-gray-400">
            <p>გვიპოვით Facebook-ზე</p>
            <a href={facebook} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 mt-2 inline-block">
              {facebook}
            </a>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="text-center">
            <a href={telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="mx-auto p-4 bg-zinc-800/50 rounded-full w-16 h-16 flex items-center justify-center mb-4 hover:bg-zinc-800 cursor-pointer">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-cyan-500" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 4.63 3.29 8.49 7.66 9.59.56.1.77-.24.77-.54v-1.9c-3.11.68-3.77-1.5-3.77-1.5-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.17 1.72 1.17 1 .1 1.57-.77 1.57-.77.9-1.55 2.35-1.1 2.92-.84.09-.65.35-1.1.64-1.35-2.48-.28-5.09-1.24-5.09-5.52 0-1.22.43-2.22 1.14-3-.11-.28-.5-1.41.11-2.94 0 0 .94-.3 3.08 1.15.9-.25 1.86-.37 2.81-.37.95 0 1.91.12 2.81.37 2.14-1.45 3.08-1.15 3.08-1.15.61 1.53.22 2.66.11 2.94.71.78 1.14 1.78 1.14 3 0 4.29-2.61 5.23-5.1 5.5.36.31.69.93.69 1.88ვ2.78c0 .3.21.65.78.54C18.71 20.49 22 16.63 22 12c0-5.52-4.48-10-10-10z"/>
              </svg>
            </a>
            <CardTitle>Telegram</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-gray-400">
            <p>შემოგვიერთდით Telegram-ზე</p>
            <a href={telegram} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 mt-2 inline-block">
              {telegram}
            </a>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle>მოგვწერეთ</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4 max-w-md">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">თქვენი სახელი</label>
                <input 
                  type="text" 
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white"
                  placeholder="სახელი"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">ელ-ფოსტა</label>
                <input 
                  type="email" 
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white"
                  placeholder="example@mail.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">შეტყობინება</label>
                <textarea 
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white h-32"
                  placeholder="თქვენი შეტყობინება..."
                />
              </div>
              <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium transition-colors">
                გაგზავნა
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
