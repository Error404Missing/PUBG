"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { 
  MessageSquare, Send, User, Shield, 
  Search, ChevronLeft, Activity, Target
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function AdminSupportPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [reply, setReply] = useState("")
  const supabase = createClient()
  const scrollRef = useRef<HTMLDivElement>(null)

  const chats = messages.reduce((acc: any, msg: any) => {
    if (msg.sender === 'user') {
      if (!acc[msg.userId]) {
        acc[msg.userId] = {
          userId: msg.userId,
          username: msg.username,
          lastMessage: msg.text,
          time: msg.time,
          messages: []
        }
      }
      acc[msg.userId].messages.push(msg)
      acc[msg.userId].lastMessage = msg.text
      acc[msg.userId].time = msg.time
    } else if (msg.sender === 'admin') {
      if (acc[msg.targetUserId]) {
        acc[msg.targetUserId].messages.push(msg)
      }
    }
    return acc
  }, {})

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (!authUser) {
        router.push("/auth/login")
        return
      }
      setUser(authUser)
      
      supabase.from("profiles").select("is_admin").eq("id", authUser.id).single().then(({ data: profile }) => {
        if (!profile?.is_admin) {
           router.push("/")
        }
      })
    })

    const channel = supabase.channel('support-chat', {
       config: {
         broadcast: { self: true }
       }
    })

    channel.on('broadcast', { event: 'message' }, ({ payload }: { payload: any }) => {
       setMessages(prev => [...prev, payload])
    }).subscribe()

    return () => {
       supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, activeChat])

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reply.trim() || !activeChat || !user) return

    const newMessage = {
      id: Date.now(),
      text: reply,
      sender: "admin",
      targetUserId: activeChat,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    await supabase.channel('support-chat').send({
       type: 'broadcast',
       event: 'message',
       payload: newMessage
    })

    setReply("")
  }

  return (
    <div className="min-h-screen py-32 px-4 relative overflow-hidden bg-background">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(0,180,255,0.03),transparent_70%)] -z-10" />

      <div className="container mx-auto max-w-7xl relative h-[700px] flex flex-col">
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">მართვის პანელი</span>
        </Link>

        <div className="flex-1 flex gap-8 min-h-0">
          {/* Chat List */}
          <div className="w-80 flex flex-col gap-6">
             <div className="glass-card p-6">
                <h2 className="text-xl font-black text-white italic tracking-tighter uppercase mb-6 flex items-center gap-3">
                   <Activity className="w-5 h-5 text-primary" />
                   Active Intel
                </h2>
                <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2 scrollbar-hide">
                   {Object.values(chats).length > 0 ? Object.values(chats).map((chat: any) => (
                      <button 
                        key={chat.userId}
                        onClick={() => setActiveChat(chat.userId)}
                        className={`w-full p-4 rounded-2xl border transition-all text-left group ${
                          activeChat === chat.userId 
                            ? 'bg-primary/10 border-primary/30' 
                            : 'glass border-white/5 hover:border-white/10'
                        }`}
                      >
                         <div className="flex items-center justify-between mb-2">
                           <div className="text-[10px] font-black text-white uppercase tracking-widest truncate max-w-[120px]">{chat.username}</div>
                           <div className="text-[8px] text-muted-foreground font-bold">{chat.time}</div>
                         </div>
                         <div className="text-xs text-muted-foreground line-clamp-1 italic">{chat.lastMessage}</div>
                      </button>
                   )) : (
                      <div className="text-center py-10 opacity-30 italic text-xs">No active sessions...</div>
                   )}
                </div>
             </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col glass-card p-1 min-h-0">
             {activeChat ? (
               <div className="flex flex-col h-full">
                  {/* Chat Header */}
                  <div className="p-6 border-b border-white/5 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl glass border border-primary/20 flex items-center justify-center">
                           <User className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                           <h3 className="text-xl font-black text-white italic truncate">{chats[activeChat].username}</h3>
                           <div className="text-[8px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Encrypted Channel
                           </div>
                        </div>
                     </div>
                     <Badge variant="outline" className="border-primary/20 text-primary uppercase italic text-[8px] tracking-[0.2em]">Session_{activeChat.slice(0,8)}</Badge>
                  </div>

                  {/* Messages Area */}
                  <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-10 space-y-6 scrollbar-hide"
                  >
                     {chats[activeChat].messages.map((msg: any) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                           <div className={`max-w-[70%] space-y-2`}>
                              <div className={`p-5 rounded-3xl text-sm leading-relaxed ${
                                msg.sender === 'admin'
                                  ? 'bg-secondary text-black font-bold rounded-tr-none'
                                  : 'glass border border-white/10 text-white rounded-tl-none'
                              }`}>
                                 {msg.text}
                              </div>
                              <div className={`text-[8px] font-black uppercase tracking-widest opacity-30 ${msg.sender === 'admin' ? 'text-right' : 'text-left'}`}>
                                 {msg.time} — {msg.sender === 'admin' ? 'COMMAND' : 'OPERATOR'}
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>

                  {/* Input Area */}
                  <div className="p-8 border-t border-white/5 bg-white/2">
                     <form onSubmit={handleReply} className="flex gap-4">
                        <Input 
                          value={reply}
                          onChange={(e) => setReply(e.target.value)}
                          placeholder="შეიყვანეთ პასუხი..."
                          className="h-16 bg-black/40 border-white/10 rounded-2xl px-6 text-white focus:border-secondary/50 transition-all font-bold placeholder:italic"
                        />
                        <Button type="submit" className="h-16 px-8 rounded-2xl bg-secondary text-black hover:bg-secondary/80 font-black uppercase tracking-widest transition-transform active:scale-95">
                           <Send className="w-5 h-5" />
                        </Button>
                     </form>
                  </div>
               </div>
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center opacity-20 select-none">
                  <MessageSquare className="w-32 h-32 mb-8" />
                  <div className="text-2xl font-black italic uppercase tracking-[0.5em]">Select Operative</div>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  )
}
