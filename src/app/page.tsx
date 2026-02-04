"use client"

import * as React from "react"
import { Navbar } from "@/components/navbar"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { Loader2, Sparkles, Copy, Check, History } from "lucide-react"

// Define the interface to fix the 'any' error
interface PromptHistory {
  id: string;
  original_text: string;
  architected_prompt: string;
  score: number;
  created_at: string;
}

export default function Home() {
  const [input, setInput] = React.useState("")
  const [score, setScore] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(false)
  const [masterPrompt, setMasterPrompt] = React.useState("")
  const [copied, setCopied] = React.useState(false)
  // Use the interface for the history state
  const [history, setHistory] = React.useState<PromptHistory[]>([])

  const fetchHistory = async () => {
    const { data } = await supabase
      .from('prompts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3)
    if (data) setHistory(data)
  }

  React.useEffect(() => {
    fetchHistory()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInput(val)
    const lengthScore = Math.min(Math.round((val.length / 80) * 100), 100)
    setScore(lengthScore)
  }

  const generateMasterPrompt = async () => {
    if (!input) return
    setIsLoading(true)
    try {
      const response = await fetch("/api/grade", {
        method: "POST",
        body: JSON.stringify({ prompt: input }),
      })
      const data = await response.json()
      setMasterPrompt(data.feedback)
      fetchHistory()
    } catch {
      console.error("Architect Error")
    } finally {
      setIsLoading(false)
    }
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
    <main className="min-h-screen flex flex-col bg-background text-foreground relative overflow-hidden transition-colors duration-500 pb-20">
      <div className="absolute top-[-5%] left-[-5%] w-150 h-150 bg-purple-500/10 dark:bg-purple-900/20 rounded-full blur-[120px] animate-blob" />
      <div className="absolute bottom-[-5%] right-[-5%] w-150 h-150 bg-emerald-500/10 dark:bg-emerald-900/10 rounded-full blur-[120px] animate-blob animation-delay-2000" />

      <Navbar />

      <div className="flex-1 container max-w-200 mx-auto flex flex-col items-center justify-center p-6 space-y-12 relative z-10">

        <div className="text-center space-y-6">
          <h1 className="text-7xl md:text-8xl font-black tracking-tight bg-clip-text text-transparent bg-linear-to-b from-foreground to-foreground/40 leading-none">
            Lumina<span className="text-emerald-500">.ai</span>
          </h1>
          <p className="text-muted-foreground text-xl font-light tracking-wide max-w-125 mx-auto leading-relaxed">
            &quot;Refining raw thoughts into <span className="text-foreground font-medium">precision engineered</span> intent.&quot;
          </p>
        </div>

        <div className="w-full grid gap-6 max-w-150">
          <div className="p-8 rounded-[2rem] border border-border bg-card/40 backdrop-blur-2xl shadow-2xl space-y-6">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Confidence Radar</span>
                <p className="text-sm font-semibold tracking-tight italic">
                  {score < 40 ? "Needs more context..." : score < 85 ? "Logic forming..." : "Prompt Optimized"}
                </p>
              </div>
              <span className={`text-4xl font-mono font-bold tracking-tighter transition-all ${score >= 90 ? "text-emerald-500 scale-110" : "text-muted-foreground"}`}>
                {score}%
              </span>
            </div>
            <Progress value={score} className={`h-2 transition-all duration-1000 ease-in-out bg-secondary ${getRadarClasses()}`} />
          </div>

          <div className="relative group">
            <Input
              placeholder="Describe your idea in messy language..."
              value={input}
              onChange={handleInputChange}
              className="h-24 text-xl px-10 rounded-[2rem] border-border bg-card/40 backdrop-blur-3xl focus-visible:ring-emerald-500/30 transition-all shadow-xl"
            />
            {score >= 85 && (
              <Button onClick={generateMasterPrompt} disabled={isLoading} className="absolute right-4 top-4 bottom-4 rounded-[1.5rem] bg-emerald-600 hover:bg-emerald-500 text-white px-10 shadow-xl shadow-emerald-500/20 transition-all">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
                {isLoading ? "" : "Architect"}
              </Button>
            )}
          </div>
        </div>

        {masterPrompt && (
          <div className="w-full max-w-150 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="rounded-[2.5rem] border border-border bg-linear-to-br from-card/60 to-background/20 backdrop-blur-md p-10 space-y-6 relative shadow-2xl">
              <div className="flex justify-between items-center border-b border-border pb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Architected Output</span>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(masterPrompt)} className="hover:bg-secondary rounded-full">
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                </Button>
              </div>
              <p className="text-foreground/90 leading-relaxed font-mono text-sm whitespace-pre-wrap italic">
                {masterPrompt}
              </p>
            </div>
          </div>
        )}

        {/* History List */}
        <div className="w-full max-w-150 pt-10 space-y-6">
          <div className="flex items-center gap-2 px-4">
            <History className="w-4 h-4 text-zinc-500" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Recent Architecture</h2>
          </div>
          <div className="grid gap-4">
            {history.map((item) => (
              <div key={item.id} className="p-6 rounded-3xl border border-border bg-card/20 hover:bg-card/40 transition-colors cursor-pointer group">
                <p className="text-zinc-500 text-xs truncate mb-2">{item.original_text}</p>
                <p className="text-foreground text-sm font-medium line-clamp-1">{item.architected_prompt}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}