import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, Calendar, ArrowRight } from "lucide-react"

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.1),transparent_70%)]" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/5 blur-[100px] -z-10" />
      
      <div className="w-full max-w-xl animate-reveal relative">
        <Card className="border-white/5 bg-black/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden">
          <CardHeader className="pt-12 pb-6">
            <div className="flex items-center justify-center mb-8">
              <div className="w-24 h-24 rounded-[2rem] bg-green-500/10 flex items-center justify-center border border-green-500/20 relative group">
                <CheckCircle className="w-12 h-12 text-green-400 animate-pulse-slow" />
                <div className="absolute inset-0 rounded-[2rem] bg-green-400/20 blur-xl -z-10" />
              </div>
            </div>
            <CardTitle className="text-4xl lg:text-5xl font-black text-white text-center italic tracking-tighter uppercase mb-4">
              რეგისტრაცია <span className="text-green-400">წარმატებულია!</span>
            </CardTitle>
            <CardDescription className="text-muted-foreground text-center font-medium uppercase tracking-[0.2em] text-[10px]">
              თქვენი ანგარიში წარმატებით შეიქმნა
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 lg:px-12 pb-12">
            <div className="space-y-8">
              <div className="glass p-8 rounded-3xl border border-white/5 space-y-4">
                <div className="flex items-center gap-3 text-primary mb-2">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm font-black uppercase tracking-widest italic">შემდეგი ნაბიჯი</span>
                </div>
                <p className="text-lg text-white/80 font-light leading-relaxed">
                  თუ გსურთ რომ ითამაშოთ, გადადით <span className="text-white font-bold italic">განრიგში</span>, მონახეთ თქვენთვის სასურველი <span className="text-primary font-bold">პრეკი</span> და დააჭირეთ <span className="text-primary font-bold italic">"მოითხოვე თამაში"</span>.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <Button asChild size="lg" className="h-16 rounded-2xl text-md font-black uppercase tracking-widest italic transition-transform active:scale-95 bg-primary hover:bg-primary/90">
                  <Link href="/schedule" className="flex items-center gap-2">
                    განრიგში გადასვლა <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="h-14 rounded-xl text-xs font-black uppercase tracking-widest italic text-muted-foreground hover:text-white">
                  <Link href="/profile">პროფილის ნახვა</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

