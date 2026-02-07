"use client"

import * as React from "react"
import { Navbar } from "@/components/navbar"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { AuthModal } from "@/components/auth-modal" 
import { Copy, Check, History, MessageSquare, Plus, User, Bot, Send, XCircle, RotateCcw } from "lucide-react"
import { type User as SupabaseUser } from "@supabase/supabase-js"

interface PromptHistory {
  id: string;
  original_text: string;
  architected_prompt: string;
  score: number;
  created_at: string;
  title?: string; 
  chat_history?: Message[]; 
}

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function Home() {
  const [input, setInput] = React.useState("")
  const [activeMode, setActiveMode] = React.useState("General")
  const [score, setScore] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(false)
  const [masterPrompt, setMasterPrompt] = React.useState("")
  const [copied, setCopied] = React.useState(false)
  const [history, setHistory] = React.useState<PromptHistory[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true)
  const [messages, setMessages] = React.useState<Message[]>([])
  const [showEndOptions, setShowEndOptions] = React.useState(false)
  const [currentSessionId, setCurrentSessionId] = React.useState<string | null>(null)

  const [user, setUser] = React.useState<SupabaseUser | null>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false)

  const chatEndRef = React.useRef<HTMLDivElement>(null)
  const hasStarted = messages.length > 0;

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  React.useEffect(() => {
    if (hasStarted) scrollToBottom()
  }, [messages, isLoading, hasStarted])

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session) handleEndChat() 
    })
    return () => subscription.unsubscribe()
  }, [])

  const fetchHistory = React.useCallback(async () => {
    if (!user) {
      setHistory([])
      return
    }
    const { data } = await supabase
      .from('prompts')
      .select('*')
      .eq('user_id', user.id) 
      .order('created_at', { ascending: false })
      .limit(10)
    if (data) setHistory(data)
  }, [user])

  React.useEffect(() => { fetchHistory() }, [fetchHistory])

  const loadProject = (item: PromptHistory) => {
    if (item.chat_history && item.chat_history.length > 0) {
      setMessages(item.chat_history);
    } else {
      setMessages([
        { role: "user", content: item.original_text },
        { role: "ai", content: "Architecture successfully restored from your history." }
      ]);
    }
    setScore(item.score);
    setMasterPrompt(item.architected_prompt);
    setCurrentSessionId(item.id);
    setShowEndOptions(false);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const deleteProject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); 
    const { error } = await supabase.from('prompts').delete().eq('id', id);
    if (!error) {
      setHistory(prev => prev.filter(item => item.id !== id));
      if (currentSessionId === id) handleEndChat();
    }
  };

  const generateMasterPrompt = async (forcedInput?: string) => {
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }

    const textToProcess = forcedInput || input;
    if (!textToProcess.trim() || isLoading) return
    
    const userMsg: Message = { role: "user", content: textToProcess }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput("") 
    setIsLoading(true)
    setShowEndOptions(false);

    try {
      const response = await fetch("/api/grade", {
        method: "POST",
        body: JSON.stringify({ 
          prompt: textToProcess, 
          mode: activeMode,
          history: updatedMessages.map(m => ({ role: m.role === "user" ? "user" : "assistant", parts: [{ text: m.content }] }))
        }),
      })
      const data = await response.json()
      const aiResponse: Message = { role: "ai", content: data.feedback || data.architected_prompt || "Processing..." }
      const finalHistory = [...updatedMessages, aiResponse]
      
      setScore(data.score || 10)
      
      if (data.score >= 100 && data.architected_prompt && !masterPrompt) {
        setMasterPrompt(data.architected_prompt)
        setMessages(prev => [...prev, { 
            role: "ai", 
            content: "Architecture complete! I have generated your refined prompt below. Would you like to stay to refine this further, or end this session?" 
        }])
        setShowEndOptions(true);

        const uniqueTitle = textToProcess.split(" ").slice(0, 3).join(" ") + "...";

        const { data: saved } = await supabase.from('prompts').insert([
          { 
            original_text: textToProcess, 
            architected_prompt: data.architected_prompt, 
            score: data.score, 
            title: uniqueTitle, 
            user_id: user.id,
            chat_history: finalHistory
          }
        ]).select().single()
        
        if (saved) setCurrentSessionId(saved.id)
        fetchHistory()
      } else {
        setMessages(finalHistory)
        if (currentSessionId) {
          await supabase.from('prompts').update({ 
            architected_prompt: data.architected_prompt || masterPrompt,
            score: data.score,
            chat_history: finalHistory
          }).eq('id', currentSessionId)
          fetchHistory()
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: "ai", content: "Architect failed to respond." }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleEndChat = () => {
    setMessages([]); setMasterPrompt(""); setScore(0); setInput(""); setShowEndOptions(false); setCurrentSessionId(null);
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getRadarClasses = () => {
    if (score === 0) return "bg-secondary"
    if (score < 40) return "[&>div]:bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]"
    if (score < 85) return "[&>div]:bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
    return "[&>div]:bg-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.5)]"
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden text-foreground no-scrollbar transition-colors duration-500">
      
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      <aside className={`bg-zinc-50/50 dark:bg-zinc-950/20 border-r border-border transition-all duration-300 h-full flex flex-col no-scrollbar ${isSidebarOpen ? "w-72" : "w-0 opacity-0 pointer-events-none"}`}>
        <div className="w-72 p-4 pt-24 flex flex-col h-full no-scrollbar">
          <Button variant="outline" onClick={handleEndChat} className="w-full justify-start gap-3 rounded-xl border-emerald-500/10 text-emerald-500 mb-10 font-bold uppercase tracking-widest transition-all"><Plus className="w-4 h-4" /> New Architecture</Button>
          
          {user && (
            <div className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
              <p className="px-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2"><History className="w-3 h-3" /> Recent History</p>
              {history.map((item) => (
                <div key={item.id} className="relative group">
                  <button 
                    onClick={() => loadProject(item)} 
                    className="w-full flex items-center gap-2 px-3 py-3 text-[13px] text-zinc-500 hover:text-foreground hover:bg-zinc-500/5 rounded-xl transition-all group-hover:pr-10"
                  >
                    <MessageSquare className="w-3 h-3 opacity-40 group-hover:opacity-100" /> 
                    <span className="truncate font-medium">{item.title || "Architecture"}</span>
                  </button>
                  <button
                    onClick={(e) => deleteProject(e, item.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative h-full overflow-hidden no-scrollbar">
        {/* UPDATED: Navbar now correctly triggers the Auth Modal */}
        <Navbar 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          onSignInClick={() => setIsAuthModalOpen(true)}
        />

        <div className="flex-1 container max-w-220 mx-auto flex flex-col relative z-10 h-full no-scrollbar">
          
          <div className={`flex-1 overflow-y-auto space-y-8 no-scrollbar scroll-smooth ${hasStarted ? "pt-32 pb-80" : "flex flex-col items-center justify-center pb-40"}`}>
            {!hasStarted ? (
              <div className="text-center space-y-6">
                <h1 className="text-7xl md:text-8xl font-black tracking-tight bg-clip-text text-transparent bg-linear-to-b from-foreground to-foreground/40 leading-none uppercase">Lumina<span className="text-emerald-500">.ai</span></h1>
                <p className="text-muted-foreground text-xl italic font-light tracking-wide">&quot;Refining raw thoughts into precision engineered intent.&quot;</p>
              </div>
            ) : (
              <div className="space-y-8 w-full max-w-180 mx-auto">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in`}>
                    <div className={`p-8 rounded-[2.5rem] max-w-[85%] border shadow-2xl ${msg.role === "user" ? "bg-emerald-500/10 border-emerald-500/20" : "bg-card/40 border-border backdrop-blur-3xl"}`}>
                       <div className="flex items-center gap-2 mb-4 opacity-30">
                          {msg.role === "user" ? <User className="w-3 h-3 text-emerald-500" /> : <Bot className="w-3 h-3" />}
                          <span className="text-[9px] uppercase font-black">{msg.role === "user" ? "Intent" : "Architect"}</span>
                        </div>
                        <p className="text-sm italic leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}

                {showEndOptions && (
                  <div className="flex justify-center gap-4 animate-in slide-in-from-bottom-5">
                    <Button onClick={() => setShowEndOptions(false)} className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-full border border-emerald-500/20 gap-2 px-6">
                        <RotateCcw className="w-4 h-4" /> Stay and Refine
                    </Button>
                    <Button onClick={handleEndChat} className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-full border border-rose-500/20 gap-2 px-6">
                        <XCircle className="w-4 h-4" /> End Session
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            {masterPrompt && score >= 90 && (
              <div className="w-full max-w-160 mx-auto animate-in zoom-in-95 duration-700 pb-20">
                <div className="rounded-[2.5rem] border border-border bg-linear-to-br from-card/60 to-background/20 backdrop-blur-md p-10 space-y-6 relative shadow-2xl">
                  <div className="flex justify-between items-center border-b border-border pb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Architected Output ({activeMode})</span>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(masterPrompt)} className="hover:bg-secondary rounded-full">
                      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                    </Button>
                  </div>
                  <p className="text-foreground/90 leading-relaxed font-mono text-sm whitespace-pre-wrap italic">{masterPrompt}</p>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className={`fixed bottom-0 right-0 p-8 bg-linear-to-t from-background via-background/95 to-transparent z-30 transition-all ${isSidebarOpen ? "md:left-72" : "left-0"}`}>
            <div className="max-w-140 mx-auto space-y-5">
              <div className="p-6 rounded-[1.8rem] border border-border bg-card/60 backdrop-blur-2xl shadow-2xl space-y-3">
                <div className="flex justify-between items-center px-2">
                  <span className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em]">Confidence Radar</span>
                  <span className="text-2xl font-mono font-bold tracking-tighter">{score}%</span>
                </div>
                <Progress value={score} className={`h-1 transition-all duration-1000 ${getRadarClasses()}`} />
              </div>
              <div className="flex justify-center gap-2">
                {["General", "Technical", "Creative", "Academic"].map((m) => (
                  <button key={m} onClick={() => setActiveMode(m)} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border transition-all ${activeMode === m ? "bg-emerald-500 text-black border-emerald-500 shadow-lg" : "bg-card/20 text-muted-foreground border-border"}`}>{m}</button>
                ))}
              </div>
              <div className="relative group shadow-2xl">
                <Input 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  onKeyDown={(e) => e.key === "Enter" && generateMasterPrompt()} 
                  placeholder={user ? "Describe your intent..." : "Sign in to start chatting..."}
                  onClick={() => !user && setIsAuthModalOpen(true)}
                  className={`h-14 text-base px-8 rounded-full border-border bg-card/60 backdrop-blur-3xl shadow-xl ${!user ? "cursor-pointer" : ""}`} 
                />
                <Button onClick={() => generateMasterPrompt()} disabled={isLoading} className="absolute right-2 top-2 bottom-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white px-6 transition-all active:scale-95"><Send className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}