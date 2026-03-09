"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { 
  MessageSquare, Send, User, 
  ChevronLeft, Activity, RefreshCcw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CustomConfirm } from "@/components/ui/custom-confirm"

export default function AdminSupportPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [reply, setReply] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false)
  const [channelStatus, setChannelStatus] = useState("disconnected")
  const supabase = createClient()
  const scrollRef = useRef<HTMLDivElement>(null)

  // 1. Initial Load: Auth and Message Fetching
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        router.push("/auth/login")
        return
      }
      setUser(authUser)
      
      const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", authUser.id).single()
      if (!profile?.is_admin) {
        router.push("/")
        return
      }

      // Fetch ALL support messages with profile info
      const { data: allMessages } = await supabase
        .from("support_messages")
        .select(`
          *,
          profiles:user_id (username)
        `)
        .order("created_at", { ascending: true })

      if (allMessages) {
        setMessages(allMessages.map(m => ({
          ...m,
          text: m.message,
          image: m.image_url,
          sender: m.sender_type,
          username: m.profiles?.username || 'Anonymous',
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })))
      }
      setIsLoading(false)
    }

    fetchData()

    // 2. Real-time Subscription
    const channel = supabase
      .channel('support-admin-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all changes
          schema: 'public',
          table: 'support_messages'
        },
        async (payload: any) => {
          if (payload.eventType === 'INSERT') {
            // Fetch profile for the new message user
            const { data: profile } = await supabase
              .from("profiles")
              .select("username")
              .eq("id", payload.new.user_id)
              .single()

            const newMessage = {
              ...payload.new,
              text: payload.new.message,
              image: payload.new.image_url,
              sender: payload.new.sender_type,
              username: profile?.username || 'Anonymous',
              time: new Date(payload.new.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }

            setMessages(prev => {
              if (prev.some(m => m.id === newMessage.id)) return prev
              return [...prev, newMessage]
            })
          } else if (payload.eventType === 'DELETE') {
             setMessages(prev => prev.filter(m => m.id !== payload.old.id))
          }
        }
      )
      .subscribe((status) => {
        setChannelStatus(status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router, supabase])

  // Group messages into chats
  const chats = messages.reduce((acc: any, msg: any) => {
    const userId = msg.user_id
    if (!userId) return acc

    if (!acc[userId]) {
      acc[userId] = {
        userId: userId,
        username: msg.username,
        lastMessage: msg.text,
        time: msg.time,
        messages: []
      }
    }
    acc[userId].messages.push(msg)
    acc[userId].lastMessage = msg.text
    acc[userId].time = msg.time
    return acc
  }, {})

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, activeChat])

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reply.trim() || !activeChat || !user) return

    const replyText = reply.trim()
    setReply("") // Clear input

    try {
      const { error } = await supabase
        .from("support_messages")
        .insert({
          user_id: activeChat,
          message: replyText,
          sender_type: 'admin',
          sender_id: user.id
        })

      if (error) throw error
    } catch (err) {
      console.error("Failed to send reply:", err)
    }
  }

  const clearMessages = async () => {
    // Session clear for UI safety
    setMessages([])
    setActiveChat(null)
  }

  if (isLoading) return null

  return (
    <div className="min-h-screen py-32 px-4 relative overflow-hidden bg-background">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(0,180,255,0.03),transparent_70%)] -z-10" />

      <div className="container mx-auto max-w-7xl relative h-[700px] flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/admin" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">მართვის პანელი</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className={`px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest flex items-center gap-2 ${
              channelStatus === 'SUBSCRIBED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${channelStatus === 'SUBSCRIBED' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
              Live: {channelStatus}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsClearConfirmOpen(true)}
              className="h-8 border-rose-500/20 text-rose-500 hover:bg-rose-500/10 text-[10px] font-black uppercase tracking-widest px-4"
            >
              <RefreshCcw className="w-3 h-3 mr-2" /> Live Clear
            </Button>
          </div>
        </div>

        <div className="flex-1 flex gap-8 min-h-0">
          {/* Chat List */}
          <div className="w-80 flex flex-col gap-6">
             <div className="glass-card p-6 flex flex-col h-full">
                <h2 className="text-xl font-black text-white italic tracking-tighter uppercase mb-6 flex items-center gap-3 shrink-0">
                   <Activity className="w-5 h-5 text-primary" />
                   Active Intel
                </h2>
                <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-hide">
                   {Object.values(chats).length > 0 ? (Object.values(chats) as any[]).sort((a,b) => b.messages[b.messages.length-1].created_at.localeCompare(a.messages[a.messages.length-1].created_at)).map((chat: any) => (
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
                             <h3 className="text-xl font-black text-white italic truncate max-w-[200px]">{chats[activeChat]?.username || "Anonymous"}</h3>
                             <div className="text-[8px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                               <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                               Encrypted Channel
                            </div>
                         </div>
                      </div>
                      <Badge variant="outline" className="border-primary/20 text-primary uppercase italic text-[8px] tracking-[0.2em] hidden sm:flex">Session_{activeChat.slice(0,8)}</Badge>
                   </div>

                   {/* Messages Area */}
                   <div 
                     ref={scrollRef}
                     className="flex-1 overflow-y-auto p-10 space-y-6 scrollbar-hide"
                   >
                      {chats[activeChat]?.messages?.map((msg: any) => (
                         <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] space-y-2`}>
                               <div className={`p-5 rounded-3xl text-sm leading-relaxed ${
                                 msg.sender === 'admin'
                                   ? 'bg-secondary text-black font-bold rounded-tr-none'
                                   : 'glass border border-white/10 text-white rounded-tl-none'
                               }`}>
                                  {msg.image && (
                                    <div className="mb-3 rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                                       <img src={msg.image} alt="Attachment" className="max-w-full h-auto object-contain max-h-[400px]" />
                                    </div>
                                  )}
                                  {msg.text && <p className="whitespace-pre-wrap break-words">{msg.text}</p>}
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

      <CustomConfirm
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        onConfirm={clearMessages}
        title="ხედვის გასუფთავება"
        description="ეს გაასუფთავებს მიმდინარე ჩატების ხედვას. შეტყობინებები ბაზაში შენარჩუნდება."
        confirmText="გასუფთავება"
        variant="warning"
      />
    </div>
  )
}
