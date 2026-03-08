"use client"

import { useState, useEffect, useRef } from "react"
import { MessageCircle, X, Send, User, ShieldCheck, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

export function SupportChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<any[]>([
    { id: 1, text: "გამარჯობა! როგორ შეგვიძლია დაგეხმაროთ?", sender: "admin", time: "12:00" }
  ])
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      setUser(authUser)
    })

    const channel = supabase.channel('support-chat', {
       config: {
         broadcast: { self: true }
       }
    })

    channel.on('broadcast', { event: 'message' }, ({ payload }: any) => {
       // Only show messages for this user or sent by admin to this user
       if (payload.sender === 'admin' && payload.targetUserId === user?.id) {
          setMessages((prev: any[]) => [...prev, payload])
       } else if (payload.sender === 'user' && payload.userId === user?.id) {
          setMessages((prev: any[]) => [...prev, payload])
       }
    }).subscribe()

    return () => {
       supabase.removeChannel(channel)
    }
  }, [user?.id])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isOpen])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !user) return

    const newMessage = {
      id: Date.now(),
      text: message,
      sender: "user",
      userId: user.id,
      username: user.user_metadata?.username || user.email,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    await supabase.channel('support-chat').send({
       type: 'broadcast',
       event: 'message',
       payload: newMessage
    })

    setMessage("")
  }

  return (
    <div className="fixed bottom-8 right-8 z-[1000]">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[350px] sm:w-[400px] h-[500px] glass-darker border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-reveal">
           {/* Header */}
           <div className="p-6 bg-gradient-to-r from-primary to-accent flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/20">
                    <ShieldCheck className="w-5 h-5 text-white" />
                 </div>
                 <div>
                    <div className="text-white font-black italic tracking-tighter uppercase leading-none">Support Intel</div>
                    <div className="flex items-center gap-1.5 mt-1">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                       <span className="text-[10px] text-white/70 uppercase tracking-widest font-bold">Online</span>
                    </div>
                 </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                 <X className="w-5 h-5 text-white" />
              </button>
           </div>

           {/* Messages Section */}
           <div 
             ref={scrollRef}
             className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide"
           >
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                     msg.sender === 'user' 
                      ? 'bg-primary text-white rounded-tr-none' 
                      : 'glass border border-white/10 text-white/90 rounded-tl-none'
                   }`}>
                      <p className="leading-relaxed">{msg.text}</p>
                      <div className={`text-[9px] mt-2 font-bold uppercase tracking-widest ${msg.sender === 'user' ? 'text-white/50' : 'text-white/30'}`}>
                         {msg.time}
                      </div>
                   </div>
                </div>
              ))}
           </div>

           {/* Input Section */}
           <div className="p-6 border-t border-white/10 bg-white/5">
              <form onSubmit={handleSend} className="relative">
                 <Input 
                   value={message}
                   onChange={(e) => setMessage(e.target.value)}
                   placeholder="დაწერეთ შეტყობინება..."
                   className="h-14 bg-black/40 border-white/10 rounded-2xl pl-4 pr-14 text-white placeholder:text-white/20 focus:border-primary/50 transition-all font-medium"
                 />
                 <button 
                   type="submit"
                   className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/80 transition-all active:scale-95"
                 >
                    <Send className="w-4 h-4" />
                 </button>
              </form>
              <div className="mt-4 text-[9px] text-center font-black text-white/20 uppercase tracking-[0.3em]">
                 PUBG Arena Secure Comms
              </div>
           </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 shadow-2xl ${
          isOpen 
            ? 'bg-white text-black rotate-90' 
            : 'bg-primary text-white hover:scale-110 active:scale-95'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-8 h-8" />}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-black text-[10px] font-black rounded-full flex items-center justify-center border-4 border-background animate-bounce">
            1
          </div>
        )}
      </button>
    </div>
  )
}
