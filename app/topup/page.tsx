import { Wallet, CreditCard, MessageCircle, HelpCircle, ChevronRight, Ban as Bank } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TopupPage() {
  return (
    <div className="min-h-screen py-32 px-4 relative overflow-hidden bg-background">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,rgba(34,197,94,0.03),transparent_70%)] -z-10" />

      <div className="container mx-auto max-w-4xl relative">
        <div className="mb-16 text-center animate-reveal">
           <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] glass border border-green-500/20 mb-8 relative group">
            <Wallet className="w-10 h-10 text-green-400 transition-transform group-hover:scale-110 duration-500" />
            <div className="absolute inset-0 rounded-[2rem] bg-green-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 text-white tracking-tighter italic uppercase">
            Top <span className="text-green-400 tracking-normal">Up</span>
          </h1>
          <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto italic">
            ბალანსის შევსება და სერვისების შეძენა
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12 animate-reveal" style={{ animationDelay: "0.1s" }}>
           <div className="glass-card p-1 group border-green-500/10 hover:border-green-500/30 transition-all">
              <div className="p-8 h-full flex flex-col">
                 <div className="w-14 h-14 rounded-2xl glass border border-green-500/20 bg-green-500/10 flex items-center justify-center mb-6">
                    <Bank className="w-7 h-7 text-green-400" />
                 </div>
                 <h2 className="text-2xl font-black text-white italic tracking-tighter mb-4 uppercase">საბანკო გადარიცხვა</h2>
                 <p className="text-muted-foreground font-light flex-grow leading-relaxed">
                    ჩვენ ვიღებთ პირდაპირ საბანკო გადარიცხვებს <span className="text-white font-bold">საქართველოს ბანკსა (BOG)</span> და <span className="text-blue-400 font-bold">თიბისი ბანკში (TBC)</span>. გადარიცხვა ხდება უშუალოდ ადმინისტრატორთან შეთანხმებით.
                 </p>
              </div>
           </div>

           <div className="glass-card p-1 group border-blue-500/10 hover:border-blue-500/30 transition-all">
              <div className="p-8 h-full flex flex-col">
                 <div className="w-14 h-14 rounded-2xl glass border border-blue-500/20 bg-blue-500/10 flex items-center justify-center mb-6">
                    <MessageCircle className="w-7 h-7 text-blue-400" />
                 </div>
                 <h2 className="text-2xl font-black text-white italic tracking-tighter mb-4 uppercase">როგორ შევავსო?</h2>
                 <p className="text-muted-foreground font-light flex-grow leading-relaxed mb-6">
                    ბალანსის შესავსებად და შეძენისთვის, გთხოვთ დაგვიკავშირდეთ ჩვენს <span className="text-indigo-400 font-bold">Discord სერვერზე</span> ან მოგვწერეთ საიტის <span className="text-white font-bold">Support ჩატში</span>.
                 </p>
                 
                 <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                    <Button asChild className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-bold tracking-widest uppercase italic">
                       <Link href="https://discord.gg/yourdiscordlink" target="_blank" rel="noopener noreferrer">
                          Discord
                       </Link>
                    </Button>
                    <Button variant="outline" className="flex-1 border-white/10 hover:bg-white/5 font-bold tracking-widest uppercase italic cursor-pointer">
                       Support Chat
                    </Button>
                 </div>
              </div>
           </div>
        </div>

        <div className="glass-card p-8 lg:p-12 animate-reveal border-white/5 group shadow-[0_0_50px_rgba(255,255,255,0.02)] text-center" style={{ animationDelay: "0.2s" }}>
           <HelpCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-6" />
           <h3 className="text-2xl font-black text-white italic tracking-tighter mb-4 uppercase">
              აქვს თუ არა ბალანსს ვადა?
           </h3>
           <p className="text-muted-foreground font-light max-w-xl mx-auto">
              არანაირი ვადა! თქვენი ბალანსი ინახება უსაფრთხოდ თქვენს პროფილზე და შეგიძლიათ გამოიყენოთ Case-ების გასახსნელად ნებისმიერ დროს. 
           </p>
        </div>
      </div>
    </div>
  )
}
