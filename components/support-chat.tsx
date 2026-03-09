"use client"

import { useState, useEffect, useRef } from "react"
import { MessageCircle, X, Send, Paperclip, Loader2, ShieldCheck, Users, CornerDownRight, Smile, Trash2, Reply } from "lucide-react"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import Link from "next/link"

export function SupportChat() {
  const [mode, setMode] = useState<'support' | 'global'>('support')
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [globalMessages, setGlobalMessages] = useState<any[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [replyTo, setReplyTo] = useState<any>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const scrollRef = useRef<HTMLDivElement>(null)

  // 1. Initial Load: Fetch user and existing messages
  useEffect(() => {
    const initChat = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        setUser(authUser)
        
        // Fetch support history
        const { data: history } = await supabase
          .from("support_messages")
          .select("*")
          .eq("user_id", authUser.id)
          .order("created_at", { ascending: true })

        if (history) {
          setMessages(history.map(m => ({
            id: m.id,
            text: m.message,
            image: m.image_url,
            sender: m.sender_type,
            time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })))
        }
      }

      // Fetch Global Chat history (visible to everyone)
      const { data: globalHistory } = await supabase
        .from("global_messages")
        .select(`
          *,
          profiles:user_id (username, avatar_url, is_admin, role)
        `)
        .order("created_at", { ascending: true })
        .limit(50)

      if (globalHistory) {
        setGlobalMessages(globalHistory.map(m => ({
          id: m.id,
          text: m.message,
          userId: m.user_id,
          username: m.profiles?.username || 'Anonymous',
          avatar: m.profiles?.avatar_url,
          isAdmin: m.profiles?.is_admin || m.profiles?.role === 'admin',
          replyTo: m.reply_to,
          reactions: m.reactions || [],
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })))
      }

      // Check if current user is admin
      if (authUser) {
        const { data: profile } = await supabase.from('profiles').select('is_admin, role').eq('id', authUser.id).single()
        setIsAdmin(profile?.is_admin || profile?.role === 'admin')
      }
    }

    initChat()

    // Listen for auth changes to update user state dynamically
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user)
      } else {
        setUser(null)
        setMessages([])
      }
    })

    // 2. Real-time Subscription: Support Messages
    const supportChannel = supabase
      .channel('support-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'support_messages' },
        (payload) => {
          if (payload.new.user_id === user?.id || (user?.id && payload.new.user_id === user?.id)) {
            const newMessage = {
              id: payload.new.id,
              text: payload.new.message,
              image: payload.new.image_url,
              sender: payload.new.sender_type,
              time: new Date(payload.new.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
            setMessages((prev) => prev.some(m => m.id === newMessage.id) ? prev : [...prev, newMessage])
            if (!isOpen && payload.new.sender_type === 'admin') setUnreadCount(prev => prev + 1)
          }
        }
      )
      .subscribe()

    // 3. Real-time Subscription: Global Messages
    const globalChannel = supabase
      .channel('global-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'global_messages' },
        async (payload) => {
           // Fetch profile for the sender
           const { data: profile } = await supabase
             .from("profiles")
             .select("username, avatar_url, is_admin, role")
             .eq("id", payload.new.user_id)
             .single()

           const newMessage = {
             id: payload.new.id,
             text: payload.new.message,
             userId: payload.new.user_id,
             username: profile?.username || 'Anonymous',
             avatar: profile?.avatar_url,
             isAdmin: profile?.is_admin || profile?.role === 'admin',
             replyTo: payload.new.reply_to,
             reactions: payload.new.reactions || [],
             time: new Date(payload.new.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
           }
           setGlobalMessages((prev) => prev.some(m => m.id === newMessage.id) ? prev : [...prev, newMessage])
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'global_messages' },
        (payload) => {
          setGlobalMessages(prev => prev.map(m => 
            m.id === payload.new.id ? { ...m, reactions: payload.new.reactions } : m
          ))
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'global_messages' },
        (payload) => {
          setGlobalMessages(prev => prev.filter(m => m.id !== payload.old.id))
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
      supabase.removeChannel(supportChannel)
      supabase.removeChannel(globalChannel)
    }
  }, [supabase, user?.id, isOpen])

  // Clear unread on open
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0)
    }
  }, [isOpen])

  // Scroll to bottom when messages or mode change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, globalMessages, isOpen, mode])

  const handleSend = async (e: React.FormEvent, imgUrl?: string) => {
    if (e) e.preventDefault()
    if (!message.trim() && !imgUrl) return
    if (!user) return

    const msgText = message.trim()
    setMessage("") // Clear input immediately

    try {
      if (mode === 'support') {
        const { error } = await supabase
          .from("support_messages")
          .insert({
            user_id: user.id,
            message: msgText || "",
            image_url: imgUrl || null,
            sender_type: 'user',
            sender_id: user.id
          })
        if (error) throw error
      } else {
        // Global Chat (Explicitly NO images)
        if (imgUrl) return 
        const { error } = await supabase
          .from("global_messages")
          .insert({
            user_id: user.id,
            message: msgText,
            reply_to: replyTo?.id || null
          })
        if (error) throw error
        setReplyTo(null)
      }
    } catch (err: any) {
      console.error("Failed to send message:", err)
      if (err.message?.includes('RLS')) {
        toast.error("შეტყობინების გაგზავნა ვერ მოხერხდა (შესაძლოა ბანი გადევთ)")
      } else {
        toast.error("მოხდა შეცდომა")
      }
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0]
     if (!file || !user) return

     // Simple file validation
     if (!file.type.startsWith('image/')) {
        toast.error("გთხოვთ აირჩიოთ მხოლოდ ფოტო ფაილი")
        return
     }

     if (file.size > 5 * 1024 * 1024) { // 5MB Limit
        toast.error("ფოტოს ზომა არ უნდა აღემატებოდეს 5MB-ს")
        return
     }

     try {
        setIsUploading(true)
        const fileExt = file.name.split('.').pop()
        const filePath = `${user.id}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('support')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('support')
          .getPublicUrl(filePath)

        await handleSend(null as any, publicUrl)
        toast.success("ფოტო აიტვირთა")
     } catch (err: any) {
        console.error("Upload error:", err)
        toast.error("ფოტოს ატვირთვა ვერ მოხერხდა")
     } finally {
        setIsUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
     }
  }

  const handleDeleteMessage = async (msgId: string) => {
    if (!isAdmin) return
    try {
      const { error } = await supabase.from('global_messages').delete().eq('id', msgId)
      if (error) throw error
      toast.success("შეტყობინება წაიშალა")
    } catch (err) {
      toast.error("წაშლა ვერ მოხერხდა")
    }
  }

  const handleReaction = async (msgId: string, emoji: string) => {
    if (!user) return
    const msg = globalMessages.find(m => m.id === msgId)
    if (!msg) return

    let newReactions = [...(msg.reactions || [])]
    const existingIndex = newReactions.findIndex(r => r.user_id === user.id && r.emoji === emoji)

    if (existingIndex > -1) {
      newReactions.splice(existingIndex, 1)
    } else {
      newReactions.push({ user_id: user.id, emoji })
    }

    try {
      // Need to handle atomic update or optimistic UI
      await supabase.from('global_messages').update({ reactions: newReactions }).eq('id', msgId)
    } catch (err) {
       console.error("Reaction error:", err)
    }
    setShowEmojiPicker(null)
  }

  return (
    <div className="fixed bottom-8 right-8 z-[1000]">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[350px] sm:w-[400px] h-[500px] glass-darker border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-reveal">
           {/* Header */}
           <div className="p-4 bg-gradient-to-r from-primary to-accent flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/20">
                        <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <div className="text-white font-black italic tracking-tighter uppercase leading-none">
                          {mode === 'support' ? 'Support Intel' : 'Tactical Comms'}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[10px] text-white/70 uppercase tracking-widest font-bold">Encrypted</span>
                        </div>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Mode Switcher */}
              <div className="flex p-1 bg-black/20 rounded-xl">
                 <button 
                   onClick={() => setMode('support')}
                   className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                     mode === 'support' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
                   }`}
                 >
                    <ShieldCheck className="w-3 h-3" /> Support
                 </button>
                 <button 
                   onClick={() => setMode('global')}
                   className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                     mode === 'global' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
                   }`}
                 >
                    <Users className="w-3 h-3" /> Global
                 </button>
              </div>
           </div>

            {/* Messages Section */}
           <div 
             ref={scrollRef}
             className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide"
           >
              {!user && mode === 'support' ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <MessageCircle className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold uppercase tracking-wider mb-2">ავტორიზაცია საჭიროა</h3>
                    <p className="text-white/40 text-xs leading-relaxed">
                      მხარდაჭერასთან დასაკავშირებლად გთხოვთ გაიაროთ ავტორიზაცია
                    </p>
                  </div>
                  <button onClick={() => window.location.href = '/auth/login'} className="px-6 py-2 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary/80 transition-all">შესვლა</button>
                </div>
              ) : mode === 'support' ? (
                messages.length === 0 ? (
                  <div className="text-center py-10 opacity-30 italic text-xs text-white">შეტყობინებები არ არის...</div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                        msg.sender === 'user' ? 'bg-primary text-white rounded-tr-none' : 'glass border border-white/10 text-white/90 rounded-tl-none'
                      }`}>
                          {msg.image && (
                            <div className="mb-2 rounded-lg overflow-hidden border border-white/5 bg-black/20">
                               <img src={msg.image} alt="Attachment" className="max-w-full h-auto object-cover hover:scale-105 transition-transform duration-500" />
                            </div>
                          )}
                          {msg.text && <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>}
                          <div className={`text-[9px] mt-2 font-bold uppercase tracking-widest ${msg.sender === 'user' ? 'text-white/50' : 'text-white/30'}`}>{msg.time}</div>
                      </div>
                    </div>
                  ))
                )
              ) : (
                /* GLOBAL MODE */
                globalMessages.length === 0 ? (
                  <div className="text-center py-10 opacity-30 italic text-xs text-white">ჩათი ცარიელია...</div>
                ) : (
                  globalMessages.map((msg) => {
                    const replyTarget = globalMessages.find(m => m.id === msg.replyTo)
                    return (
                      <div key={msg.id} className={`flex flex-col ${msg.userId === user?.id ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] flex gap-2 ${msg.userId === user?.id ? 'flex-row-reverse' : 'flex-row'}`}>
                           <Link href={`/profile/${msg.userId}`} className="shrink-0">
                              <div className={`w-8 h-8 rounded-lg overflow-hidden border ${msg.isAdmin ? 'border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'border-white/10'} hover:border-primary/50 transition-colors`}>
                                 <img src={msg.avatar || "https://i.ibb.co/vzD7Z0M/default-avatar-dark.png"} alt="" className="w-full h-full object-cover" />
                              </div>
                           </Link>

                           <div className="flex flex-col gap-1 w-full relative group">
                               {/* Reply Preview */}
                               {replyTarget && (
                                 <div className={`flex items-center gap-2 mb-1 opacity-50 px-2 py-1 rounded-lg border border-white/5 bg-white/5 max-w-[150px] truncate ${msg.userId === user?.id ? 'self-end flex-row-reverse' : 'self-start'}`}>
                                    <CornerDownRight className="w-2 h-2" />
                                    <span className="text-[8px] font-black truncate">{replyTarget.username}</span>
                                 </div>
                               )}

                               <div className={`p-3 rounded-2xl text-xs space-y-1 transition-all relative ${
                                 msg.isAdmin ? 'bg-black/60 border border-rose-500/30 text-rose-50 shadow-[0_0_20px_rgba(244,63,94,0.1)]' :
                                 msg.userId === user?.id ? 'bg-primary/20 border border-primary/20 text-white rounded-tr-none' : 'glass border border-white/10 text-white/90 rounded-tl-none'
                               }`}>
                                   <div className="flex items-center justify-between gap-4">
                                      <Link href={`/profile/${msg.userId}`} className={`text-[9px] font-black uppercase tracking-widest block hover:text-white transition-colors flex items-center gap-1.5 ${msg.isAdmin ? 'text-rose-500' : msg.userId === user?.id ? 'text-primary' : 'text-primary/70'}`}>
                                          {msg.isAdmin && <ShieldCheck className="w-3 h-3" />}
                                          {msg.username}
                                          {msg.isAdmin && <span className="bg-rose-500/20 px-1 rounded text-[7px] italic border border-rose-500/30">Admin</span>}
                                      </Link>
                                      <div className="text-[8px] opacity-30 font-bold">{msg.time}</div>
                                   </div>
                                   
                                   <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                                   
                                   {/* Reactions Display */}
                                   {msg.reactions.length > 0 && (
                                     <div className="flex flex-wrap gap-1 mt-2">
                                        {Array.from(new Set(msg.reactions.map((r: any) => r.emoji))).map((emoji: any) => {
                                          const count = msg.reactions.filter((r: any) => r.emoji === emoji).length
                                          const active = msg.reactions.some((r: any) => r.user_id === user?.id && r.emoji === emoji)
                                          return (
                                            <button key={emoji} onClick={() => handleReaction(msg.id, emoji)} className={`px-1.5 py-0.5 rounded-full text-[10px] flex items-center gap-1 border transition-all ${active ? 'bg-primary/30 border-primary text-white' : 'glass border-white/5 text-white/40 hover:border-white/20'}`}>
                                               {emoji} <span className="text-[8px] font-black">{count}</span>
                                            </button>
                                          )
                                        })}
                                     </div>
                                   )}
                               </div>

                               {/* Message Actions */}
                               <div className={`absolute -top-3 ${msg.userId === user?.id ? 'right-full mr-2' : 'left-full ml-2'} hidden group-hover:flex items-center gap-1 bg-black/80 backdrop-blur-xl border border-white/10 p-1 rounded-xl shadow-2xl z-20`}>
                                   <button onClick={() => setReplyTo(msg)} className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors" title="Reply"><Reply className="w-3 h-3" /></button>
                                   <button onClick={() => setShowEmojiPicker(msg.id)} className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors" title="React"><Smile className="w-3 h-3" /></button>
                                   {isAdmin && (
                                     <button onClick={() => handleDeleteMessage(msg.id)} className="p-1.5 hover:bg-rose-500/20 rounded-lg text-rose-500/50 hover:text-rose-500 transition-colors" title="Delete"><Trash2 className="w-3 h-3" /></button>
                                   )}
                               </div>

                               {/* Emoji Picker Overlay */}
                               {showEmojiPicker === msg.id && (
                                 <div className={`absolute -top-12 ${msg.userId === user?.id ? 'right-0' : 'left-0'} flex gap-1 p-1.5 glass-darker border border-white/20 rounded-2xl shadow-2xl z-30 animate-reveal shrink-0`}>
                                    {['🔥', '🎮', '❤️', '👑', '💪', '🧊'].map(e => (
                                      <button key={e} onClick={() => handleReaction(msg.id, e)} className="hover:scale-125 transition-transform text-sm">{e}</button>
                                    ))}
                                    <button onClick={() => setShowEmojiPicker(null)} className="ml-1 text-[10px] text-white/20 hover:text-white transition-colors">×</button>
                                 </div>
                               )}
                           </div>
                        </div>
                      </div>
                    )
                  })
                )
              )}
           </div>

           {/* Input Section */}
           <div className={`p-6 border-t border-white/10 bg-white/5 ${(!user && mode === 'support') ? 'opacity-20 pointer-events-none' : ''}`}>
              {!user && mode === 'global' ? (
                 <div className="text-center py-2">
                    <button onClick={() => window.location.href='/auth/login'} className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic hover:underline">შედით ჩატში მონაწილეობისთვის</button>
                 </div>
              ) : (
                <form onSubmit={handleSend} className="relative flex items-center gap-2">
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                  {mode === 'support' && (
                    <button type="button" disabled={isUploading} onClick={() => fileInputRef.current?.click()} className="w-12 h-12 rounded-xl glass hover:bg-white/10 flex items-center justify-center transition-all shrink-0 text-white/50 hover:text-white">
                        {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
                    </button>
                  )}
                  <div className="relative flex-1">
                      {/* Reply Bar */}
                      {replyTo && (
                        <div className="absolute -top-12 left-0 right-0 bg-primary/20 backdrop-blur-xl border border-primary/30 p-2 rounded-t-xl flex items-center justify-between animate-reveal">
                           <div className="flex items-center gap-2 truncate pr-4">
                              <Reply className="w-3 h-3 text-primary" />
                              <span className="text-[9px] font-black uppercase text-white/50 truncate">Replying to <span className="text-white">{replyTo.username}</span></span>
                           </div>
                           <button onClick={() => setReplyTo(null)} className="w-6 h-6 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors">
                              <X className="w-3 h-3 text-white" />
                           </button>
                        </div>
                      )}

                      <Input 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={mode === 'support' ? "დაწერეთ..." : "Tactical Comms..."}
                        className={`h-12 bg-black/40 border-white/10 rounded-xl pl-4 pr-12 text-white placeholder:text-white/20 focus:border-primary/50 transition-all font-medium ${mode === 'global' ? 'italic' : ''} ${replyTo ? 'rounded-t-none' : ''}`}
                      />
                      <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary/80 transition-all active:scale-95">
                          <Send className="w-4 h-4" />
                      </button>
                  </div>
                </form>
              )}
              <div className="mt-4 text-[9px] text-center font-black text-white/20 uppercase tracking-[0.3em]">
                 PUBG Arena Secure Comms
              </div>
           </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 shadow-2xl relative ${
          isOpen 
            ? 'bg-white text-black rotate-90' 
            : 'bg-primary text-white hover:scale-110 active:scale-95'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-8 h-8" />}
        {!isOpen && unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-4 border-background animate-bounce shadow-lg">
            {unreadCount}
          </div>
        )}
      </button>
    </div>
  )
}
